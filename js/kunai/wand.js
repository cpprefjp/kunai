import {CPPCode} from './parser/cpp'


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
    const id = Date.now()
    console.time(JSON.stringify({compile: id}))

    try {
      this.log.info('making request json...')
      const j = this.make_request_json(code)
      this.log.info('json', j)

    } catch (e) {
      this.log.error(e.name, e.message)

    } finally {
      console.timeEnd(JSON.stringify({compile: id}))
    }
  }

  make_request_json(code) {
    let kv = new Map

    for (const [k, v] of this.opts) {
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

