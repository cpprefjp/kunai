import {KunaiError} from '../error'
import {ID} from './id'


class Pool {
  constructor(log) {
    this.log = log.make_context(this.constructor.name)
    this.langs = new Map
  }

  add(code) {
    if (!this.langs.has(code.id.lang)) {
      this.langs.set(code.id.lang, new Map)
    }
    this.langs.get(code.id.lang).set(code.id.key, code)
  }

  delete(id) {
    if (!this.has(id)) {
      throw new Error(`[BUG] attempt to remove a non existent code (${id})`)
    }
    this.langs.get(id.lang).delete(id.key)
  }

  get(id) {
    if (!this.has(id)) {
      throw new Error(`[BUG] attempt to retrieve a non existent code (${id})`)
    }
    return this.langs.get(id.lang).get(id.key)
  }

  has(id) {
    if (!this.langs.has(id.lang)) {
      return false
    }
    return this.langs.get(id.lang).has(id.key)
  }
} // Pool

export {Pool}

