import {ID} from './id'

class CPP {
  constructor(log, id, buf, hints) {
    this.id = id
    this.log = log.makeContext(`CPP #${this.id.key}`)
    this.buf = buf
    this.parse(hints)
  }

  parse(hints) {
    this.headers = []

    for (const line of this.buf.split(/\n/)) {
      const trimmed = line.trim()

      let matched = trimmed.match(/^#include\s*<([^>]+)>/)
      if (matched) {
        const [_, header] = matched
        this.log.debug(`got C++ header '${header}' in code`)
        this.headers.push(header)
      }
    }

    if (hints.headers) {
      for (const h of hints.headers) {
        if (!this.headers.includes(h)) {
          this.log.warn(`already found header '${h}' in meta tag, but it was not written in this code snippet`)
          this.prepend_header(h)
          this.headers.push(h)
        }
      }
    }

    this.log.info('parse ok', this)
  }

  prepend_header(h) {
    this.buf = `#include <${h}>\n` + this.buf
  }
}

export {CPP}

