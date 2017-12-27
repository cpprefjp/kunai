import {KunaiError} from '../error'

class NonExistentIDError extends KunaiError {
  constructor() {
    super(...arguments)
  }
}

class ID {
  static DataAttr = 'data-kunai-yata-id'
  static R = /([a-zA-Z][a-zA-Z0-9_]+)-(\d+)/

  constructor(key) {
    this.key = key
  }

  equals(rhs) {
    if (!(rhs instanceof ID)) {
      throw new Error(`rhs must be instanceof ID`, rhs)
    }
    return this.key === rhs.key
  }

  toString() {
    return `#${this.key}`
  }

  serialize() {
    return `${this.key}`
  }

  makeSelector() {
    return this.toString()
  }
}

export {NonExistentIDError, ID}

