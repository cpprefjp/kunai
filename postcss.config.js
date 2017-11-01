module.exports = ({file, options, env}) => ({
  parser: 'postcss-scss',
  plugins: {
    // 'postcss-import': {
      // root: file.dirname,
    // },
    'precss': {
    },
    'postcss-calc': {
      warnWhenCannotResolve: true,
      // mediaQueries: true,
      // selectors: true,
    },
    'postcss-color-function': {},
    'autoprefixer': env === 'production' ? options.autoprefixer : false,
    'cssnano': env === 'production' ? options.cssnano : false,
  }
})

