import {KunaiError} from './kunai/error'
import {Logger} from './kunai/logger'
import {Compat} from './kunai/compat'
import * as UI from './kunai/ui'

import {Meta} from './kunai/meta'
import {Wand} from './kunai/wand'
// import * as Code from './kunai/code'
import * as Mirror from './kunai/mirror'
import {Yata} from './kunai/yata'


class Kunai {
  static defaultOptions = {
    compat: true,
  }

  constructor(opts = {}) {
    // fastest
    $('body').addClass('js').removeClass('no-js')

    this.opts = Object.assign({}, Kunai.defaultOptions, opts)
    this.log = new Logger(
      'Kunai',
      new Logger.Option(Object.assign({}, this.opts, {
        icon: {text: '\u{1F5E1}', color: '#2244AA'}
      }))
    )

    this.compat = new Compat(this.log)
    this.initUI()

    this.wand = new Wand(this.log)

    this.yatas = new Map
  }

  cpprefjp() {
    this.load_impl(['cpprefjp', 'site'])
  }

  boostjp() {
    this.load_impl(['boostjp', 'site'])
  }

  load_impl(config) {
    const desc = config.join('/')
    this.log.info(`loading (${desc})`)
    $('body').addClass('kunai')
    this.meta = new Meta(this.log, config, this.onCodeFound.bind(this))
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

  async initUI() {
    this.ui = {
      treeview: new UI.Treeview(this.log),
    }
  }
}

export {Kunai}
module.exports = Kunai

