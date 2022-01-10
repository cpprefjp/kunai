import * as Badge from './badge'


class Content {
  constructor(log) {
    this.log = log.makeContext('Content')
    this.log.debug('initialzing...')

    this.log.debug(`found ${Badge.sanitize($('main[role="main"] div[itemtype="http://schema.org/Article"] .content-body span.cpp'))} badges`)

    // 横幅を超える画像を横スクロール可能にするためにスクロール用のdivで囲む
    $('div[itemprop="articleBody"]').find('img').wrap('<div class="scrollable">')
  }
}

export {Content}

