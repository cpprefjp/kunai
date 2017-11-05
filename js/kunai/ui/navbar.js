class Navbar {
  constructor(log) {
    this.log = log.makeContext('Navbar')
    this.log.debug('initializing...')

    this.btn = $('nav.navbar button.navbar-toggle')
    this.target = $(this.btn.attr('data-target'))
    this.btn.on('click', ::this.onNavbarToggle)
  }

  onNavbarToggle(e) {
    // this.log.debug('onNavbarToggle', e)
    e.preventDefault()

    this.btn.toggleClass('collapsed')
    this.target.toggleClass('collapse')
  }
}

export {Navbar}

