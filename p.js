"use strict";
!(function (f, l, m, n) {
  XF.Message = XF.Message || {};
  XF.Message.insertMessages = function (a, b, c, d) {
    XF.setupHtmlInsert(a, function (e, g, h) {
      g = b.find(".js-replyNoMessages");
      g.length && g.xfFadeUp();
      e.each(function () {
        this.tagName && XF.Message.insertMessage(f(this), b, c);
      });
      d && d(e);
    });
  };
  XF.Message.insertMessage = function (a, b, c) {
    var d = b.children().first();
    a.hide();
    d.is("form") && !c ? a.insertAfter(d) : c ? b.append(a) : b.prepend(a);
    a.xfFadeDown();
    XF.activate(a);
  };
  XF.MessageLoaderClick = XF.Event.newHandler({
    eventNameSpace: "XFMessageLoaderClick",
    options: { href: null, messagesContainer: "< .js-replyNewMessageContainer", selfContainer: ".message", ascending: !0 },
    loading: !1,
    init: function () {
      this.options.href || ((this.options.href = this.$target.attr("href")), this.options.href || console.error("Must be initialized with a data-href or href attribute."));
    },
    click: function (a) {
      a.preventDefault();
      if (!this.loading) {
        var b = this;
        XF.ajax("GET", this.options.href, {}, XF.proxy(this, "loaded")).always(function () {
          b.loading = !1;
        });
      }
    },
    loaded: function (a) {
      if (a.html) {
        var b = XF.findRelativeIf(this.options.messagesContainer, this.$target);
        XF.Message.insertMessages(a.html, b, this.options.ascending);
        var c = this.$target.closest(this.options.selfContainer);
        c.xfFadeUp(null, function () {
          c.remove();
        });
        a.lastDate && f('.js-quickReply input[name="last_date"]').val(a.lastDate);
      }
    },
  });
  XF.QuickEditClick = XF.Event.newHandler({
    eventNameSpace: "XFQuickEdit",
    options: { editorTarget: null, editContainer: ".js-editContainer", href: null, noInlineMod: 0 },
    $editorTarget: null,
    $editForm: null,
    href: null,
    loading: !1,
    init: function () {
      var a = this.options.editorTarget;
      a
        ? ((this.$editorTarget = XF.findRelativeIf(a, this.$target)),
          this.$editorTarget.length ? (this.href = this.options.href || this.$target.attr("href")) || console.error("No edit URL specified.") : console.error("No quick edit target found"))
        : console.error("No quick edit editorTarget specified");
    },
    click: function (a) {
      this.$editorTarget &&
        this.href &&
        (a.preventDefault(),
        this.loading ||
          ((this.loading = !0), (a = {}), this.options.noInlineMod && (a._xfNoInlineMod = !0), XF.ajax("GET", this.href, a, XF.proxy(this, "handleAjax"), { skipDefaultSuccessError: !0 })));
    },
    handleAjax: function (a) {
      var b = this.$editorTarget,
        c = this;
      a.errors
        ? ((this.loading = !1), XF.alert(a.errors))
        : XF.setupHtmlInsert(a.html, function (d, e) {
            d.hide().insertAfter(b);
            XF.activate(d);
            c.$editForm = d;
            d.on("ajax-submit:response", XF.proxy(c, "editSubmit"));
            d.find(".js-cancelButton").on("click", XF.proxy(c, "cancelClick"));
            d.find("input[type=hidden]").first().after('<input type="hidden" name="_xfInlineEdit" value="1" />');
            b.xfFadeUp(null, function () {
              b.parent().addClass("is-editing");
              d.xfFadeDown(XF.config.speed.normal, function () {
                d.trigger("quick-edit:shown");
                var g = d.find(c.options.editContainer);
                g.length && !XF.isElementVisible(g) && g.get(0).scrollIntoView(!0);
                c.loading = !1;
              });
            });
            d.trigger("quick-edit:show");
          });
    },
    editSubmit: function (a, b) {
      if (!b.errors && !b.exception) {
        a.preventDefault();
        b.message && XF.flashMessage(b.message, 3e3);
        var c = this.$editorTarget,
          d = this;
        XF.setupHtmlInsert(b.html, function (e, g, h) {
          g = d.options.editorTarget;
          g = g.replace(/<|\|/g, "").replace(/#[a-zA-Z0-9_-]+\s*/, "");
          var k = e.find(g);
          k.hide();
          c.replaceWith(k);
          d.$editorTarget = k;
          XF.activate(k);
          d.stopEditing(!1, function () {
            k.xfFadeDown();
            d.$editForm.trigger("quickedit:editcomplete", b);
          });
        });
      }
    },
    cancelClick: function (a) {
      this.stopEditing(!0);
    },
    stopEditing: function (a, b) {
      var c = this.$editorTarget,
        d = this.$editForm,
        e = this,
        g = function () {
          c.parent().removeClass("is-editing");
          a && c.xfFadeDown();
          b && b();
          d.remove();
          e.$editForm = null;
        };
      d ? d.xfFadeUp(null, g) : g();
    },
  });
  XF.QuoteClick = XF.Event.newHandler({
    eventNameSpace: "XFQuoteClick",
    options: { quoteHref: null, editor: ".js-quickReply .js-editor" },
    init: function () {
      this.options.quoteHref || console.error("Must be initialized with a data-quote-href attribute.");
    },
    click: function (a) {
      var b = XF.findRelativeIf(this.options.editor, this.$target);
      b.closest("form").trigger("preview:hide", [this]);
      var c = b.closest(".js-quickReply");
      if (b.length && c.length) {
        a.preventDefault();
        var d = this.options.quoteHref,
          e = f(a.target).parents(".tooltip--selectToQuote");
        e = XF.unparseBbCode(e.data("quote-html"));
        XF.ajax("POST", d, { quoteHtml: e }, XF.proxy(this, "handleAjax"), { skipDefaultSuccess: !0 });
        f(a.target).trigger("s2q:click");
        l.scrollTo({ top: c.offset().top - XF.getStickyHeaderOffset() });
        XF.focusEditor(b);
      }
    },
    handleAjax: function (a) {
      var b = XF.findRelativeIf(this.options.editor, this.$target);
      XF.insertIntoEditor(b, a.quoteHtml, a.quote);
    },
  });
  XF.SolutionEditClick = XF.extend(XF.SwitchClick, {
    applyResponseActions: function (a) {
      this.applyActionsTo(this.$target, a);
    },
    applyActionsTo: function (a, b) {
      var c;
      if (b.switchKey && (c = b.switchKey.match(/^replaced:(\d+)$/))) {
        var d = parseInt(c[1], 10);
        b.switchKey = "marked";
      }
      XF.handleSwitchResponse(a, b, this.options.redirect);
      a = a.closest(".message");
      "marked" == b.switchKey
        ? a.addClass("message--solution")
        : "removed" == b.switchKey &&
          (a.removeClass("message--solution"), (c = a.offset().top), (b = f(m).scrollTop()), f("#js-solutionHighlightBlock").remove(), (a = a.offset().top - c) && f(m).scrollTop(b + a));
      d && ((d = f("#js-post-" + d + " .js-solutionControl")), d.length && this.applyActionsTo(d, { switchKey: "removed" }));
    },
  });
  XF.MultiQuote = XF.Element.newHandler({
    options: { href: "", messageSelector: "", addMessage: "", removeMessage: "", storageKey: "" },
    mqStorage: null,
    mqOverlay: null,
    removing: !1,
    quoting: !1,
    init: function () {
      this.initButton();
      this.initControls();
      var a = this;
      XF.CrossTab.on("mqChange", function (b) {
        if (b.storageKey === a.options.storageKey) {
          var c = b.messageId;
          switch (b.action) {
            case "added":
              a.selectMqControl(c);
              break;
            case "removed":
              a.deselectMqControl(c);
          }
          a.refreshMqData();
          a.updateButtonState();
        }
      });
    },
    initButton: function () {
      this.mqStorage = XF.LocalStorage.getJson(this.options.storageKey);
      this.hasQuotesStored() && this.$target.show();
      this.$target.on("click", XF.proxy(this, "buttonClick"));
    },
    buttonClick: function (a) {
      a.preventDefault();
      if (!this.options.href) return console.error("Multi-quote button must have a data-href attribute set to display selected quotes"), !1;
      XF.ajax("post", this.options.href, { quotes: XF.LocalStorage.get(this.options.storageKey) }, XF.proxy(this, "loadOverlay"));
    },
    loadOverlay: function (a) {
      if (a.html) {
        var b = this;
        XF.setupHtmlInsert(a.html, function (c, d) {
          c = XF.getOverlayHtml({ html: c, title: d.h1 || d.title });
          c.find(".js-removeMessage").on("click", XF.proxy(b, "removeMessage"));
          c.find(".js-quoteMessages").on("click", XF.proxy(b, "quoteMessages"));
          b.mqOverlay = XF.showOverlay(c);
        });
      }
    },
    removeMessage: function (a) {
      a.preventDefault();
      if (!this.removing) {
        this.removing = !0;
        var b = f(a.target).closest(".nestable-item");
        a = b.data("id");
        var c = this.mqOverlay;
        this.removeFromMultiQuote(a);
        b.xfFadeUp(XF.config.speed.fast, function () {
          b.remove();
        });
        this.hasQuotesStored() || c.hide();
        this.removing = !1;
      }
    },
    quoteMessages: function (a) {
      a.preventDefault();
      if (!this.quoting) {
        this.quoting = !0;
        a = this.mqOverlay;
        var b = a.getOverlay();
        b = f.parseJSON(b.find('input[name="message_ids"]').val());
        var c = this.mqStorage,
          d = this,
          e;
        for (e in b)
          if (b.hasOwnProperty(e) && b[e].hasOwnProperty("id")) {
            var g = b[e].id.split("-"),
              h = g[0];
            g = g[1];
            this.isValidQuote(c[h], g) && ((h = c[h][g]), !0 !== h && (h = XF.unparseBbCode(h)), (b[e].value = h));
          }
        a.hide();
        XF.ajax("post", this.options.href, { insert: b, quotes: XF.LocalStorage.get(this.options.storageKey) }, XF.proxy(this, "insertMessages")).always(function () {
          d.quoting = !1;
        });
      }
    },
    isValidQuote: function (a, b) {
      return void 0 == a || !a.hasOwnProperty(b) || (!0 !== a[b] && "string" != typeof a[b]) ? !1 : !0;
    },
    insertMessages: function (a) {
      var b = XF.findRelativeIf("< form | .js-editor", this.$target).first();
      b.length || (b = f(".js-editor").parent());
      f.each(a, function (d, e) {
        if (!e.hasOwnProperty("quote") || !e.hasOwnProperty("quoteHtml")) return !0;
        0 < d && ((e.quoteHtml = "<p></p>" + e.quoteHtml), (e.quote = "\n" + e.quote));
        XF.insertIntoEditor(b, e.quoteHtml, e.quote);
      });
      for (var c in this.mqStorage) this.removeFromMultiQuote(c);
    },
    initControls: function () {
      var a = ".tooltip--selectToQuote, " + this.options.messageSelector,
        b = f(a).find(".js-multiQuote");
      f(m).on("click", a, XF.proxy(this, "controlClick"));
      var c = this;
      b.each(function () {
        var d = f(this),
          e = d.data("messageId");
        c.mqStorage.hasOwnProperty(e) && (d.addClass("is-selected"), d.data("mqAction", "remove"));
      });
    },
    controlClick: function (a) {
      if (f(a.target).is(".js-multiQuote")) {
        a.preventDefault();
        var b = f(a.target),
          c = b.data("mqAction");
        b = b.data("messageId");
        switch (c) {
          case "add":
            this.addToMultiQuote(b);
            XF.flashMessage(this.options.addMessage, 3e3);
            break;
          case "remove":
            this.removeFromMultiQuote(b), XF.flashMessage(this.options.removeMessage, 3e3);
        }
        f(a.target).trigger("s2q:click");
      }
    },
    addToMultiQuote: function (a) {
      var b = f('.js-multiQuote[data-message-id="' + a + '"]').parents(".tooltip--selectToQuote"),
        c = XF.unparseBbCode(b.data("quote-html"));
      this.refreshMqData();
      this.hasQuotesStored() ? this.mqStorage[a] || (this.mqStorage[a] = []) : ((this.mqStorage = {}), (this.mqStorage[a] = []));
      b.length ? this.mqStorage[a].push(c) : this.mqStorage[a].push(!0);
      this.updateMultiQuote();
      this.selectMqControl(a);
      this.triggerCrossTabEvent("added", a);
    },
    removeFromMultiQuote: function (a) {
      var b = String(a).match(/^(\d+)-(\d+)$/);
      this.refreshMqData();
      b ? ((a = b[1]), delete this.mqStorage[a][b[2]], this.getQuoteStoreCount(this.mqStorage[a]) || delete this.mqStorage[a]) : delete this.mqStorage[a];
      this.updateMultiQuote();
      this.mqStorage[a] || (this.deselectMqControl(a), this.triggerCrossTabEvent("removed", a));
    },
    selectMqControl: function (a) {
      a = f('.js-multiQuote[data-message-id="' + a + '"]');
      a.length && (a.addClass("is-selected"), a.data("mqAction", "remove"));
    },
    deselectMqControl: function (a) {
      a = f('.js-multiQuote[data-message-id="' + a + '"]');
      a.length && (a.removeClass("is-selected"), a.data("mqAction", "add"));
    },
    getQuoteStoreCount: function (a) {
      var b = 0,
        c;
      for (c in a) a.hasOwnProperty(c) && (1 == a[c] || "string" == typeof a[c]) && b++;
      return b;
    },
    updateMultiQuote: function () {
      XF.LocalStorage.setJson(this.options.storageKey, this.mqStorage, !0);
      this.updateButtonState();
    },
    updateButtonState: function () {
      this.hasQuotesStored() ? this.$target.show() : this.$target.hide();
    },
    refreshMqData: function () {
      this.mqStorage = XF.LocalStorage.getJson(this.options.storageKey);
    },
    hasQuotesStored: function () {
      return this.mqStorage && !f.isEmptyObject(this.mqStorage);
    },
    triggerCrossTabEvent: function (a, b, c) {
      c = c || {};
      c.storageKey = this.options.storageKey;
      c.action = a;
      c.messageId = b;
      XF.CrossTab.trigger("mqChange", c);
    },
  });
  XF.SelectToQuote = XF.Element.newHandler({
    options: { messageSelector: "" },
    $quickReply: null,
    timeout: null,
    processing: !1,
    triggerEvent: null,
    isMouseDown: !1,
    tooltip: null,
    tooltipId: null,
    init: function () {
      l.getSelection &&
        (this.options.messageSelector
          ? ((this.$quickReply = f(".js-quickReply .js-editor").parent()),
            this.$quickReply.length &&
              (this.$target.on("mousedown pointerdown", XF.proxy(this, "mouseDown")),
              this.$target.on("mouseup pointerup", XF.proxy(this, "mouseUp")),
              f(m).on("selectionchange", XF.proxy(this, "selectionChange"))))
          : console.error("No messageSelector"));
    },
    mouseDown: function (a) {
      this.triggerEvent = a;
      "mousedown" == a.type && (this.isMouseDown = !0);
    },
    mouseUp: function () {
      this.isMouseDown = !1;
      this.trigger();
    },
    selectionChange: function () {
      this.isMouseDown || this.trigger();
    },
    trigger: function () {
      this.timeout || this.processing || (this.timeout = setTimeout(XF.proxy(this, "handleSelection"), 100));
    },
    handleSelection: function () {
      this.processing = !0;
      this.timeout = null;
      var a = l.getSelection(),
        b = this.getValidSelectionContainer(a);
      b ? this.showQuoteButton(b, a) : this.hideQuoteButton();
      var c = this;
      setTimeout(function () {
        c.processing = !1;
      }, 0);
    },
    getValidSelectionContainer: function (a) {
      if (a.isCollapsed || !a.rangeCount) return null;
      a = a.getRangeAt(0);
      this.adjustRange(a);
      if (!f.trim(a.toString()).length && !a.cloneContents().querySelectorAll("img").length) return null;
      var b = f(a.commonAncestorContainer).closest(".js-selectToQuote");
      return b.length &&
        b.closest(this.$target).length &&
        b.closest(this.options.messageSelector).find('.actionBar-action[data-xf-click="quote"]').length &&
        !f(a.startContainer).closest(".bbCodeBlock--quote, .js-noSelectToQuote").length &&
        !f(a.endContainer).closest(".bbCodeBlock--quote, .js-noSelectToQuote").length
        ? b
        : null;
    },
    adjustRange: function (a) {
      var b = !1,
        c = !1,
        d = a.endContainer,
        e = f(d);
      0 == a.endOffset && (3 != d.nodeType || d.previousSibling || (e = e.parent()), (c = 0 < e.closest(".bbCodeBlock--quote").length));
      c && ((c = e.closest(".bbCodeBlock--quote")), c.length && (a.setEndBefore(c[0]), (b = !0)));
      b && ((b = l.getSelection()), b.removeAllRanges(), b.addRange(a));
    },
    showQuoteButton: function (a, b) {
      var c = a.xfUniqueId();
      (this.tooltip && this.tooltipId === c) || (this.hideQuoteButton(), this.createButton(a, c));
      a = this.tooltip.getTooltip();
      a.data("quote-html", this.getSelectionHtml(b));
      b = this.getButtonPositionMarker(b);
      c = !1;
      this.triggerEvent && (c = XF.isEventTouchTriggered(this.triggerEvent));
      c && (b.top += 10);
      this.tooltip.setPositioner([b.left, b.top]);
      this.tooltip.isShown() ? this.tooltip.reposition() : this.tooltip.show();
      a.addClass("tooltip--selectToQuote");
    },
    getButtonPositionMarker: function (a) {
      var b = f("<span />").text("\u200b");
      var c = a.getRangeAt(0).cloneRange();
      a = c.getBoundingClientRect ? c.getBoundingClientRect() : null;
      c.collapse(!1);
      c.insertNode(b[0]);
      var d = 0;
      do {
        c = !1;
        d++;
        b[0].parentNode && "js-selectToQuoteEnd" == b[0].parentNode.className && (b.insertBefore(b[0].parentNode), (c = !0));
        b[0].previousSibling && 3 == b[0].previousSibling.nodeType && 0 == f.trim(b[0].previousSibling.textContent).length && (b.insertBefore(b[0].previousSibling), (c = !0));
        if (b[0].parentNode && "LI" == b[0].parentNode.tagName && !b[0].previousSibling) {
          var e = b[0].parentNode;
          f(e).prev("li").length ? (b.appendTo(f(e).prev("li")), (c = !0)) : e.parentNode && (b.insertBefore(e.parentNode), (c = !0));
        }
        b[0].parentNode && !b[0].previousSibling && -1 != f.inArray(b[0].parentNode.tagName, ["DIV", "BLOCKQUOTE", "PRE"]) && (b.insertBefore(b[0].parentNode), (c = !0));
        b[0].previousSibling && -1 != f.inArray(b[0].previousSibling.tagName, ["OL", "UL"]) && (f(b[0].previousSibling).find("li").last().append(b), (c = !0));
        b[0].previousSibling && -1 != f.inArray(b[0].previousSibling.tagName, ["DIV", "BLOCKQUOTE", "PRE"]) && (b.appendTo(b[0].previousSibling), (c = !0));
        b[0].previousSibling && "BR" == b[0].previousSibling.tagName && (b.insertBefore(b[0].previousSibling), (c = !0));
      } while (c && 5 > d);
      var g = b.offset();
      c = b.height();
      b.parentsUntil("body").each(function () {
        var h = f(this);
        switch (h.css("overflow-x")) {
          case "hidden":
          case "scroll":
          case "auto":
            var k = h.offset().left;
            h = k + h.outerWidth();
            g.left < k && (g.left = k);
            h < g.left && (g.left = h);
        }
      });
      d = b.parent();
      b.remove();
      XF.browser.msie || d[0].normalize();
      a && !XF.isRtl() && 32 < g.left - a.left && (g.left -= 16);
      g.top += c;
      return g;
    },
    createButton: function (a, b) {
      var c = a.closest(this.options.messageSelector);
      a = f("<span />");
      var d = c.find(".actionBar-action.js-multiQuote").clone();
      d.length &&
        (d.attr("title", "").removeClass("is-selected").data("mqAction", "add").css({ marginLeft: 0, background: "transparent" }).on("s2q:click", XF.proxy(this, "buttonClicked")),
        a.append(d),
        a.append(m.createTextNode(" | ")));
      c = c.find('.actionBar-action[data-xf-click="quote"]').attr("title", "").clone().css({ marginLeft: 0 }).on("s2q:click", XF.proxy(this, "buttonClicked"));
      a.append(c);
      this.tooltip = new XF.TooltipElement(a, { html: !0, placement: "bottom" });
      this.tooltipId = b;
    },
    buttonClicked: function () {
      var a = l.getSelection();
      a.isCollapsed || (a.collapse(a.getRangeAt(0).commonAncestorContainer, 0), this.hideQuoteButton());
    },
    hideQuoteButton: function () {
      var a = this.tooltip;
      a && (a.destroy(), (this.tooltip = null));
    },
    getSelectionHtml: function (a) {
      var b = m.createElement("div"),
        c;
      var d = 0;
      for (c = a.rangeCount; d < c; d++) {
        var e = a.getRangeAt(d).cloneContents();
        this.groupIncompleteTableSegment(e, "td, th", "tr", "TR");
        this.groupIncompleteTableSegment(e, "tr", "table, tbody, thead, tfoot", "TABLE");
        this.groupIncompleteTableSegment(e, "tbody, thead, tfoot", "table", "TABLE");
        b.appendChild(e);
      }
      return this.prepareSelectionHtml(b.innerHTML);
    },
    groupIncompleteTableSegment: function (a, b, c, d) {
      a = a.querySelectorAll(b);
      var e, g, h;
      for (e = 0; e < a.length; e++) {
        var k = a[e];
        if (!f(k.parentNode).is(c)) {
          for (g = [k]; (k = k.nextSibling); )
            if (f(k).is(b)) g.push(k);
            else break;
          k = m.createElement(d);
          g[0].parentNode.insertBefore(k, g[0]);
          for (h = 0; h < g.length; h++) k.appendChild(g[h]);
        }
      }
    },
    prepareSelectionHtml: function (a) {
      return XF.adjustHtmlForRte(a);
    },
  });
  XF.QuickReply = XF.Element.newHandler({
    options: { messageContainer: "", ascending: !0, submitHide: null },
    init: function () {
      this.$target.on("ajax-submit:before", XF.proxy(this, "beforeSubmit"));
      this.$target.on("ajax-submit:response", XF.proxy(this, "afterSubmit"));
      this.$target.on("draft:complete", XF.proxy(this, "onDraft"));
    },
    beforeSubmit: function (a, b) {
      (b = b.submitButton) && "more_options" == b.attr("name") && a.preventDefault();
    },
    afterSubmit: function (a, b) {
      b.errors ||
        b.exception ||
        (a.preventDefault(),
        b.redirect
          ? XF.redirect(b.redirect)
          : (this.$target.find('input[name="last_date"]').val(b.lastDate),
            this.getMessagesContainer().find(".js-newMessagesIndicator").remove(),
            this.insertMessages(b.html),
            XF.clearEditorContent(this.$target),
            (a = XF.getEditorInContainer(this.$target)) && XF.Editor && a instanceof XF.Editor && a.blur(),
            (a = this.$target),
            (b = this.options),
            a.trigger("preview:hide", [this]),
            a.trigger("attachment-manager:reset"),
            b.submitHide && XF.findRelativeIf(b.submitHide, this.$target).hide()));
    },
    insertMessages: function (a) {
      XF.Message.insertMessages(a, this.getMessagesContainer(), this.options.ascending, function (b) {
        if ((b = b.first()) && b.length) {
          b = b.dimensions();
          var c = f(l).scrollTop(),
            d = c + f(l).height();
          (b.top < c + 50 || b.top > d) && XF.smoothScroll(Math.max(0, b.top - 60), !1, 200);
        }
      });
    },
    getMessagesContainer: function () {
      var a = this.options.messageContainer;
      return a ? XF.findRelativeIf(a, this.$target).first() : f(".js-replyNewMessageContainer").first();
    },
    onDraft: function (a, b) {
      if (b.hasNew && b.html) {
        if (b.lastDate && 0 < b.lastDate && ((a = f('.js-quickReply input[name="last_date"]')), a.length && parseInt(a.val(), 10) > b.lastDate)) return;
        this.getMessagesContainer().find(".js-newMessagesIndicator").length || this.insertMessages(b.html);
      }
    },
  });
  XF.PostEdit = XF.Element.newHandler({
    init: function () {
      this.$target.on("quickedit:editcomplete", XF.proxy(this, "editComplete"));
    },
    editComplete: function (a, b) {
      var c = this;
      XF.setupHtmlInsert(b.html, function (d, e, g) {
        g = b.threadChanges || {};
        g.title &&
          (f("h1.p-title-value").html(e.h1),
          f("title").html(e.title),
          XF.config.visitorCounts.title_count && b.visitor && ((XF.pageTitleCache = e.title), XF.pageTitleCounterUpdate(b.visitor.total_unread)));
        if (g.customFields) {
          var h = d.closest(".js-threadStatusField"),
            k = XF.findRelativeIf("< .block--messages | .js-threadStatusField", c.$target);
          h.length &&
            k.length &&
            k.xfFadeUp(XF.config.speed.fast, function () {
              k.replaceWith(h).xfFadeDown(XF.config.speed.fast);
            });
        } else d.find(".js-threadStatusField").remove();
      });
    },
  });
  XF.Event.register("click", "message-loader", "XF.MessageLoaderClick");
  XF.Event.register("click", "quick-edit", "XF.QuickEditClick");
  XF.Event.register("click", "quote", "XF.QuoteClick");
  XF.Event.register("click", "solution-edit", "XF.SolutionEditClick");
  XF.Element.register("multi-quote", "XF.MultiQuote");
  XF.Element.register("select-to-quote", "XF.SelectToQuote");
  XF.Element.register("quick-reply", "XF.QuickReply");
  XF.Element.register("post-edit", "XF.PostEdit");
})(jQuery, window, document);
