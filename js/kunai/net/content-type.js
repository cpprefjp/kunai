class ContentType {
  static UNKNOWN = 'unknown'
  static MARKDOWN = 'markdown'

  static parse(url) {
    const ext = url.pathname.match(/(?:\.[^.]+)+$/)
    let type = ContentType.UNKNOWN

    switch (String(ext)) {
      case '.md':
        type = ContentType.MARKDOWN
        break
    }
    return type
  }
}

export {ContentType}

