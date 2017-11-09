import * as Badge from './badge'
import {IndexID, IndexType as IType} from 'crsearch'


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
    this.lazyLoaders = new WeakMap

    this.lastBranchID = 0
    this.branchPrevs = new Map
  }

  static scrollEps = 8

  async handleScroll(e) {
    let elem = $(e.target)
    const bID = elem.attr('data-branch-id')
    const branch = elem.children('.branch')
    const st = elem.scrollTop()
    const btop = branch.position().top
    this.log.debug(`handleScroll #${bID} (top = ${st}px, branch = ${btop}px)`, e, elem, branch)

    let topChild = null
    let topDelta = 0
    for (const child_ of branch.children('li')) {
      const child = $(child_)
      const delta = btop - child.position().top

      if (!topChild) {
        topDelta = delta
        topChild = child
      } else {
        this.log.debug(`${delta} < ${topDelta} < ${btop}`)
        if (delta > btop) {
          topDelta = delta
          topChild = child
        } else {
          break
        }
      }
    }

    {
      let last = this.branchPrevs.get(bID)
      if (last) {
        last.removeClass('preview')
      }
    }

    this.log.debug(`current branch = '${topChild.find('.cr-index > .title > .keys')[0].innerText.trim()}'`, topChild)

    this.branchPrevs.set(bID, topChild)
    topChild.addClass('preview')
    // throw [topChild, topDelta]

    if (topChild.hasClass('expanded')) {
      let bar = $(topChild.children('.expandbar')[0])
      bar.css({top: `${(st)}px`})
      // throw true
    }

    if (st < DOM.scrollEps) {
      elem.removeClass('scrolling')
    } else {
      elem.addClass('scrolling')
    }
  }

  async createContent(e, elem, obj) {
    // this.log.debug(`createContent '${obj.self.id}'`, e, elem, obj)

    switch (obj.self.id.type) {
      case IType.header:
        return await this.createHeaderContent(e, elem, obj)

      default:
        this.log.error('createContent', e, elem, obj)
        throw new Error(`unhandled index type in createContent`)
    }
  }

  async createHeaderContent(e, elem, h) {
    // this.log.debug(`createHeaderContent (${h.self.id.join()})`, e, elem, h)
    let empty = true

    if (h.classes && h.classes.length) {
      empty = false
      let classes = $('<ul>', {class: 'classes'}).appendTo(elem)
      classes.append(await Promise.all(h.classes.map(async (c) => {
        return await this.makeClass(c)
      })))
    }

    if (h.others && h.others.length) {
      empty = false
      let others = $('<ul>', {class: 'others'}).appendTo(elem)
      others.append(await Promise.all(h.others.map(async (o) => {
        return await this.makeOther(o)
      })))
    }

    if (empty) {
      elem.addClass('empty')
    }
    this.lazyLoaders.set(h.self.id, async () => await this.getHeader(h))
  }

  async getHeader(h) {
    // this.log.debug(`getHeader (${h.self.id.join()})`, h)
    return true // this.lazyLoaders.get(h.self.id)
  }

  async doExpand(id, e) {
    // this.log.debug(`doExpand '${id.join()}'`, id, e)
    await this.lazyLoaders.get(id)(e)
    $(e.target).closest('li').toggleClass('expanded')
  }

  async kunaiBranch(me, scrollHandler) {
    let elem = $('<div>', {class: 'kunai-branch', 'data-branch-id': this.lastBranchID++}).append(me.addClass('branch'))

    if (scrollHandler) {
      elem.prepend($('<div>', {class: 'preview'}))
      elem.scroll(scrollHandler)
    }

    return elem
  }

  async makeTitle(top) {
    return top.root ?
      $('<a>', {
        class: 'title',
        href: top.root.url(),
        title: top.category.name
      }).text(top.category.name) :

      $('<a>', {
        class: 'title',
        title: '存在しないページ'
      }).text(top.category.name)
  }

  async makeArticle(idx) {
    return $('<li>', {class: 'article'}).append(
      $('<a>', {href: idx.url()}).text(idx.id.join())
    )
  }

  async makeMember(m) {
    const a = $('<a>').attr('href', m.url()).html(await m.join_html(DOM.crOptions))
    let li = $('<li>', {class: 'member classy'}).append(a)

    if (this.kc.getPriorityForIndex(m).index !== this.kc.prioSpecials.get('__functions__').index) {
      li.addClass('special')
    }
    return li
  }

  async makeClass(c) {
    let li = $('<li>', {class: 'class classy'})
    $('<a>', {class: 'self'}).attr('href', c.self.url()).html(
      await c.self.join_html(DOM.crClassOptions)
    ).appendTo(li)

    if (c.self.cpp_version) {
      li.attr('data-cpp-version', c.self.cpp_version)
    }

    if (c.members && c.members.length) {
      let members = $('<ul>', {class: 'members'}).appendTo(li)
      members.append(await Promise.all(c.members.map(async (m) => {
        return await this.makeMember(m)
      })))
    } else {
      // this.log.warn(`no members present in class '${c.self.id.join()}'`, c)
    }
    return li
  }

  async makeOther(o) {
    let li = $('<li>', {class: `other ${Symbol.keyFor(o.id.type)}`})

    if (IndexID.isClassy(o.id.type)) {
      li.addClass('classy')
    }

    return li.append(
      $('<a>').attr('href', o.url()).html(await o.join_html(DOM.crOptions))
    )
  }

  async makeLang(l) {
    let ret = $('<li>', {class: 'lang', 'data-lang-id': l.self.id.join()})
    let a = $('<a>', {class: 'title', 'href': l.self.url()}).text(l.self.id.join()).appendTo(ret)

    {
      let self = $('<ul>', {class: 'articles'})
      self.append(await Promise.all(l.articles.map(async (ar) => {
        return await this.makeArticle(ar)
      })))
      ret.append(await this.kunaiBranch(self))
    }

    return ret
  }

  async makeExpandable(elem, obj) {
    this.lazyLoaders.set(
      obj.self.id,
      async (e) => {
        return await ::this.createContent(e, elem, obj)
      }
    )

    let bar = $('<div>', {class: 'expandbar'}).appendTo(elem)

    bar.append(
      $('<div>', {class: 'expander'}).on('click', async (e) => {
        await this.doExpand(obj.self.id, e)
      })
    )

    bar.append(
      $('<a>')
        .attr('href', obj.self.url())
        .html(await obj.self.join_html(DOM.crOptions))
    )
    return elem
  }

  async makeHeader(h) {
    let li = $('<li>', {class: 'header'})

    if (h.self.cpp_version) {
      li.attr('data-cpp-version', h.self.cpp_version)
    } else if (h.self.ns && h.self.ns.cpp_version) {
      // throw h
    }

    return await this.makeExpandable(li, h)
  }
}

