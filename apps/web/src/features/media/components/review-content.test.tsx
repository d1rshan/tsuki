import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ReviewContent } from "./review-content";

describe("ReviewContent", () => {
  test("renders the editor's supported Markdown without rendering HTML", () => {
    const html = renderToStaticMarkup(
      <ReviewContent
        content={
          "## Great\n\n**Loved** the _ending_.\n\n> Worth a rewatch\n\n- One\n- Two\n\n[Source](https://example.com)\n<script>alert(1)</script>"
        }
      />,
    );

    expect(html).toContain("<h2");
    expect(html).toContain(">Great</h2>");
    expect(html).toContain("<strong>Loved</strong>");
    expect(html).toContain("<em>ending.</em>");
    expect(html).toContain("<blockquote");
    expect(html).toContain("<li>One</li>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});
