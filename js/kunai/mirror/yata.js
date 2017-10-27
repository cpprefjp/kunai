import {DefaultOptions} from './default-options'

import {default as CodeMirror} from 'codemirror'
import * as js from 'codemirror/mode/clike/clike'


class Yata {
  static Style = {
    Marker: {
      color: '#ff2727',
    },
  }

  constructor(log, id, elem, opts) {
    this.id = id
    this.log = log.make_context(`${this.constructor.name} #${this.id}`)
    this.opts = Object.assign({}, DefaultOptions, opts)

    this.log.info(`creating CodeMirror element...`)
    this.cm = CodeMirror.fromTextArea(elem, this.opts)

    this.cm.on('gutterClick', (cm, n) => {
      const info = cm.lineInfo(n)
      cm.setGutterMarker(
        n,
        'breakpoints',
        info.gutterMarkers ? null : this.makeMarker()
      )
    })

    this.log.info('CodeMirror element created', this.cm)

    this.cm.refresh() // this is VERY important!!
    this.cm.focus()

    // OMG...............
    setTimeout(() => {
      this.cm.refresh()
      this.cm.focus()
    }, 50)
  }

  makeMarker() {
    return $('<div>').text('●').css(
      Yata.Style.Marker
    ).get(0)
  }

  onThemeChange(theme_id) {
    let raw = this.findRaw()
    if (raw.length) {
      this.log.info('mirror found, dynamically changing theme...', raw)
      raw.get(0).className = raw.get(0).className.split(/\s+/).filter((e) => {
        return !e.match(/^cm-s-/)
      }).concat(`cm-s-${theme_id}`).join(' ')
    }
  }

  findRaw() {
    return $(`.mirror[data-kunai-yata-for="${this.id}"] + .CodeMirror`)
  }
}

export {Yata}

