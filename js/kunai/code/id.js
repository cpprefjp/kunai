import {KunaiError} from '../error'

class NonExistentIDError extends KunaiError {
  constructor() {
    super(...arguments)
  }
}

class ID {
  static DataAttr = 'data-kunai-yata-id'
  static R = /([a-zA-Z][a-zA-Z0-9_]+)-(\d+)/

  constructor(lang, key) {
    this.lang = String(lang)
    this.key = key
  }

  equals(rhs) {
    if (!(rhs instanceof ID)) {
      throw new Error(`rhs must be instanceof ID`, rhs)
    }
    return this.lang === rhs.lang && this.key === rhs.key
  }

  toString() {
    return `#${this.lang}-${this.key}`
  }

  serialize() {
    return `${this.lang}-${this.key}`
  }

  makeSelector() {
    return `[${ID.DataAttr}="${this.serialize()}"]`
  }

  serializeInDOM(dom) {
    return $(dom).attr(ID.DataAttr, this.serialize())
  }

  static fromDOM(dom) {
    const str = $(dom).attr(ID.DataAttr)
    if (!str || !str.length) {
      throw new NonExistentIDError(`specified dom element does not have yata key '${ID.DataAttr}'`, dom)
    }

    const m = str.match(ID.R)
    if (!m) {
      throw Error(`unrecognized code id format '${str}'`, dom)
    }
    return new ID(m[1], parseInt(m[2]))
  }
}

export {NonExistentIDError, ID}

