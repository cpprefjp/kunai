import * as Mirror from './mirror'
import {KunaiError} from './error'

import {default as CodeMirror} from 'codemirror'
import * as js from 'codemirror/mode/clike/clike'

import {default as AN} from 'anser'


const ToolID = {
  play: 'play',
  compile: 'compile',
  theme: 'theme',
}

class RefreshTimerInfo {
  constructor(id) {
    this.id = id
    this.realID = null
    this.count = 0
  }
}

class Yata {
  static ToolID = ToolID

  static Style = {
    Marker: {
      color: '#ff2727',
    },
  }

  constructor(log, wand, code, opts = {}) {
    this.wand = wand
    this.code = code
    this.console = null
    this.cmRefreshTimers = new Map

    this.log = log.makeContext(`Yata ${this.code.id}`)
    this.opts = Object.assign({}, Mirror.DefaultOptions, opts)

    this.tools = new Map

    this.themes = new Map
    this.currentTheme = Mirror.DefaultOptions.theme
    this.loadTheme(this.currentTheme)

    this.initElem()
    this.initMirror()

    // this.isDragging = false
  }

  initElem() {
    this.orig_code = $(this.code.id.makeSelector()).children()
    if (!this.orig_code.length) {
      throw new KunaiError(`original code element with id ${this.code.id} not found`)
    }

    let elem = $('<div>')
    elem.addClass('yata-toolbar')

    this.log.info(`creating Yata toolbar for code snippet`, elem)
    let tools_all = $('<div>').addClass('tools-all')
    const tooltip = $('<div class="tooltip-wrapper"><div class="tooltip"></div></div>')
    const tool = $('<li>').addClass('tool')
    let btn_proto = $(`<button>`).prop('disabled', true)
    tooltip.clone().appendTo(btn_proto)


    {
      let tb = $('<ul />').addClass('tools left')
      {
        let li = tool.clone().addClass('play')
        this.tools.set(ToolID.play, li)
        let btn = btn_proto.clone().prop('disabled', false)

        $('<i>').addClass('fa fa-fw fa-magic').appendTo(btn)

        btn.on('click', ::this.onEnable)
        btn.appendTo(li)
        li.appendTo(tb)
      }
      {
        let li = tool.clone().addClass('compile')
        this.tools.set(ToolID.compile, li)
        let btn = btn_proto.clone()

        $('<i>').addClass('fa fa-fw fa-play').appendTo(btn)

        btn.on('click', ::this.onCompile)
        btn.appendTo(li)
        li.appendTo(tb)
      }
      tb.appendTo(tools_all)
    }

    {
      let tb = $('<ul />').addClass('tools right')

      {
        let li = tool.clone().addClass('theme')
        this.tools.set(ToolID.theme, li)

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

        sel.on('change', ::this.onThemeChange)
        sel.appendTo(li)
        li.appendTo(tb)
      }

      tb.appendTo(tools_all)
    }

    tools_all.appendTo(elem)
    this.orig_code.before(elem)
  } // initElem

  initMirror(code) {
    this.buf = this.orig_code.next('.mirror')

    this.log.info('creating textarea buffer...')
    this.buf = $('<textarea>').addClass('mirror')

    // the code
    this.buf.text(this.code.buf)

    this.orig_code.after(this.buf)
    this.log.info(`initializing mirror data...`, this.buf)


    this.log.info(`creating CodeMirror element...`)
    this.cm = CodeMirror.fromTextArea(
      this.buf.get(0),
      Object.assign({}, this.opts, {
        theme: this.currentTheme,
      })
    )

    this.cm.on('gutterClick', (cm, n) => {
      const info = cm.lineInfo(n)
      cm.setGutterMarker(
        n,
        'breakpoints',
        info.gutterMarkers ? null : this.makeMarker()
      )
    })

    this.cm.on('scroll', (cm) => {
      const info = cm.getScrollInfo()
      const eps = 2
      // this.log.debug('scroll', info, cm)

      let we = $(cm.getWrapperElement())

      if (info.left > eps) {
        we.addClass('scrolling-x')
      } else {
        we.removeClass('scrolling-x')
      }

      if (info.top > eps) {
        we.addClass('scrolling-y')
      } else {
        we.removeClass('scrolling-y')
      }
    })

    // this.resizer = this.code.id.serializeInDOM($('<div>').addClass('yata-resizer'))

    // this.resizer.on('mouseup', ::this.onResize)
    // this.resizer.on('mousedown', ::this.onResize)
    // this.resizer.on('mousemove', ::this.onResize)

    // $(this.cm.getWrapperElement()).after(this.resizer)

    this.cm.setSize(null, '380px')
    this.log.info('CodeMirror element created', this.cm)

    // this.cm.focus()
    // this.cm.refresh()

    this.autoRefresh()

    this.console = $('<div>').addClass('yata-console')
    $(this.cm.getWrapperElement()).after(this.console)
  } // initMirror

