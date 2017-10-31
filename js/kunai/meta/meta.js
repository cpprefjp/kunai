import {KunaiError, ParseError} from '../error'
import {MetaError} from './error'
import {PageKey} from './page-key'
import * as Net from '../net'
import * as Code from '../code'

import {Logger} from 'nagato'


let Marked = require('marked')
const MarkedOpts = {
  gfm: true,
  tables: true,
}

class Meta {
  static PageKey = PageKey

  constructor(log, config, onCodeFound) {
    this.log = log.makeContext(`Meta`, new Logger.Option({icon: {text: '\u{262F}', color: '#AAA'}}))
    this.config = config
    this.onCodeFound = onCodeFound
    this.last_key = 0
    this.codes = new Code.Pool(this.log)
    this.dom = new Map
    this.andareMetaInfo = new Map

    try {
      this.parseHTML()

    } catch (e) {
      try {
        if (e instanceof KunaiError) {
          this.log.error(e.reason, ...e.args)
        } else {
          throw e
        }

      } catch (e) {
        throw e

      } finally {
        this.log.error('parse failed')
      }
    }
  }

  onMetaURLFound() {
    this.log.info(`got meta URL: ${this.original_url}`, this.original_url)

    if (this.original_url.protocol != 'https:') {
      this.log.warn('protocol was not https, force setting to https', this.original_url.protocol)
      this.original_url.protocol = 'https:'
    }

    this.log.info(`original_url: ${this.original_url}`, this.original_url)
    this.filename = [...this.original_url.pathname.split('/')].pop()

    this.raw_url = new URL(this.original_url)
    this.raw_url.host = 'raw.githubusercontent.com'
    this.raw_url.pathname = this.raw_url.pathname.replace(
      new RegExp(`^/` + this.reponame() + `/edit/`),
      `/${this.reponame()}/`
    )

    this.log.info(`raw_url: ${this.raw_url}`, this.raw_url)

    this.content_type = Net.ContentType.parse(this.raw_url)
    this.fetchMetaSource()
  }

  async fetchMetaSource() {
    console.time(JSON.stringify({fetchMetaSource: this.filename}))

    $.ajax({
      method: 'GET',
      url: this.raw_url,
    }).done((data) => {
      console.timeEnd(JSON.stringify({fetchMetaSource: this.filename}))
      this.log.info('fetch success', data)

      console.time(JSON.stringify({parse: this.filename}))

      try {
        this.parse(this.content_type, data)

      } catch (e) {
        if (e instanceof KunaiError) {
          this.log.error(e.reason, ...e.args)
        } else {
          // this.log.error(e.name, e.message)
          throw e
        }

      } finally {
        console.timeEnd(JSON.stringify({parse: this.filename}))
      }

    }).fail(e => {
      console.timeEnd(JSON.stringify({fetchMetaSource: this.filename}))
      this.log.error(e.name, e.message)
    })
  }

  parse(content_type, data) {
    this.log.info(`parsing markdown file '${this.filename}'`)

    this.parse_impl(content_type, data)
    this.log.info('parse success')
  }

  parse_impl(content_type, data) {
    if (content_type === Net.ContentType.MARKDOWN) {
      let lexer = new Marked.Lexer(MarkedOpts)
      this.log.debug('lexer', lexer)

      this.tokens = lexer.lex(data).map(e => {
        return new Map(Object.entries(e))
      })
      this.log.debug(`markdown (${this.tokens.length} tokens)`, this.tokens)

      this.process(this.tokens)
    }
  }

  getCode(id) {
    if (!this.codes.has(id)) {
      throw new KunaiError(`code ${id} not found in Meta data`)
    }
    return this.codes.get(id)
  }

  process(tokens) {
    this.is_first_list = true
    this.is_inside_example = false
    this.single_bufs = []

    const old_level = this.log.opts.data.ctx.level
    this.log.opts.data.ctx.level = Logger.Level.info

    try {
      for (const token of tokens) {
        this.process_single(token)
      }

    } finally {
      this.log.opts.data.ctx.level = old_level
    }
  }