class Treeview {
  constructor(log, kc, e, opts = {}) {
    this.log = log.makeContext('Treeview')
    this.kc = kc
    this.e = e
    this.root = $('<div>', {class: 'tree v2'}).appendTo(this.e)
    this.opts = Object.assign({}, opts)
    this.legacy = this.opts.legacy
    this.forceLegacy = false

    {
      let aaa = $('<label>', {id: 'forceLegacyWrapper'}).append($('<div>', {class: 'notice'}).text('Legacy sidebar')).prependTo(this.e)
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
    let root = $('<ul>', {class: 'root'}).appendTo(this.root)

    const cats = this.kc.categories()

    for (const top of tree) {
      if (top.category.index === cats.get('index').index) {
        continue
      }

      let e = $('<li>', {class: 'top', 'data-top-id': top.namespace.namespace[0]}).appendTo(root)
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
      let self = $('<ul>', {class: 'articles'}).append(await Promise.all(top.articles.map(async (ar) => {
        return await this.dom.makeArticle(ar)
      })))

      e.append(await this.dom.kunaiBranch(self))
    }

    if (top.headers && top.headers.length) {
      let self = $('<ul>', {class: 'headers'}).append(await Promise.all(top.headers.map(async (h) => {
        return await this.dom.makeHeader(h)
      })))

      e.append(await this.dom.kunaiBranch(
        self,
        top.category.index === this.kc.categories().get('reference').index ?
          ::this.dom.handleScroll : null
      ))
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

    let langs = $('<ul>', {class: 'langs'}).appendTo(e)

    for (const [id, t] of ltops) {
      langs.append(await this.dom.makeLang(t))
    }
  }
}

export {Treeview}

