import {NetworkError} from './error'

import {default as Numeral} from 'numeral'

import URL from 'url-parse'


class APIError extends NetworkError {
  constructor() {
    super(...arguments)
  }
}

const Method = {
  get: 'GET',
  post: 'POST',
}


class API {
  static Home = new URL('https://wandbox.org/api/')

  static compile(id, opts, code, s, f) {
    return API.request(
      id,
      Method.post,
      new URL('compile.json', API.Home),
      opts, code,
      s, f
    )
  }

  static request(id, method, url, opts, data, onSuccess, onFailure) {
    const reqid = JSON.stringify({method: method, url: String(url), id: id})
    // console.time(reqid)
    // const stopTimer = () => {
      // console.timeEnd(reqid)
    // }
    const prevNow = Date.now()
    const makeExtraInfo = () => {
      return {
        id: id,
        elapsed: Date.now() - prevNow,
      }
    }

    const s = (e) => {
      // stopTimer()
      return onSuccess(e, makeExtraInfo())
    }
    const f = (e) => {
      // stopTimer()
      return onFailure(e, makeExtraInfo())
    }

    const common = {
      dataType: 'json',
      crossDomain: true,
      cache: false,
    }

    try {
      switch (method) {
        case Method.get: {
          return $.ajax(
            String(url), Object.assign({}, common, {
              type: 'GET',
              data: API.make_request_json(opts, data),
            })
          ).done(s).fail(f)
        }
        case Method.post: {
          return $.ajax(
            String(url), Object.assign({}, common, {
              type: 'POST',
              data: API.make_request_json(opts, data),
            })
          ).done(s).fail(f)
        }
      }
    } catch (e) {
      console.timeEnd(reqid)
      throw e
      // this.log.error(e.name, e.message)

    } finally {
    }
  }

  static make_request_json(opts, code) {
    let kv = {}

    for (const [k, v] of opts) {
      switch (k) {
        case 'compiler': {
          kv[k] = v
          break
        }

        case 'options': {
          kv[k] = v.join(',')
          break
        }

        case 'compiler-option-raw': {
          kv[k] = v.join("\n")
          break
        }
      }
    }
    kv['code'] = code
    return JSON.stringify(kv)
  }
}


class Wand {
  static defaults = new Map([
    ['compiler', 'clang-head'],
    ['options', ['warning', 'c++2a', 'cpp-pedantic-errors']],
    ['compiler-option-raw', ['-Wall', '-Wextra', /*'-Werror'*/]],
  ])

  static elapsed(msec) {
    return `${Numeral(msec / 1000.).format('0.0')} sec`
  }

  constructor(log, opts = new Map) {
    this.log = log.makeContext('Wand')
    this.opts = new Map([...Wand.defaults, ...opts])
    this.log.info('三へ( へ՞ਊ ՞)へ ﾊｯﾊｯ')
  }

  compile(code, onSuccess, onFailure) {
    const id = `#${Date.now()}`
    // console.time(id)
    this.log.info(`compiling: ${id}`, code)

    return API.compile(
      id,
      this.opts, code,
      (r, e) => {
        // console.timeEnd(id)
        this.log.info(`success: ${id} (took ${Wand.elapsed(e.elapsed)})`, r, e)
        return onSuccess(r, e)
      },
      (r, e) => {
        // console.timeEnd(id)
        this.log.error(`failed: ${id} (took ${Wand.elapsed(e.elapsed)})`, r, e)
        return onFailure(r, e)
      }
    )
  }
}

export {APIError, Wand}