  process_single(token) {
    this.log.debug(`processing token <${token.get('type')}>`, token)

    switch (token.get('type')) {
      case 'heading': {
        if (token.get('text').trim().match(/例|Example|Sample|サンプル/i)) {
          this.is_inside_example = true
        } else {
          this.is_inside_example = false
        }
        break
      }

      case 'list_item_start': {
        this.single_bufs.push('')
        break
      }

      case 'list_item_end': {
        const final_buf = this.single_bufs.pop()

        if (this.is_first_list) {
          const match = final_buf.match(/([^\]]+)\[([^\] ]+) ([^\]]+)\]$/)
          this.log.debug(`matched: '${match[0]}'`, final_buf, match)

          const [_, target, k, v] = match
          this.log.debug(`matched (detailed): ${target} ${k} ${v}`, target, k, v)

          if (k === 'meta') {
            this.andareMetaInfo.set(v, target)
            this.log.info(`got meta: '${v}' --> '${target}'`)
          }
        }
        break
      }

      case 'list_end': {
        this.is_first_list = false
        break
      }

      case 'text': {
        if (this.is_first_list) {
          this.single_bufs[this.single_bufs.length - 1] += token.get('text')
        }
        break
      }

      case 'code': {
        try {
          const lang = token.get('lang')
          const code = token.get('text')

          this.log.info(`found a code section (#${this.last_key})`)

          if (!this.is_inside_example) {
            this.log.info('got a code outside the example section, skipping...', lang, code)
            break
          }

          if (lang === 'cpp') {
            this.log.info(`got C++ code (#${this.last_key})`, code)

            const headers = [this.andareMetaInfo.get('header')]
            const id = new Code.ID(Code.CPP.name, this.last_key)
            this.codes.add(
              new Code.CPP(
                this.log,
                id,
                code,
                {
                  headers: headers,
                },
              )
            )
            this.onCodeFound(id)

          } else {
            this.log.warn(`got code for unknown language '${lang}', skipping...`, code)
          }

        } finally {
          ++this.last_key
        }
        break
      }
    }
  }

  parseHTML() {
    this.log.info('parsing html source...')

    this.setDOM(PageKey.main, null, 'main[role="main"]')
    this.setDOM(PageKey.article, PageKey.main, 'div[itemtype="http://schema.org/Article"]')
    this.setDOM(PageKey.articleBody, PageKey.article, 'div[itemprop="articleBody"]')
    this.setDOM(PageKey.codes, PageKey.articleBody, '.codehilite')

    {
      const a = this.getDOM(PageKey.article).find('.edit-button .edit')
      if (!a.length) {
        throw new MetaError('could not fetch GitHub source URL')
      }

      this.original_url = new URL(a.attr('href'))
      this.onMetaURLFound()
    }
  }

  setDOM(key, parent_key, path) {
    this.log.info(`fetching '${Symbol.keyFor(key)}'... [parent: ${parent_key ? `'${Symbol.keyFor(parent_key)}'` : '(none)'}]`)
    const e = parent_key ? this.dom.get(parent_key).find(path) : $(path)

    if (!e) {
      throw new MetaError('could not fetch content', key, parent_key, path)
    }
    this.dom.set(key, e)
  }

  getDOM(key, filteredID) {
    if (filteredID) {
      return this.dom.get(key).filter((i, e) => {
        let id = null
        try {
          id = Code.ID.fromDOM(e)
        } catch (e) {
          if (e instanceof Code.NonExistentIDError) {
            return false
          } else {
            throw e
          }
        }
        return id.equals(filteredID)
      })
    } else {
      return this.dom.get(key)
    }
  }

  reponame() {
    return this.config.join('/')
  }
}

export {Meta}

