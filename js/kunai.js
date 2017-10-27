import {Logger} from './kunai/logger'
import {Compat} from './kunai/compat'
import * as UI from './kunai/ui'

import {PageKey, PageData} from './kunai/page-data'
import * as Mirror from './kunai/mirror'


class Kunai {
  static defaultOptions = {
    compat: true,
  }

  constructor(opts = {}) {
    // fastest
    $('body').addClass('js').removeClass('no-js')

    this.opts = Object.assign({}, Kunai.defaultOptions, opts)
    this.log = new Logger('Kunai', this.opts)

    this.compat = new Compat(this.log)
    this.initUI()

    this.themes = new Map
    this.currentTheme = Mirror.DefaultOptions.theme
    this.yatas = new Map

    this.loadTheme(this.currentTheme)
  }

  start() {
    this.log.info('loading...')
    this.start_impl()
    this.log.info('loaded.')
  }

  start_impl() {
    $('body').addClass('kunai')

    this.pd = new PageData(this.log, () => {
      let codes = this.pd.raw_get(PageKey.codes)
      for (let c_raw of codes) {
        let kunai_id = 0

        let c = $(c_raw)
        const id = parseInt(c.attr('data-kunai-code-id'))
        c.addClass('kunai-code')

        let yata = $(`<div />`)
        yata.addClass('yata')
        yata.addClass('hidden') // hide by default
        yata.attr('data-kunai-yata-for', id)

        this.log.info(`creating Yata toolbar for code snippet #${id}`, yata)
        let tools_l_r = $('<div>').addClass('tools-l-r')
        const tooltip = $('<div class="tooltip-wrapper"><div class="tooltip"></div></div>')
        const tool = $('<li>').addClass('tool')

        {
          let tb = $('<ul />').addClass('tools left')
          {
            let li = tool.clone().addClass('play')

            let btn = $(`<button />`).attr('data-kunai-id', kunai_id++)
            tooltip.clone().appendTo(btn)

            $('<i>').addClass('fa fa-fw fa-magic').appendTo(btn)

            btn.on('click', this.onToolClick.bind(this))
            btn.appendTo(li)
            li.appendTo(tb)
          }
          tb.appendTo(tools_l_r)
        }

        {
          let tb = $('<ul />').addClass('tools right')

          {
            let li = tool.clone().addClass('theme')
            let btn = $('<div>').addClass('not-a-button')
            $('<i>').addClass('fa fa-fw fa-adjust').appendTo(btn)
            tooltip.clone().appendTo(btn)
            btn.appendTo(li)

            let sel = $('<select>')

            for (const theme of Mirror.Theme) {
              $('<option>').val(theme).text(theme).appendTo(sel)
            }

            // i.e. default theme
            sel.val(this.currentTheme)

            sel.on('change', this.onThemeChange.bind(this))
            sel.appendTo(li)
            li.appendTo(tb)
          }

          tb.appendTo(tools_l_r)
        }

        tools_l_r.appendTo(yata)
        c.before(yata)
      } // each code

      // whitelist
      {
        let example = this.pd.raw_get(PageKey.articleBody).children('h2:contains("例") ~ .yata').get(0)
        if (example) {
          $(example).removeClass('hidden')
        }
      }
    })
  }

  async initUI() {
    this.ui = {
      treeview: new UI.Treeview(this.log),
    }
  }

  async loadTheme(id) {
    if (!this.themes.has(id)) {
      this.log.info(`initial theme load for '${id}'`)
      this.themes.set(id, require(`codemirror/theme/${id}.css`))
    }
  }

  onThemeChange(e) {
    const id = parseInt($(e.target).closest('.yata').attr('data-kunai-yata-for'))
    const theme_id = e.target.value
    this.log.info(`#${id} onThemeChange (--> '${theme_id}')`, e)

    this.loadTheme(theme_id)
    this.currentTheme = theme_id

    if (this.yatas.has(id)) {
      this.yatas.get(id).onThemeChange(theme_id)
    }
  }

  onToolClick(e) {
    let btn = $(e.target).closest('button')
    const id = btn.attr('data-kunai-id')
    this.log.debug(`onToolClick id=${id}`, e, btn.get(0))

    if (id === '0') {
      let yata = btn.closest('.yata')
      const code_id = parseInt(yata.attr('data-kunai-yata-for'))
      let orig_code = $(yata.nextAll(`.codehilite[data-kunai-code-id="${code_id}"]`).get(0))

      if (yata.hasClass('enabled')) {
        this.log.info(`disabling Yata mode for code #${code_id}`, orig_code)

        {
          let mirror = orig_code.next('.mirror')
          if (mirror) {
            mirror.removeClass('enabled')
          }
        }
        yata.removeClass('enabled')
        return
      }

      yata.addClass('enabled')
      this.log.info(`enabling Yata mode for code #${code_id}`, orig_code)

      let mirror = null
      mirror = orig_code.next('.mirror')
      if (!mirror.length) {
        this.log.info('Yata buffer not found, creating...')
        mirror = $('<textarea>').addClass('mirror')
        mirror.attr('data-kunai-yata-for', code_id)

        // the code
        mirror.text(this.pd.source.get_code(code_id).buf)

        orig_code.after(mirror)
        this.log.info(`enabling Yata #${code_id}`, mirror)
        this.yatas.set(
          code_id,
          new Mirror.Yata(
            this.log,
            code_id,
            mirror.get(0), {
              theme: this.currentTheme
            }
          )
        )
      } // if mirror
      mirror.addClass('enabled')
    }
  }
}

export {Kunai}
module.exports = Kunai

