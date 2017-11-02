module.exports = ({file, options, env}) => ({
  parser: 'postcss-scss',
  plugins: {
    'postcss-import': {
      from: file.dirname,
    },
    'postcss-advanced-variables': {},
    'postcss-nesting': {},
    'postcss-nested': {},
    'postcss-calc': {
      warnWhenCannotResolve: true,
      // mediaQueries: true,
      // selectors: true,
    },
    'postcss-color-function': {},
    // env === 'production' ? 'autoprefixer')(options.autoprefixer) : false,
    // env === 'production' ? 'cssnano')(options.cssnano) : false,
  },
})

