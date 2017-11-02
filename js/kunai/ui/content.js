import * as Badge from './badge'


class Content {
  constructor(log) {
    this.log = log.makeContext('Content')
    this.log.debug('initialzing...')

    this.log.debug(`found ${Badge.sanitize($('main[role="main"] div[itemtype="http://schema.org/Article"] .content-body span.cpp'))} badges`)
  }
}

export {Content}

