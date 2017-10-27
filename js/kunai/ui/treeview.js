const LangLink = {
  '11': '/lang/cpp11.html',
  '14': '/lang/cpp14.html',
  '17': '/lang/cpp17.html',
  '20': '/lang/cpp20.html',
}

function makeLangLink(key) {
  return LangLink[key]
}


class Treeview {
  constructor(log) {
    this.log = log.make_context(this.constructor.name)

    this.log.info('initialzing...')

    const main = $('main[role="main"]')

    // FIXME: idにしないとこれヤバい
    let raw = main.find('.tree')
    if (!raw.length) {
      this.log.error(`tree view DOM element not found (.tree)`)
      return
    }

    // バッジからカッコを外す（見た目の問題）
    {
      let badges = raw.find('.cpp-sidebar')
      for (let b_raw of badges) {
        let b = $(b_raw)
        const clean_txt = b.text().trim().replace(/\(([^)]+)\)/, '$1')
        const maybe_cpp_ver = b.text().trim().match(/C\+\+[a-zA-Z0-9]+/i)

        let link = null
        if (maybe_cpp_ver) {
          switch (maybe_cpp_ver[0]) {
            case 'C++11':
              link = makeLangLink('11')
              break
            case 'C++14':
              link = makeLangLink('14')
              break
            case 'C++17':
              link = makeLangLink('17')
              break
            case 'C++20':
              link = makeLangLink('20')
              break
          }
        }

        if (link) {
          b.html($('<a>').attr('href', link).text(clean_txt))
        }
      }
    }

    this.log.info('initialized.')
  }
}

export {Treeview}

