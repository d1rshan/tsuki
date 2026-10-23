#!/usr/bin/env bash
# Requires the web/API dev servers and the agent-browser CLI.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
base_url="${1:-http://localhost:3000}"
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix media-navigation-check)"
export AGENT_BROWSER_RESTORE="$AGENT_BROWSER_SESSION"

cleanup() {
  local result=$?
  if (( result != 0 )); then
    agent-browser eval 'window.__mediaNavigationCheck && ({href:window.__mediaNavigationCheck.href,blocked:window.__mediaNavigationCheck.blocked})' || true
  fi
  agent-browser close >/dev/null 2>&1 || true
  exit "$result"
}
trap cleanup EXIT

modal_ready='location.pathname === window.__mediaNavigationCheck.href && [...document.querySelectorAll("[role=dialog]")].some(dialog => dialog.getBoundingClientRect().width > 0 && dialog.querySelector("h1")?.textContent === window.__mediaNavigationCheck.title)'
modal_closed='location.pathname + location.search === window.__mediaNavigationCheck.background && [...document.querySelectorAll("[role=dialog]")].every(dialog => dialog.getBoundingClientRect().width === 0)'
full_page_ready='(() => { const expected = JSON.parse(sessionStorage.getItem("tsuki-media-navigation-check")); return location.pathname === expected.href && document.querySelector("main h1")?.textContent === expected.title && [...document.querySelectorAll("[role=dialog]")].every(dialog => dialog.getBoundingClientRect().width === 0); })()'

assert_background() {
  agent-browser eval --stdin <<'JS'
(() => {
const expected = window.__mediaNavigationCheck;
const actual = [...document.querySelectorAll('main a[href^="/anime/"], main a[href^="/manga/"]')]
  .filter(link => link.querySelector("h3"))
  .map(link => [link.getAttribute("href"), link.querySelector("h3").textContent.trim()]);
if (JSON.stringify(actual) !== JSON.stringify(expected.grid)) {
  throw new Error("Opening/closing the modal changed the background discovery results");
}
return "PASS background grid unchanged";
})()
JS
}

check_grid() {
  local path="$1"
  agent-browser --restore --headed --enable react-devtools open "$base_url/$path"
  agent-browser wait --fn '!!document.querySelector("main a h3") && !document.querySelector("main [aria-busy=true]")'
  agent-browser wait --fn 'window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.size > 0 && [...document.querySelectorAll("main a")].some(link => Object.keys(link).some(key => key.startsWith("__reactProps$")))'

  agent-browser eval --stdin <<'JS'
const link = [...document.querySelectorAll('main a[href^="/anime/"], main a[href^="/manga/"]')]
  .find(element => element.getBoundingClientRect().width > 0);
if (!link) throw new Error("No visible media card found");
link.setAttribute("data-media-navigation-check", "");
window.__mediaNavigationCheck = {
  href: link.getAttribute("href"),
  title: link.querySelector("h3").textContent.trim(),
  background: location.pathname + location.search,
  grid: [...document.querySelectorAll('main a[href^="/anime/"], main a[href^="/manga/"]')]
    .filter(link => link.querySelector("h3"))
    .map(link => [link.getAttribute("href"), link.querySelector("h3").textContent.trim()]),
  blocked: [],
};
const originalFetch = window.fetch;
window.fetch = function(input, options) {
  const url = new URL(input instanceof Request ? input.url : String(input), location.href);
  const headers = new Headers(options?.headers ?? (input instanceof Request ? input.headers : undefined));
  if (/\/media\/(ANIME|MANGA)\/\d+\/?$/.test(url.pathname) || url.searchParams.has("_rsc") || headers.get("RSC") === "1") {
    window.__mediaNavigationCheck.blocked.push(url.pathname + url.search);
    return Promise.reject(new Error("Media navigation attempted a detail or RSC request"));
  }
  return originalFetch.call(this, input, options);
};
"Installed detail/RSC request blocker";
JS

  agent-browser click '[data-media-navigation-check]'
  agent-browser wait --fn "$modal_ready"
  assert_background
  agent-browser back
  agent-browser wait --fn "$modal_closed"
  assert_background
  agent-browser forward
  agent-browser wait --fn "$modal_ready"
  assert_background
  agent-browser find role button click --name Close --exact
  agent-browser wait --fn "$modal_closed"
  assert_background
  agent-browser eval --stdin <<'JS'
const check = window.__mediaNavigationCheck;
if (!check) throw new Error("Navigation replaced the document instead of using loaded media");
if (check.blocked.length) throw new Error(JSON.stringify(check.blocked));
`PASS ${check.href}: loaded details, Back/Forward, Close; zero detail/RSC requests`;
JS

  agent-browser forward
  agent-browser wait --fn "$modal_ready"
  agent-browser eval 'sessionStorage.setItem("tsuki-media-navigation-check", JSON.stringify(window.__mediaNavigationCheck))'
  agent-browser reload
  agent-browser wait --fn "$full_page_ready"
  agent-browser wait --fn '!window.history.state?.tsukiMediaModal'
  agent-browser back
  agent-browser wait --fn '(() => { const expected = JSON.parse(sessionStorage.getItem("tsuki-media-navigation-check")); return location.pathname + location.search === expected.background && [...document.querySelectorAll("[role=dialog]")].every(dialog => dialog.getBoundingClientRect().width === 0); })()'
  agent-browser forward
  agent-browser wait --fn "$full_page_ready"
  agent-browser eval '"PASS refresh -> Back -> Forward: full details page, no modal"'
}

check_grid '?type=ANIME'
check_grid '?type=MANGA'
check_grid '?type=ANIME&q=hero'
check_grid '?type=MANGA&q=hero'

# Simulate a modal history entry from an earlier provider instance: it has an
# identity marker but no in-memory details, so Forward must fetch the detail API.
agent-browser eval --stdin <<'JS'
const expected = JSON.parse(sessionStorage.getItem("tsuki-media-navigation-check"));
const [, kind, id] = expected.href.split("/");
const type = kind === "anime" ? "ANIME" : "MANGA";
window.__mediaFallbackRequests = [];
const originalFetch = window.fetch;
window.fetch = function(input, options) {
  const url = new URL(input instanceof Request ? input.url : String(input), location.href);
  if (/\/media\/(ANIME|MANGA)\/\d+\/?$/.test(url.pathname)) {
    window.__mediaFallbackRequests.push(url.pathname);
  }
  return originalFetch.call(this, input, options);
};
history.pushState({ tsukiMediaModal: {
  entryId: "previous-provider-instance", type, id: Number(id), search: "",
} }, "", expected.href);
"Inserted an old identity-only history entry";
JS
agent-browser back
agent-browser wait --fn "$full_page_ready"
agent-browser forward
agent-browser wait --fn '(() => { const expected = JSON.parse(sessionStorage.getItem("tsuki-media-navigation-check")); return [...document.querySelectorAll("[role=dialog]")].some(dialog => dialog.getBoundingClientRect().width > 0 && dialog.querySelector("h1")?.textContent === expected.title); })()'
agent-browser eval --stdin <<'JS'
if (window.__mediaFallbackRequests.length !== 1) {
  throw new Error(`Expected one detail fallback request, got ${JSON.stringify(window.__mediaFallbackRequests)}`);
}
sessionStorage.removeItem("tsuki-media-navigation-check");
"PASS identity-only history entry fetches details";
JS

echo 'Media navigation checks passed.'