  async autoRefresh() {
    // OMG...............
    // CodeMirrorのクソ仕様をよく分かっていないので
    // 生成されてからしばらく経ってから強制再描画しないと
    // 何も表示されない
    // †最大の闇†

    let id = 0
    // より安全なID生成方法に変更
    for (let i = 0; i <= this.cmRefreshTimers.size + 1; i++) {
      if (!this.cmRefreshTimers.has(i)) {
        id = i
        break
      }
    }
    
    let info = new RefreshTimerInfo(id)
    this.log.debug(`autoRefresh engaged (id: #${id})`)
    this.cmRefreshTimers.set(id, info)

    const timerId = setInterval(() => {
      // infoがまだ存在するか確認
      if (!this.cmRefreshTimers.has(id)) {
        clearInterval(timerId)
        return
      }
      
      ++info.count
      
      // CodeMirrorインスタンスが有効か確認
      if (this.cm && typeof this.cm.refresh === 'function') {
        try {
          this.cm.refresh()
        } catch (e) {
          this.log.error(`Failed to refresh CodeMirror: ${e}`)
          clearInterval(timerId)
          this.cmRefreshTimers.delete(id)
          return
        }
      }

      if (info.count > 10) {
        this.log.debug(`removing autoRefresh timer (id: #${id}, realID: #${timerId})`)
        clearInterval(timerId)
        this.cmRefreshTimers.delete(id)
      }
    }, 200)
    
    // タイマーIDを保存
    info.realID = timerId
  }

  onResize(e) {
    e.stopPropagation()
    this.log.info(`dragged ${e.offsetY}`, e)

    if (e.type === 'mousedown') {
      this.isDragging = false
      return false
    } else if (e.type === 'mousemove') {
      this.isDragging = true
      return false
    }

    if (this.isDragging) {
      this.log.info(`dragged ${e.offsetY}`, e)
    }
  } // onResize

  makeMarker() {
    return $('<div>').text('●').css(
      Yata.Style.Marker
    ).get(0)
  }

  async loadTheme(id) {
    if (!this.themes.has(id)) {
      this.log.info(`initial theme load for '${id}'`)
      this.themes.set(id, true)
      // this.themes.set(id, require(`codemirror/theme/${id}.css`))
    }
  }

  findRaw() {
    return $(`${this.code.id.makeSelector()} .CodeMirror`)
  }

  onCompile(e) {
    // this.log.debug(`onCompile`, e)
    this.tools.get(ToolID.compile).addClass('compiling')

    // save to textarea
    this.cm.save()

    this.wand.compile(
      this.cm.getTextArea().value,
      ::this.onCompileSuccess, ::this.onCompileFailure
    )
  }

  async onCompileSuccess(ret, extra) {
    this.onCompilePostPre(true, ret, extra)
    return this.onCompilePostPost(ret, extra)
  }

  async onCompileFailure(e, extra) {
    this.onCompilePostPre(false, e, extra)
    return this.onCompilePostPost(e, extra)
  }

  onCompilePostPre(isSuccess, e, extra) {
    // this.log.info(`${isSuccess ? 'success' : 'failed'}: ${extra.id}`)
  }

  async onCompilePostPost(e, extra) {
    this.tools.get(ToolID.compile).removeClass('compiling')
    this.console.html(
      [].concat(
        Yata.processConsole(e.compiler_message)
      ).concat(
        Yata.processConsole(e.program_message),
      )
    )
  }

  static processConsole(raw) {
    if (!raw) return []

    return $('<span />').text(raw).html().split(/\n/).map((l) => {
      return $('<p>').addClass('yata-console-line').html(AN.ansiToHtml(l, {
        use_classes: true
      }))
    })
  }

  onThemeChange(e) {
    const theme_id = e.target.value
    this.log.info(`onThemeChange (--> '${theme_id}')`, e)

    this.loadTheme(theme_id)
    this.currentTheme = theme_id
    this.applyRawThemeChange()
  }

  async applyRawThemeChange() {
    let raw = this.findRaw()
    if (raw.length) {
      this.log.info('mirror found, dynamically changing theme...', raw)
      raw.get(0).className = raw.get(0).className.split(/\s+/).filter((e) => {
        return !e.match(/^cm-s-/)
      }).concat(`cm-s-${this.currentTheme}`).join(' ')
    }
  }

  onEnable(e) {
    let btn = $(e.srcElement || e.originalTarget || e.target)
    let yata = btn.closest('.yata-toolbar')

    // this.log.debug(`onEnable`, e, btn.get(0))

    let orig_code = $(yata.nextAll(`${this.code.id.makeSelector()} .codehilite`))

    if (yata.hasClass('enabled')) {
      this.log.info(`disabling Yata mode`)

      {
        let mirror = orig_code.next('.mirror')
        if (mirror.length) {
          mirror.removeClass('enabled')
        }
      }

      // disable all tools, except for the 'Enable' button
      {
        let tools = yata.find('.tools-all .tool')
        for (let tool_r of tools) {
          let tool = $(tool_r)
          if (tool.hasClass('play')) {
            continue
          }
          tool.find('button').prop('disabled', true)
        }
      }

      yata.removeClass('enabled')
      return
    }

    yata.addClass('enabled')
    this.log.info(`enabling Yata mode`)

    // remove all 'disabled' props
    {
      let tools = yata.find('.tools-all .tool')
      for (let tool_r of tools) {
        let tool = $(tool_r)
        let btn = tool.find('button')
        if (btn.length) {
          btn.prop('disabled', false)
        }
      }
    }

    this.buf.addClass('enabled')
    this.autoRefresh()
    this.cm.focus()
  } // onEnable
}

export {Yata}

