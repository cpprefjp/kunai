module.exports = ({file, options, env}) => ({
  parser: 'postcss-scss',
  plugins: {
    'postcss-import': {
      from: file.dirname,
    },
    'postcss-mixins': {},
    'postcss-advanced-variables': {},
    'postcss-nesting': {},
    'postcss-nested': {},
    'postcss-calc': {
      warnWhenCannotResolve: true,
      // mediaQueries: true,
      // selectors: true,
    },
    'postcss-color-function': {},
    // 'postcss-strip-inline-comments': {},
    'autoprefixer': {},
    'cssnano': options.env === 'production' ? options.cssnano : false,
  },
})

