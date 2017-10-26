import {Logger} from './kunai/logger'
import {PageKey, PageData} from './kunai/page-data'


export default class Kunai {
  constructor(opts = {}) {
    this.log = new Logger('Kunai', opts)
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

        let wand = $(`<div />`)
        wand.addClass('wand')
        wand.addClass('hidden') // hide by default
        wand.attr('data-kunai-wand-for', id)

        this.log.info(`creating Wand toolbar for code snippet #${id}`, wand)

        let tb = $('<ul />').addClass('tools')
        const tooltip = $('<div class="tooltip-wrapper"><div class="tooltip"></div></div>')
        const tool = $('<li>').addClass('tool')
        {
          let li = tool.clone()
          li.addClass('play')

          let btn = $(`<button />`).attr('data-kunai-id', kunai_id++)
          tooltip.clone().appendTo(btn)

          let icon = $('<i />')
          icon.addClass('fa fa-fw fa-magic')
          icon.appendTo(btn)

          btn.on('click', this.onToolClick.bind(this))
          btn.appendTo(li)
          li.appendTo(tb)
        }

        tb.appendTo(wand)
        c.before(wand)
      } // each code

      // whitelist
      {
        let example = this.pd.raw_get(PageKey.articleBody).children('h2:contains("例") ~ .wand').get(0)
        if (example) {
          $(example).removeClass('hidden')
        }
      }
    })
  }

  onToolClick(e) {
    let btn = $(e.target).closest('button')
    const id = btn.attr('data-kunai-id')
    this.log.debug(`onToolClick id=${id}`, e, btn.get(0))

    if (id === '0') {
      let wand = btn.closest('.wand')
      const code_id = wand.attr('data-kunai-wand-for')
      let orig_code = wand.nextAll(`.codehilite[data-kunai-code-id="${code_id}"]`)

      if (wand.hasClass('enabled')) {
        this.log.info(`disabling wand mode for code #${code_id}`, orig_code)
        wand.removeClass('enabled')
        return
      }

      wand.addClass('enabled')
      this.log.info(`enabling wand mode for code #${code_id}`, orig_code)
    }
  }
}

