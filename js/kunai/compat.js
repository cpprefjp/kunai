class Compat {
  constructor(log) {
    this.log = log.makeContext('Compat')

    this.log.info('applying...')

    // fake
    window.tree_onclick = function(e) {
      // do nothing
      e.stopPropagation()
      // return false
    }

    // real...
    $('.treespan').on('click', this.onTreeClick.bind(this))

    this.log.info('applied.')
  } // constructor

  onTreeClick(e) {
    e.stopPropagation()
    let self = $(e.currentTarget)
    self.parent('li').toggleClass('active')

    // let ul = self.siblings('ul')
    // this.log.debug('onTreeClick', e, self, ul)
    // ul.toggle()
  }

  onTreeClickOld(e) {
    let self = $(e.target)
    let children = self.parent('li.parent_li').find(' > ul > li')

    this.log.debug(`onTreeClick (visible: ${children.is(':visible')}, prevented: ${e.isDefaultPrevented()})`, e)

    if (children.is(':visible')) {
      children.hide(100)
      self
        .attr('title', 'Expand this branch')
        .find(' > i')
        .addClass('glyphicon-plus')
        .removeClass('glyphicon-minus')

    } else {
      children.show(100)
      self
        .attr('title', 'Collapse this branch')
        .find(' > i')
        .addClass('glyphicon-minus')
        .removeClass('glyphicon-plus')
    }
    e.stopPropagation()
    // return false
  } // onTreeClick
} // Compat

export {Compat}

