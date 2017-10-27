import {KunaiError, NetworkError} from '../error'

class MetaError extends KunaiError {
  constructor() {
    super(...arguments)
  }
}

export {MetaError}

