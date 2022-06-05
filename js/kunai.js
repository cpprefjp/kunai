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

    // Dynamically set the base_url
    const dynamic_base_url = (() => {
      // Determine the location of the website base
      const current_script = document.currentScript || document.querySelector('script[src*="static/kunai/js/kunai.js"]')
      if (current_script) {
        // Try to determine the base_url based on the location of this script
        // ({base_url}/static/kunai/js/kunai.js).
        const url_kunai = current_script.getAttribute("src")
        const url = url_kunai.replace(/\bstatic\/kunai\/js\/kunai\.js([?#].*)?$/, "")
        if (url != url_kunai) return url == "" ? "/" : url
      }
      // Fallback case assuming that the website is hosted at the top level
      return "/"
    })()

    const database_url = (() => {
      // Determine the location of the database file "crsearch.json".
      const current_script = document.currentScript || document.querySelector('script[src*="kunai/js/kunai.js"]')
      if (current_script) {
        // A special care is needed for local HTML files (file://...).  When a
        // HTML in a local file system is directly opened in a Web browser,
        // "static/crsearch/crsearch.json" cannot be read using XHR due to the
        // CORS (cross-origin resource sharing) policy for the local files.
        if (/^file:\/\//.test(current_script.src)) {
          const url_kunai = current_script.getAttribute("src")

          // When the current script file (kunai.js) is located in an expected
          // path in the tree, we try to load the local database file
          // "crsearch/crsearch.js" in JSONP format.
          const url = url_kunai.replace(/\bkunai\/js\/kunai\.js([?#].*)?$/, "crsearch/crsearch.js")
          if (url != url_kunai) return url

          // Try to download "crsearch.json" from the project website, which is
          // assumed to be stored in <meta name="twietter:url" content="..." />
          // or in <meta property="og:url" content="..." />.
          const meta = document.querySelector('meta[name="twitter:url"]') || document.querySelector('meta[property="og:url"]')
          if (meta && meta.content) {
            const m = meta.content.toString().match(/^https?:\/\/[^/]*\//)
            if (m) return m[0] + "static/crsearch/crsearch.json"
          }
        }

        // Try to determine the position of crsearch.json
        // ({base_url}/static/crsearch/crsearch.json) based on the location of
        // this script ({base_url}/static/kunai/js/kunai.js).
        const url_kunai = current_script.getAttribute("src")
        const url = url_kunai.replace(/\bkunai\/js\/kunai\.js([?#].*)?$/, "crsearch/crsearch.json")
        if (url != url_kunai) return url
      }

      // Fallback case assuming that the website is hosted at the top level
      return "/static/crsearch/crsearch.json"
    })();

    let crs = new CRSearch({
      onDatabase: this.onDatabase.bind(this),
      base_url: dynamic_base_url
    })
    crs.database(database_url)

    let e = $('.crsearch')
    await crs.searchbox(e)
    e.addClass('loaded')
    return crs
  }
}

export {Kunai}

