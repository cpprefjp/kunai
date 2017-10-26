import {Logger} from './kunai/logger'
import {PageData} from './kunai/page-data'


export default class Kunai {
  constructor(opts = {}) {
    this.log = new Logger('Kunai', opts)
  }

  start() {
    this.log.info('loading...')
    this.start_impl()
    this.log.info('loaded.')
  }

  start_impl() {
    this.pd = new PageData(this.log)
  }
}

