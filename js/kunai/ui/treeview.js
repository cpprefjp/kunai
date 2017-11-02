import * as Badge from './badge'


class Treeview {
  constructor(log) {
    this.log = log.makeContext('Treeview')
    this.log.debug('initialzing...')

    const main = $('main[role="main"]')

    // FIXME: make this search html id. this is a disaster
    let raw = main.find('.tree')
    if (!raw.length) {
      this.log.error(`tree view DOM element not found (.tree)`)
      return
    }

    this.log.debug(`found ${Badge.sanitize(raw.find('.cpp-sidebar'))} badges`)
  }
}

export {Treeview}

