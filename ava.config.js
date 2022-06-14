module.exports = {
  files: ['tests/**/*.ts'],
  // extensions: ['ts'],
  typescript: {
    rewritePaths: {
      'tests/': 'lib/tests/',
    },
    compile: false,
  },
  // require: ['ts-node/register', 'source-map-support/register'],
  // require: ['source-map-support/register'],
}
