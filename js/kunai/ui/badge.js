const sanitize = (badges) => {
  let i = 0

  for (let b_raw of badges) {
    ++i

    let b = $(b_raw)
    const classes = b.attr('class').split(/\s+/).map(t => t.trim())
    // const clean_txt = b.text().trim().replace(/\(([^)]+)\)/, '$1')

    let deprecated_or_removed = false
    let cppv = null
    for (const c of classes) {
      const cppm = c.match(/^cpp(\d[\da-zA-Z])(.*)$/)
      if (!cppm) continue

      b.attr('data-cpp-version', cppm[1])
      if (cppm[1].length) {
        cppv = cppm[1]
      }

      if (c.match(/deprecated$/)) {
        deprecated_or_removed = true
        b.addClass('deprecated-spec')
      } else if (c.match(/removed$/)) {
        deprecated_or_removed = true
        b.addClass('removed-spec')
      }
    }

    if (!deprecated_or_removed) {
      b.addClass('added-in-spec')
    }

    const lang_path = cppv ? `/lang/cpp${cppv}` : `/lang`

    b.html(
      $('<a>').attr('href', `${lang_path}.html`)
        .append($('<i>'))
        // .append($('<span>').text(clean_txt))
    )
  }
  return i
}

export {sanitize}

