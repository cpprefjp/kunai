import {NetworkError} from './error'
import {CPPCode} from './parser/cpp'


class APIError extends NetworkError {
  constructor() {
    super(...arguments)
  }
}

const Method = {
  get: Symbol.for('GET'),
  post: Symbol.for('POST'),
}


class API {
  static Home = new URL('https://wandbox.org/api')

  static compile(opts, code, s, f) {
    return API.request(
      Method.post,
      new URL('/compile.json', API.Home),
      opts, code,
      s, f
    )
  }

  static request(method, url, opts, data, s, f) {
    console.time(JSON.stringify({method: method, url: url, id: Date.now()}))

    try {
      switch (method) {
        case Method.get: {
          return API.requestGET(url, opts, data, s, f)
        }
        case Method.post: {
          return API.requestPOST(url, opts, data, s, f)
        }
      }
    } catch (e) {
      this.log.error(e.name, e.message)

    } finally {
      console.timeEnd(JSON.stringify({compile: id}))
    }

  }

  static make_request_json(opts, code) {
    let kv = new Map

    for (const [k, v] of opts) {
      switch (k) {
        case 'compiler': {
          kv.set(k, v)
          break
        }

        case 'options': {
          kv.set(k, v.join(','))
        }

        case 'compiler-option-raw': {
          kv.set(k, v.join("\n"))
        }
      }
    }
    return JSON.stringify(kv)
  }
}


class Wand {
  static defaults = new Map([
    ['compiler', 'clang-head'],
    ['options', ['warning', 'c++2a', 'cpp-pedantic-errors']],
    ['compiler-option-raw', ['-Werror']],
  ])

  constructor(log, opts = new Map) {
    this.log = log.make_context(this.constructor.name)
    this.opts = Object.assign(new Map, Wand.defaults, opts)
  }

  compile(code, onSuccess, onFailure) {
    return API.compile(this.opts, code, onSuccess, onFailure)
  }
}

export {APIError, Wand}

