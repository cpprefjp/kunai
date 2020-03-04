import {KunaiError, ParseError} from '../error'
import {MetaError} from './error'
import {PageKey} from './page-key'
import * as Net from '../net'
import * as Code from '../code'

import URL from 'url-parse'
import * as CM from 'commonmark'


class Meta {
  static PageKey = PageKey

  constructor(log, config, mdinfo, onCodeFound) {
    this.log = log.makeContext(`Meta`)
    this.config = config
    this.codes = new Code.Pool(this.log)

    for (const source of mdinfo.sources) {
      const id = new Code.ID(source.id)
      this.codes.add(
        new Code.CPP(
          this.log,
          id,
          source.source,
          {},
        )
      )
      onCodeFound(this, id)
    }
    this.page_id = mdinfo.page_id
    this.andareMetaInfo = mdinfo.meta
  }

  getCode(id) {
    if (!this.codes.has(id)) {
      throw new KunaiError(`code ${id} not found in Meta data`)
    }
    return this.codes.get(id)
  }
}

export {Meta}

