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
    $('.treespan').on('click', ::this.onTreeClick)

    {
      const url = 'https://github.com/cpprefjp/site_generator/issues/47'
      let footer = $('body > footer')
      if (footer.length) {
        this.log.warn(`applying legacy <footer> workaround... (${url})`, footer[0])
        footer.detach()
        $('main div[itemtype="http://schema.org/Article"]').append(footer)

      } else {
        this.log.warn(`legacy <footer> not found. time to remove this workaround? (${url})`)
      }
    }

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

