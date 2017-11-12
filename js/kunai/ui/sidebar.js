import {Treeview} from './treeview'
import {KC} from 'crsearch'


class Sidebar {
  constructor(log) {
    this.log = log.makeContext('Sidebar')
    this.log.debug('initialzing...')

    this.kc = new KC.Config({
      'article.md': require('../../../kunai_configs/current/article.md'),
      'cpp.json': require('../../../kunai_configs/current/cpp.json'),
    })

    this.e = null
    {
      let maybe_sidebar = $('#sidebar')
      if (maybe_sidebar.length) {
        this.legacy = false
        this.e = maybe_sidebar
        this.e.addClass('kunai-sidebar')

      } else {
        this.legacy = true
        this.e = $('main[role="main"] div:not([itemtype="http://schema.org/Article"]) .tree').parent().addClass('kunai-sidebar')
      }
    }
    this.status = $('<div>').addClass('status').appendTo(this.e)
    this.e.addClass('loading')

    this.log.debug(`legacy?: ${this.legacy}`)
    if (this.legacy) {
      this.e.addClass('legacy')
    }

    this.treeview = this.initTreeview()
  }

  async onDatabase(db) {
    try {
      this.log.info(`onDatabase`, db)

      this.db = db

      await this.treeview.onData(db)

    } finally {
      this.e.removeClass('loading')
    }
  }

  initTreeview() {
    let e = null

    if (this.legacy) {
      e = this.e.children('.tree').addClass('kunai-tree')
    } else {
      e = $('<div>').addClass('kunai-tree').addClass('v2').appendTo(this.e)
    }

    return new Treeview(
      this.log,
      this.kc,
      this.e,
      {
        legacy: this.legacy
      }
    )
  }
}

export {Sidebar}

