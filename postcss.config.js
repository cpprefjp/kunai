module.exports = ({file, options, env}) => {
  if (['.scss', '.sass'].includes(file.extname)) {
    return {
      plugins: {
        'autoprefixer': {},
      }
    }

  } else {
    return {
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
        'cssnano': options.env === 'production' ? Object.assign({}, options.cssnano || {}, {autoprefixer: false}) : false,
      },
    }
  }
}

