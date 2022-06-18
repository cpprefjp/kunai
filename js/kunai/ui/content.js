import * as Badge from './badge'


class Content {
  constructor(log) {
    this.log = log.makeContext('Content')
    this.log.debug('initialzing...')

    this.log.debug(`found ${Badge.sanitize($('main[role="main"] div[itemtype="http://schema.org/Article"] .content-body span.cpp'))} badges`)

    this.setupTooltip()
  }

  setupTooltip() {
    const HORIZONTAL_MARGIN = 8 // (設定) ツールチップ配置時のビューポート横余白
    const VERTICAL_MARGIN   = 8 // (設定) ツールチップ配置時のビューポート縦余白
    const VERTICAL_OFFSET   = 2 // (設定) ツールチップと対象要素の縦の距離
    const TOOLTIP_ID             = 'cpprefjp-dfn-tooltip'
    const TOOLTIP_CLASS_REVEALED = 'cpprefjp-dfn-tooltip-revealed'

    const span = document.createElement('span')
    span.id = TOOLTIP_ID
    document.body.appendChild(span)

    let target = null
    const showTooltipAt = (x, y, targetElement) => {
      target = targetElement

      // 物理ピクセル位置にぴったり合わせる
      x = Math.round(x * window.devicePixelRatio) / window.devicePixelRatio
      y = Math.round(y * window.devicePixelRatio) / window.devicePixelRatio

      span.style.left = `${x}px`
      span.style.top = `${y}px`
      span.classList.add(TOOLTIP_CLASS_REVEALED)
    }
    const hideTooltip = () => {
      target = null
      span.classList.remove(TOOLTIP_CLASS_REVEALED)
    }

    $('a[data-desc]').on({
      mouseover: function(e) {
        // 幾何情報の取得
        span.dataset.desc = this.dataset.desc
        const rect = this.getBoundingClientRect()        // ツールチップ表示対象要素の矩形
        const vw = document.documentElement.clientWidth  // スクロールバーを除くビューポートの幅
        const vh = document.documentElement.clientHeight // スクロールバーを除くビューポートの高さ
        const mx = e.clientX                             // ビューポート内のマウス位置X
        const my = e.clientY                             // ビューポート内のマウス位置Y
        const tw = span.offsetWidth                      // ツールチップの表示幅
        const th = span.offsetHeight                     // ツールチップの表示高さ

        // 位置の決定
        let x = Math.max(HORIZONTAL_MARGIN, Math.min(vw - tw - HORIZONTAL_MARGIN, mx))
        let y = rect.top - VERTICAL_OFFSET - th
        if (y < VERTICAL_MARGIN) {
          y = rect.bottom + VERTICAL_OFFSET
          if (y + th > vh - VERTICAL_MARGIN) y = my + VERTICAL_OFFSET
        }
        showTooltipAt(x, y, this)
      },
      mouseout: function() { if (this === target) hideTooltip() }
    })

    const checkScroll = function(e) {
      if (target === null) return
      const rect = target.getBoundingClientRect()
      const hitResult =
            rect.left <= e.clientX && e.clientX <= rect.right &&
            rect.top <= e.clientY && e.clientY <= rect.bottom
      if (!hitResult) hideTooltip()
    }
    window.addEventListener('scroll', checkScroll, true)
    window.addEventListener('resize', checkScroll)
  }
}

export {Content}
