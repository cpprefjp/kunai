import {KunaiError, NetworkError} from './error'
import * as Net from './net'


const Key = {
  main: Symbol.for('main'),
  article: Symbol.for('article'),
}

class SourceError extends KunaiError {
  constructor() {
    super(arguments)
  }
}


class PageData {

  constructor(log) {
    this.log = log.make_context('PageData')
    this.raw = new Map

    this.log.info('parsing html...')

    try {
      this.load()
      this.log.info('parse success')

    } catch (e) {
      try {
        if (e instanceof KunaiError) {
          this.log.error(e.reason, ...e.args)
        } else {
          this.log.error(e.name, e.message)
        }
      } catch (e) {
        this.log.error(e.name, e.message)
      } finally {
        this.log.error('parse failed')
      }
    }
  }

  load() {
    this.raw_set(Key.main, null, 'main[role="main"]')
    this.raw_set(Key.article, Key.main, 'div[itemtype="http://schema.org/Article"]')

    {
      const a = this.raw_get(Key.article).find('.edit-button .edit')
      if (!a) {
        throw new SourceError('could not fetch GitHub source URL')
      }

      this.source = new Net.GHSource(this.log, new URL(a.attr('href')), (data) => {

      })
    }
  }

  raw_set(key, parent_key, path) {
    this.log.info(`fetching '${Symbol.keyFor(key)}'... [parent: ${parent_key ? `'${Symbol.keyFor(parent_key)}'` : '(none)'}]`)
    const e = parent_key ? this.raw.get(parent_key).find(path) : $(path)

    if (!e) {
      throw new SourceError('could not fetch content', key, parent_key, path)
    }
    this.raw.set(key, e)
  }

  raw_get(key) {
    return this.raw.get(key)
  }
}

export {PageData}


