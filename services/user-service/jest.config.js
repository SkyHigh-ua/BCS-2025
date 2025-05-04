module.exports = {
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { diagnostics: { warnOnly: true } }],
  },
  transformIgnorePatterns: ["/node_modules/(?!some-esm-package)"],
};
