/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allow longer subject lines for descriptive commits
    "header-max-length": [2, "always", 120],
    // Enforce lowercase type (feat, fix, chore, etc.)
    "type-case": [2, "always", "lower-case"],
    // Disallow blank lines in body
    "body-leading-blank": [1, "always"],
  },
};
