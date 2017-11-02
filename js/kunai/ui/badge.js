const LangLink = {
  '11': '/lang/cpp11.html',
  '14': '/lang/cpp14.html',
  '17': '/lang/cpp17.html',
  '20': '/lang/cpp20.html',
}

const makeLangLink = (key) => {
  return LangLink[key]
}

const sanitize = (badges) => {
  let i = 0

  for (let b_raw of badges) {
    ++i

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
  return i
}

export {sanitize}

