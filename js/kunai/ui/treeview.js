import * as Badge from './badge'
import {IndexID} from 'crsearch'


class DOM {
  static crOptions = {
    badges: {
      noselfcpp: true,
      switches: ['simple'],
    },
  }

  static crClassOptions = {
    badges: {
      noselfcpp: false,
      switches: ['simple'],
    },
  }

  constructor(log, kc) {
    this.log = log.makeContext('DOM')
    this.kc = kc
  }

  /* async */ kunaiBranch(me) {
    return $('<div>').addClass('kunai-branch').append(me.addClass('branch'))
  }

  async makeTitle(top) {
    const TITLE_PROTO = $('<a>').addClass('title')

    if (top.root) {
      return TITLE_PROTO.clone().attr('href', top.root.url()).text(top.category.name)
    } else {
      return TITLE_PROTO.clone().text(top.category.name).attr('title', '存在しないページ')
    }
  }

  async makeArticle(idx) {
    return $('<li>').addClass('article').append(
      $('<a>').attr('href', idx.url()).text(idx.id.join())
    )
  }

  async makeMember(m) {
    const a = $('<a>').attr('href', m.url()).html(await m.join_html(DOM.crOptions))
    let li = $('<li>').addClass('member').addClass('classy').append(a)

    if (this.kc.getPriorityForIndex(m).index !== this.kc.prioSpecials.get('__functions__').index) {
      li.addClass('special')
    }
    return li
  }

  async makeClass(c) {
    let li = $('<li>').addClass('class classy')
    $('<a>').attr('href', c.self.url()).addClass('self').html(
      await c.self.join_html(DOM.crClassOptions)
    ).appendTo(li)

    if (c.self.cpp_version) {
      li.attr('data-cpp-version', c.self.cpp_version)
    }

    if (c.members && c.members.length) {
      let members = $('<ul>').addClass('members').appendTo(li)
      members.append(await Promise.all(c.members.map(async (m) => {
        return await this.makeMember(m)
      })))
    } else {
      // this.log.warn(`no members present in class '${c.self.id.join()}'`, c)
    }
    return li
  }

  async makeOther(o) {
    let li = $('<li>').addClass('other').addClass(Symbol.keyFor(o.id.type))

    if (IndexID.isClassy(o.id.type)) {
      li.addClass('classy')
    }

    return li.append(
      $('<a>').attr('href', o.url()).html(await o.join_html(DOM.crOptions))
    )
  }

  async makeLang(l) {
    let ret = $('<li>').addClass('lang').attr('data-lang-id', l.self.id.join())
    let a = $('<a>').addClass('title').attr('href', l.self.url()).text(l.self.id.join()).appendTo(ret)

    {
      let self = $('<ul>').addClass('articles')
      self.append(await Promise.all(l.articles.map(async (ar) => {
        return await this.makeArticle(ar)
      })))
      this.kunaiBranch(self).appendTo(ret)
    }

    return ret
  }

  async makeHeader(h) {
    let ret = $('<li>').addClass('header')
    let a = $('<a>').attr('href', h.self.url()).html(await h.self.join_html(DOM.crOptions)).appendTo(ret)

    if (h.self.cpp_version) {
      ret.attr('data-cpp-version', h.self.cpp_version)
    } else if (h.self.ns && h.self.ns.cpp_version) {
      // throw h
    }

    if (h.classes && h.classes.length) {
      let classes = $('<ul>').addClass('classes').appendTo(ret)
      classes.append(await Promise.all(h.classes.map(async (c) => {
        return await this.makeClass(c)
      })))
    }

    if (h.others && h.others.length) {
      let others = $('<ul>').addClass('others').appendTo(ret)
      others.append(await Promise.all(h.others.map(async (o) => {
        return await this.makeOther(o)
      })))
    }

    return ret
  }
}

class Treeview {
  constructor(log, kc, e, opts = {}) {
    this.log = log.makeContext('Treeview')
    this.kc = kc
    this.e = e
    this.root = $('<div>').addClass('tree v2').appendTo(this.e)
    this.opts = Object.assign({}, opts)
    this.legacy = this.opts.legacy
    this.forceLegacy = false

    {
      let aaa = $('<label>', {id: 'forceLegacyWrapper'}).append($('<div>').addClass('notice').text('Legacy sidebar')).prependTo(this.e)
      this.forceLegacyCheck = $('<input>', {id: 'forceLegacy', type: 'checkbox'}).appendTo(aaa)
    }

    this.forceLegacyCheck.change((e) => {
      this.e.toggleClass('force-legacy')
    })

    this.log.debug('initialzing...')

    if (this.legacy) {
      const c = Badge.sanitize(this.e.find('.cpp-sidebar'))
      this.log.debug(`found ${c} badges`)
    }
  }

  async onData(tree) {
    const runID = JSON.stringify({name: 'onData', timestamp: Date.now()})
    console.time(runID)
    try {
      this.dom = new DOM(this.log, this.kc)
      await this.onDataImpl(tree)
    } finally {
      console.timeEnd(runID)
    }
  }

  async onDataImpl(tree) {
    this.log.debug('data', tree)
    let root = $('<ul>').addClass('root').appendTo(this.root)
    const HEADER_PROTO = $('<li>').addClass('header')
    const CLASS_PROTO = $('<li>').addClass('class')

    const cats = this.kc.categories()

    for (const top of tree) {
      if (top.category.index === cats.get('index').index) {
        continue
      }

      let e = $('<li>').addClass('top').appendTo(root).attr('data-top-id', top.namespace.namespace[0])
      e.append(await this.dom.makeTitle(top))

      if (top.category.index === cats.get('lang').index) {
        this.processLangTop(top, e)
      } else {
        this.processTop(top, e)
      }
    }
  }

  async processTop(top, e) {
    if (top.articles && top.articles.length) {
      let self = $('<ul>').addClass('articles').append(await Promise.all(top.articles.map(async (ar) => {
        return await this.dom.makeArticle(ar)
      })))

      this.dom.kunaiBranch(self).appendTo(e)
    }

    if (top.headers && top.headers.length) {
      let self = $('<ul>').addClass('headers').append(await Promise.all(top.headers.map(async (h) => {
        return await this.dom.makeHeader(h)
      })))

      this.dom.kunaiBranch(self).appendTo(e)
    }
  }

  async processLangTop(top, e) {
    const ars = top.articles
    let ltops = new Map(ars.filter((idx) => idx.page_id.length === 1).map((idx) => {
      return [idx.page_id[0], {self: idx, articles: []}]
    }))

    for (const ar of ars) {
      if (ar.page_id.length >= 2) {
        ltops.get(ar.page_id[0]).articles.push(ar)
      }
    }
    ltops = Array.from(ltops).sort(([aid, {aself, aarticles}], [bid, {bself, barticles}]) => {
      return aid < bid ? 1 : -1
    })

    let langs = $('<ul>').addClass('langs').appendTo(e)

    for (const [id, t] of ltops) {
      langs.append(await this.dom.makeLang(t))
    }
  }
}

export {Treeview}

