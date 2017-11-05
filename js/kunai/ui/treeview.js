import * as Badge from './badge'

class DOM {
  constructor(log, kc) {
    this.log = log.makeContext('DOM')
    this.kc = kc
  }

  /* async */ makeScrollable(me) {
    return $('<div>').addClass('scrollable').append(me.addClass('scrollme'))
  }

  /* async */ makeAttributed(self, elem) {
    if (self.attributes && self.attributes.length) {
      let attrs = $('<ul>').addClass('attributes').appendTo(elem)

      for (const attr of self.attributes) {
        let li = $('<li>').addClass('attribute').addClass(attr).appendTo(attrs)
        const m = attr.match(/^cpp(\d[\da-zA-Z]+)(deprecated|removed)$/)
        if (m) {
          const ver = m[1]
          // let what = '(不明)'
          // if (m[2] === 'deprecated') {
            // what = '非推奨'
          // } else if (m[2] === 'removed') {
            // what = '削除'
          // }

          // li.text(`C++${ver}で${what}`)
          li.text(`C++${ver}`).addClass(m[2])
        }
      }
    }
    return elem
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
    const a = $('<a>').attr('href', idx.url()).text(idx.id.join())
    return this.makeAttributed(idx, $('<li>').addClass('article').append(a))
  }

  async makeMember(m) {
    const a = $('<a>').attr('href', m.url()).html(m.join_html())
    let li = $('<li>').addClass('member').append(a)

    if (this.kc.getPriorityForIndex(m).index !== this.kc.prioSpecials.get('__functions__').index) {
      li.addClass('special')
    }

    return this.makeAttributed(m, li)
  }

  async makeClass(c) {
    let li = $('<li>').addClass('class')
    $('<a>').attr('href', c.self.url()).addClass('self').html(c.self.join_html()).appendTo(li)

    if (c.members && c.members.length) {
      let members = $('<ul>').addClass('members').appendTo(li)
      members.append(await Promise.all(c.members.map(async (m) => {
        return await this.makeMember(m)
      })))
    } else {
      // this.log.warn(`no members present in class '${c.self.id.join()}'`, c)
    }
    return this.makeAttributed(c, li)
  }

  async makeLang(l) {
    let ret = $('<li>').addClass('lang').attr('data-lang-id', l.self.id.join())
    let a = $('<a>').addClass('title').attr('href', l.self.url()).text(l.self.id.join()).appendTo(ret)

    {
      let self = $('<ul>').addClass('articles')
      self.append(await Promise.all(l.articles.map(async (ar) => {
        return await this.makeArticle(ar)
      })))
      this.makeScrollable(self).appendTo(ret)
    }

    return ret
  }

  async makeHeader(h) {
    let ret = $('<li>').addClass('header')
    let a = $('<a>').attr('href', h.self.url()).html(h.self.join_html()).appendTo(ret)

    if (h.classes && h.classes.length) {
      let classes = $('<ul>').addClass('classes').appendTo(ret)
      classes.append(await Promise.all(h.classes.map(async (c) => {
        return await this.makeClass(c)
      })))

    } else {
      // this.log.warn(`no classes present in header '${h.self.id.join()}'`, h)
    }

    return this.makeAttributed(h, ret)
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

      this.dom.makeScrollable(self).appendTo(e)
    }

    if (top.headers && top.headers.length) {
      let self = $('<ul>').addClass('headers').append(await Promise.all(top.headers.map(async (h) => {
        return await this.dom.makeHeader(h)
      })))

      this.dom.makeScrollable(self).appendTo(e)
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

