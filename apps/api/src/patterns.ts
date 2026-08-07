/**
 * Validation patterns shared across model files. Plain strings, not RegExp,
 * because that is the form TypeBox's `pattern` takes.
 */

/** Absolute http(s) only — these are rendered as-is, so `javascript:` must not pass. */
export const URL_PATTERN = "^https?://";

/** Six-digit hex, `#rrggbb`. */
export const HEX_COLOR_PATTERN = "^#[0-9a-fA-F]{6}$";
