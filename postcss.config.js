const path = require('path');
const resolve = require('@csstools/sass-import-resolve');

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
      plugins: [
        //require('postcss-import')({
        //  from: file.dirname,
        //}),
        require('postcss-advanced-variables')({
          importResolve: (id, cwd) => {
            // https://github.com/jonathantneal/postcss-advanced-variables/issues/74
            // このバグのせいで importPaths が使い物にならないので、
            // importResolve で頑張って import する
            const dirs = [cwd, path.resolve(__dirname, 'node_modules/normalize.css/'), path.resolve(__dirname, 'node_modules/')]
            const promises = dirs.map(dir => {
              return resolve(id, {
                cwd: dir,
                readFile: true,
              }).then(resolved => {
                if (!resolved) {
                  throw new Error('File to import not found or unreadable');
                }
                return resolved;
              });
            });
            return Promise.allSettled(promises).then(results => {
              for (const r of results) {
                if (r.status === 'fulfilled') {
                  return r.value;
                }
              }
              throw new Error('File to import not found');
            });
          }
        }),
        require('autoprefixer')({}),
        require('postcss-mixins')({}),
        require('postcss-nesting')({}),
        require('postcss-nested')({}),
        require('cssnano')({
          preset: ['default', {
            // 複雑な最適化を無効化
            calc: false,
            zindex: false,
            mergeRules: false,
            minifyGradients: false,
            // セレクタの深さを制限
            minifySelectors: false,
            // 既存設定を維持
            autoprefixer: false,
            reduceIdents: false
          }]
        }),
        require('postcss-color-function')({}),
        require('postcss-calc')({
          warnWhenCannotResolve: true,
          // mediaQueries: true,
          // selectors: true,
        }),
      ],
    }
  }
}

