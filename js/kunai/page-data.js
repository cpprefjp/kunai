import {KunaiError, NetworkError} from './error'
import * as Net from './net'


const PageKey = {
  main: Symbol.for('main'),
  article: Symbol.for('article'),
  articleBody: Symbol.for('articleBody'),
  codes: Symbol.for('codes'),
}

class SourceError extends KunaiError {
  constructor() {
    super(arguments)
  }
}


class PageData {
  constructor(log, onLoad) {
    this.log = log.make_context('PageData')
    this.raw = new Map
    this.onLoad = onLoad

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
    this.raw_set(PageKey.main, null, 'main[role="main"]')
    this.raw_set(PageKey.article, PageKey.main, 'div[itemtype="http://schema.org/Article"]')
    this.raw_set(PageKey.articleBody, PageKey.article, 'div[itemprop="articleBody"]')
    this.raw_set(PageKey.codes, PageKey.articleBody, '.codehilite')

    {
      const a = this.raw_get(PageKey.article).find('.edit-button .edit')
      if (!a) {
        throw new SourceError('could not fetch GitHub source URL')
      }

      this.source = new Net.GHSource(this.log, new URL(a.attr('href')), () => {
        this.onLoad()
      })
    }

    // assign surrogate ids
    {
      let id = 0
      for (let code_r of this.raw_get(PageKey.codes)) {
        ++id
        let code = $(code_r)
        code.attr('data-kunai-code-id', id)
      }
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

export {PageKey, PageData}


