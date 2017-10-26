class KunaiError {
  constructor(reason, ...args) {
    // super(reason, ...args)
    this.reason = reason
    this.args = args
  }
}

class ParseError extends KunaiError {
  constructor() {
    super(...arguments)
  }
}

class NetworkError extends KunaiError {
  constructor() {
    super(...arguments)
  }
}

export {KunaiError, ParseError, NetworkError}

