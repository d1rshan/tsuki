export function usernamePrefixPattern(prefix: string) {
  return `${prefix.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`;
}
