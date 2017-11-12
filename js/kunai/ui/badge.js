const sanitize = (badges) => {
  let i = 0

  for (let b_raw of badges) {
    ++i

    let b = $(b_raw)
    const b_classes = b.attr('class').split(/\s+/).map(t => t.trim())
    let classes = []
    // const clean_txt = b.text().trim().replace(/\(([^)]+)\)/, '$1')

    let deprecated_or_removed = false
    let cppv = null
    for (const c of b_classes) {
      const cppm = c.match(/^cpp(\d[\da-zA-Z])(.*)$/)
      if (!cppm) continue

      b.attr('data-cpp-version', cppm[1])
      if (cppm[1].length) {
        cppv = cppm[1]
      }

      if (c.match(/deprecated$/)) {
        deprecated_or_removed = true
        classes.push('deprecated-spec')
      } else if (c.match(/removed$/)) {
        deprecated_or_removed = true
        classes.push('removed-spec')
      }
    }

    if (!deprecated_or_removed) {
      classes.push('added-in-spec')
    }

    b.addClass(classes.join(' '))

    const lang_path = cppv ? `/lang/cpp${cppv}` : `/lang`

    b.empty().append(
      $('<a>', {href: `${lang_path}.html`})
        .append($('<i>'))
        // .append($('<span>').text(clean_txt))
    )
  }
  return i
}

export {sanitize}

