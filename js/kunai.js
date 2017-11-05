import {KunaiError} from './kunai/error'
import {Compat} from './kunai/compat'
import * as UI from './kunai/ui'

import {Meta} from './kunai/meta'
import {Wand} from './kunai/wand'
import * as Mirror from './kunai/mirror'
import {Yata} from './kunai/yata'

import './codemirror-themes'

import {Logger} from 'nagato'
import {CRSearch} from 'crsearch'


class Kunai {
  static defaultOptions = {
    compat: true,
  }

  constructor(opts = {}) {
    // fastest
    // $('body').addClass('js').removeClass('no-js')

    this.opts = Object.assign({}, Kunai.defaultOptions, opts)
    this.log = new Logger(
      'Kunai',
      new Logger.Option(Object.assign({}, this.opts, {
        icon: {text: '\u{1F5E1}', color: '#2244AA'}
      }))
    )

    try {
      this.log.disableBacktrace(true)
      this.log.info(`version ${KUNAI_PACKAGE.version} (https://github.com/cpprefjp/kunai/tree/v${KUNAI_PACKAGE.version})`)
      this.log.info(`please report frontend bugs to: ${KUNAI_PACKAGE.bugs_url}`)
    } finally {
      this.log.disableBacktrace(false)
    }

    if (this.opts.compat) {
      this.compat = new Compat(this.log)
    }

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
    this.crs = await this.initCRSearch(true)
  }

  async boostjp() {
    this.load_impl(['boostjp', 'site'])
    this.crs = await this.initCRSearch(false)
  }

  load_impl(config) {
    const desc = config.join('/')
    this.log.info(`loading (${desc})`)
    $('body').addClass('kunai')
    this.meta = new Meta(this.log, config, ::this.onCodeFound)
    this.log.info(`loaded (${desc})`)
  }

  async onCodeFound(id) {
    // assign surrogate key
    id.serializeInDOM(this.meta.getDOM(Meta.PageKey.codes).get(id.key))

    {
      let elem = this.meta.getDOM(Meta.PageKey.codes, id)
      if (!elem.length) {
        throw new KunaiError(`[BUG] the original DOM element for code ${id} not found`, elem)
      }

      elem.addClass('kunai-code')
    }

    this.yatas.set(id, new Yata(this.log, this.wand, this.meta.getCode(id)))

    // whitelist
    {
      let example = this.meta.getDOM(Meta.PageKey.articleBody).children('h2:contains("例") ~ .yata')
      if (example.length) {
        example.removeClass('hidden')
      }
    }
  }

  async initSidebar() {
    this.ui.sidebar = new UI.Sidebar(new Logger(
      ['Kunai', 'UI'],
      this.log.opts
    ))
    return this.ui.sidebar
  }

  async initUI() {
    const l = new Logger(
      ['Kunai', 'UI'],
      this.log.opts
    )

    this.ui.navbar = new UI.Navbar(l)
    this.ui.content = new UI.Content(l)
  }

  async initCRSearch(isEnabled, onDatabase) {
    if (!isEnabled) return null

    await this.initSidebar()

    let crs = new CRSearch({
      onDatabase: ::this.ui.sidebar.onDatabase,
    })
    crs.database('https://cpprefjp.github.io/static/crsearch/crsearch.json')
    crs.searchbox(document.getElementsByClassName('crsearch'))
    return crs
  }
}

export {Kunai}

