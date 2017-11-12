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

    this.expandElems = new WeakMap
    this.topElems = new Map

    // this.scrollIsAutoFired = false
  }

  static scrollEps = 8

  async handleScroll(e) {
    // if (this.scrollIsAutoFired) {
      // this.log.debug(`handleScroll(auto)`, e)
      // this.scrollIsAutoFired = false
      // return false
    // }

    let content_wrapper = $(e.target)
    const content = content_wrapper.children('.content')

    const st = content_wrapper.scrollTop()
    const cOfs = content.position().top

    const k_branch = content.children('.kunai-branch[data-branch-for="headers"]')
    const bID = k_branch.attr('data-branch-id')
    const branch = k_branch.children('.branch')
    // this.log.debug(`handleScroll #${bID} (top = ${st}px, cOfs = ${cOfs}px)`, e, content_wrapper, content, k_branch, branch)

    let closestChild = null
    let closestDelta = 0

    // find a child item with least deltaY to current scrollTop
    for (const child_ of branch.children('li')) {
      const child = $(child_)
      const cTop = child.position().top
      const delta = st - cTop

      // this.log.debug(`checking '${child.find('.cr-index .title').get(0).innerText.trim()}' | cTop: ${cTop}, delta: ${delta} (closestDelta: ${closestDelta})`, child_)

      if (!closestChild) {
        closestDelta = delta
        closestChild = child
      } else {
        // if (cTop + (st + cOfs) < st) {
        if (cTop < st) {
          closestDelta = cTop
          closestChild = child
        } else {
          break
        }
      }
    }

    {
      let last = this.branchPrevs.get(bID)
      if (last) {
        // this.log.debug(`preview target change --> '${closestChild.find('.cr-index > .title > .keys')[0].innerText.trim()}'`, closestChild[0])
        last.removeClass('preview')
      }
    }

    this.branchPrevs.set(bID, closestChild)
    closestChild.addClass('preview')
    // throw [closestChild, closestDelta]

    if (closestChild.hasClass('expanded')) {
      let bar = $(closestChild.children('.expandbar')[0])
      bar.css({top: `${(st)}px`})
      // throw true
    }

    if (st < DOM.scrollEps) {
      content_wrapper.removeClass('scrolling')
    } else {
      content_wrapper.addClass('scrolling')
    }
  }

  async createContent(obj) {
    this.log.debug(`createContent '${obj.self.id}'`, obj)

    switch (obj.self.id.type) {
      case IType.header:
        return await this.createHeaderContent(obj)

      default:
        this.log.error('createContent', obj)
        throw new Error(`unhandled index type in createContent`)
    }
  }

  async createHeaderContent(h) {
    // this.log.debug(`createHeaderContent (${h.self.id.join()})`, e, elem, h)
    let empty = true
    let elem = this.expandElems.get(h.self.id)

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

  async doExpand(id) {
    // this.log.debug(`doExpand '${id.join()}'`, id)

    await this.lazyLoaders.get(id)()
    let elem = this.expandElems.get(id)
    // let content_wrapper = elem.closest('.content-wrapper')
    // let content = content_wrapper.children('.content')

    // const wasExpanded = elem.hasClass('expanded')
    // const oldSt = content_wrapper.scrollTop()
    // const oldOfs = content.position().top
    // const oldTop = elem.position().top

    // this.log.debug(`(oldSt: ${oldSt}, oldOfs: ${oldOfs}, oldTop: ${oldTop})`)

    elem.toggleClass('expanded')

    // if (wasExpanded) {
      // const newSt = content_wrapper.scrollTop()
      // const newOfs = content.position().top
      // const newTop = elem.position().top
      // this.log.debug(`(newSt: ${newSt}, newOfs: ${newOfs}, newTop: ${newTop})`)
      // this.scrollIsAutoFired = true
      // content_wrapper.animate({
        // scrollTop: oldTop,
      // }, 1)
    // }
  }

  async doStackExpand(topID) {
    // this.log.debug(`doStackExpand '${topID}'`, topID)

    for (let [id, e] of this.topElems) {
      if (id === topID) {
        e.toggleClass('expanded')
      } else {
        e.removeClass('expanded')
      }
    }
  }

  async scrollAt(id) {
    this.log.debug(`scrollAt '${id.join()}'`, id)

    const e = this.expandElems.get(id)
    const broot = e.closest('.kunai-branch')
    const croot = broot.closest('.content')
    let wrapper = croot.closest('.content-wrapper')
    // this.log.debug(`wrapper`, wrapper)

    // this.log.debug(`pos`, broot.position().top, croot.position().top, e.position().top, e.children('.expandbar').position().top)

    wrapper.animate({
      scrollTop: e.position().top + 4,
    }, 1)
  }

  async kunaiBranch(me, branchFor, scrollHandler) {
    let elem = $('<div>', {
      class: 'kunai-branch',
      'data-branch-id': this.lastBranchID++,
      'data-branch-for': branchFor,
    }).append(me.addClass('branch'))

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
        title: top.category.name,
      }).text(top.category.name) :

      $('<a>', {
        class: 'title',
        title: top.category.name,
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
    let li = $('<li>', {class: `other ${o.id.type}`})

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
      ret.append(await this.kunaiBranch(self, 'articles'))
    }

    return ret
  }

  async makeExpandable(elem, obj) {
    // this.log.debug(`makeExpandable '${obj.self.id.join()}'`, elem, obj)
    this.expandElems.set(obj.self.id, elem)
    this.lazyLoaders.set(
      obj.self.id,
      async () => { await this.createContent(obj) }
    )

    let bar = $('<div>', {class: 'expandbar'}).appendTo(elem)

    bar.append(
      $('<div>', {class: 'expander'}).on('click', async () => {
        await this.doExpand(obj.self.id)
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

  async onPageID(ids) {
    this.page_id = [].concat(ids)

    this.page_idx_id = null
    const ns_id = ids.shift()

    for (const type of Object.values(IType)) {
      const rvid = IndexID.composeReverseID(type, ids)
      if (this.db.reverseID.has(rvid)) {
        this.page_idx_id = this.db.reverseID.get(rvid)
      }
    }

    this.page_idx = null

    try {
      if (!this.page_idx_id) {
        throw new Error(`IndexID for path '${ids.join('/')}' not present in database`)
      }
      if (!IndexID.isClassy(this.page_idx_id.type)) {
        this.log.info(`current page '${this.page_idx_id.join()}' is not classy. nothing to expand`)

      } else {
        this.log.info(`classy page '${this.page_idx_id.join()}'`)

        for (const ns of this.db.namespaces) {
          if (ns.namespace[0] !== 'reference') continue

          this.log.debug(`checking Namespace '${ns.pretty_name()}'`, ns)
          if (ns.indexes.has(this.page_idx_id)) {
            this.page_idx = ns.indexes.get(this.page_idx_id)
          }
        }

        if (!this.page_idx) {
          throw new Error(`Index for '${this.page_idx_id.join()}' not found in any of the 'reference' namespace`)
        }

        const h = this.page_idx.in_header
        this.log.info(`expanding current page header '${h.id.join()}'`, h, this.page_idx)

        await this.dom.doStackExpand(this.page_idx.ns.namespace[0])
        await this.dom.doExpand(h.id)
        await this.dom.scrollAt(h.id)
      }

    } catch (e) {
      this.log.error(`Failed to determine current page for id '${ids.join('/')}'. Sidebar will NOT work properly! (${e})`, ids)
    }
  }

  async onData(db) {
    this.db = db
    this.tree = db.getTree(this.kc)

    // workaround name
    for (let t of this.tree) {
      if (t.root) {
        const name = t.root.id.join()
        const real_name = t.category.name
        if (name !== real_name) {
          this.log.warn(`got incorrect title '${name}'; expected = '${real_name}'. ignoring...`)
        }
      }
    }

    this.dom = new DOM(this.log, this.kc)
    await this.onDataImpl()
  }

  async onDataImpl() {
    this.log.debug('data', this.tree)
    let root = $('<ul>', {class: 'root stackable'}).appendTo(this.root)

    const cats = this.kc.categories()

    root.append(await Promise.all(
      this.tree.filter((top) => top.category.index !== cats.get('index').index).map(async (top) => {
        const topID = top.namespace.namespace[0]
        let stack = $('<li>', {
          class: 'top stack',
          'data-top-id': topID,
        })

        this.dom.topElems.set(topID, stack)

        stack.append(
          $('<div>', {class: 'heading'})
            .append(
              $('<div>', {class: 'expander'}).on(
                'click', async () =>  { this.dom.doStackExpand(topID) }
              )
            )
            .append(await this.dom.makeTitle(top))
        )

        let content_wrapper =
          $('<div>', {class: 'content-wrapper'})
          .appendTo(stack)

        let content =
          $('<div>', {class: 'content'})
          .appendTo(content_wrapper)

        let is_not_empty = false
        if (top.category.index === cats.get('lang').index) {
          is_not_empty = await this.processLangTop(top, content)
        } else {
          is_not_empty = await this.processTop(top, content)
        }

        if (!is_not_empty) {
          stack.addClass('empty')
        }

        if (top.category.index === this.kc.categories().get('reference').index) {
          content_wrapper.on('scroll', ::this.dom.handleScroll)
        }

        return stack
      })
    ))
  }

  async processTop(top, e) {
    let is_empty = true

    if (top.articles && top.articles.length) {
      is_empty = false

      let self = $('<ul>', {class: 'articles'}).append(await Promise.all(top.articles.map(async (ar) => {
        return await this.dom.makeArticle(ar)
      })))

      e.append(await this.dom.kunaiBranch(self, 'articles'))
    }

    if (top.headers && top.headers.length) {
      is_empty = false

      let self = $('<ul>', {class: 'headers'}).append(await Promise.all(top.headers.map(async (h) => {
        return await this.dom.makeHeader(h)
      })))

      e.append(await this.dom.kunaiBranch(self, 'headers'))
    }
    return !is_empty
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

    langs.append(await Promise.all(ltops.map(async ([id, t]) => {
      return await this.dom.makeLang(t)
    })))
    return true
  }
}

export {Treeview}

