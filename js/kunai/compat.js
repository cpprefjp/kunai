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
} // Compat

export {Compat}

