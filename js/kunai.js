import {KunaiError} from './kunai/error'
import {Compat} from './kunai/compat'
import * as UI from './kunai/ui'

import {Meta} from './kunai/meta'
import {Wand} from './kunai/wand'
import * as Mirror from './kunai/mirror'
import {Yata} from './kunai/yata'

import './codemirror-themes'

import {CRSearch} from 'crsearch'

class DefaultLogger {
  constructor(context = "kunai_top") {
    this.context = context;
  }

  debug() { console.debug(`[${this.context}]`, ...arguments); }
  info() { console.info(`[${this.context}]`, ...arguments); }
  warn() { console.warn(`[${this.context}]`, ...arguments); }
  error() { console.error(`[${this.context}]`, ...arguments); }
  makeContext(context) { return new DefaultLogger(context); }
};

class ErrorLogger {
  constructor(context = "kunai_top") {
    this.context = context;
  }

  debug() {}
  info() {}
  warn() {}
  error() { console.error(`[${this.context}]`, ...arguments); }
  makeContext(context) { return new ErrorLogger(context); }
};

class Kunai {
  static defaultOptions = {
    compat: true,
  }

  constructor(opts = {}) {
    // fastest
    // $('body').addClass('js').removeClass('no-js')

    this.opts = Object.assign({}, Kunai.defaultOptions, opts)
    //this.log = new DefaultLogger()
    this.log = new ErrorLogger()

    console.log(`version ${KUNAI_PACKAGE.version} (https://github.com/cpprefjp/kunai/tree/v${KUNAI_PACKAGE.version})`)
    console.log(`please report frontend bugs to: ${KUNAI_PACKAGE.bugs_url}`)

    this.ui = {
      navbar: null,
      sidebar: null,
      content: null,
    }
    this.initUI()

    this.wand = new Wand(this.log)
    this.yatas = new Map
  }

  async cpprefjp() {
    this.load_impl(['cpprefjp', 'site'])
    this.crs = this.initCRSearch(true)
  }

  async boostjp() {
    this.load_impl(['boostjp', 'site'])
    this.crs = this.initCRSearch(false)
  }

  load_impl(config) {
    if (this.opts.compat) {
      this.compat = new Compat(this.log, config)
    }

    const desc = config.join('/')
    this.log.info(`loading (${desc})`)
    $('body').addClass('kunai')

    const mdinfo = JSON.parse($('header').attr('data-kunai-mdinfo'))
    this.log.info(`data-kunai-mdinfo`, mdinfo)

    this.meta = new Meta(this.log, config, mdinfo, ::this.onCodeFound)

    $('.yata > .codehilite').addClass('kunai-code')

    this.log.info(`loaded (${desc})`)
  }

  onCodeFound(meta, id) {
    this.yatas.set(id, new Yata(this.log, this.wand, meta.getCode(id)))
  }

  async initSidebar() {
    this.ui.sidebar = new UI.Sidebar(this.log)
    return this.ui.sidebar
  }

  async initUI() {
    this.ui.navbar = new UI.Navbar(this.log)
    this.ui.content = new UI.Content(this.log)
  }

  async onDatabase(db) {
    // this.log.debug(`onDatabase`, db)
    await this.ui.sidebar.onDatabase(db)
    await this.ui.sidebar.treeview.onPageID(this.meta.page_id)
  }

  async initCRSearch(isEnabled) {
    if (!isEnabled) return null

    await this.initSidebar()

    let crs = new CRSearch({
      onDatabase: this.onDatabase.bind(this),
    })
    crs.database('/static/crsearch/crsearch.json')

    let e = $('.crsearch')
    await crs.searchbox(e)
    e.addClass('loaded')
    return crs
  }
}

export {Kunai}

