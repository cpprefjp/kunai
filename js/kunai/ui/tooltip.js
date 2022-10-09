class Tooltip {
  /**
   * ツールチップを構築します。
   * @param {Document} [_document] - 表示対象のドキュメント
   * @param {object} [config] - 設定
   */
  constructor(_document, config) {
    this.document = _document || document
    this.view = this.document.defaultView || window
    this.config = {
      horizontalMargin:      8, // (設定) ツールチップ配置時のビューポート横余白
      verticalMargin:        8, // (設定) ツールチップ配置時のビューポート縦余白
      verticalOffset:        2, // (設定) ツールチップと対象要素の縦の距離
      tooltipId:             'kunai-ui-tooltip',
      tooltipClassRevealed:  'kunai-ui-tooltip-revealed'
    }
    if (config)
      Object.assign(this.config, config)

    this.span = document.createElement('span')
    this.span.id = this.config.tooltipId
    this.document.body.appendChild(this.span)
  }

  _place(x, y) {
    // 物理ピクセル位置にぴったり合わせる
    const pixelRatio = this.view.devicePixelRatio
    x = Math.round(x * pixelRatio) / pixelRatio
    y = Math.round(y * pixelRatio) / pixelRatio

    this.span.style.left = `${x}px`
    this.span.style.top = `${y}px`
    this.span.classList.add(this.config.tooltipClassRevealed)
  }

  /**
   * マウス位置および対象領域を元にして、ツールチップを適切な位置に表示します。
   * @param {string} desc - 表示する文字列
   * @param {number} mouseX - ビューポート内のマウス位置X 
   * @param {number} mouseY - ビューポート内のマウス位置Y
   * @param {DOMRect} rect - 表示対象オブジェクトの領域
   *
   */
  show(desc, mouseX, mouseY, rect) {
    // 幾何情報の取得
    this.span.dataset.desc = desc
    const tw = this.span.offsetWidth                      // ツールチップの表示幅
    const th = this.span.offsetHeight                     // ツールチップの表示高さ
    const vw = this.document.documentElement.clientWidth  // スクロールバーを除くビューポートの幅
    const vh = this.document.documentElement.clientHeight // スクロールバーを除くビューポートの高さ

    // 位置の決定
    let x = Math.max(this.config.horizontalMargin, Math.min(vw - tw - this.config.horizontalMargin, mouseX))
    let y = rect.top - this.config.verticalOffset - th
    if (y < this.config.verticalMargin) {
      y = rect.bottom + this.config.verticalOffset
      if (y + th > vh - this.config.verticalMargin)
        y = mouseY + this.config.verticalOffset
    }

    this._place(x, y)
  }

  /**
   * ツールチップを隠します。
   */
  hide() {
    this.span.classList.remove(this.config.tooltipClassRevealed)
  }
}

export {Tooltip}
