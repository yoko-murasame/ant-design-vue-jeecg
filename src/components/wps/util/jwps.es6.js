var e; var t; var n = function () {
    return (n = Object.assign || function (e) {
        for (var t, n = 1, o = arguments.length; n < o; n++) for (var r in t = arguments[n]) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
        return e
    }).apply(this, arguments)
}; var o = (function () {
    function e() {
    }

    return e.add = function (t) {
        e._handleList.push(t), window.addEventListener('message', t, !1)
    }, e.remove = function (t) {
        var n = e._handleList.indexOf(t);
        n >= 0 && e._handleList.splice(n, 1), window.removeEventListener('message', t, !1)
    }, e.empty = function () {
        for (; e._handleList.length;) window.removeEventListener('message', e._handleList.shift(), !1)
    }, e.parse = function (e) {
        return typeof e === 'object' ? e : JSON.parse(e)
    }, e._handleList = [], e
}());
!(function (e) {
    e.unknown = 'unknown', e.spreadsheet = 's', e.writer = 'w', e.presentation = 'p', e.pdf = 'f'
}(e || (e = {}))), (function (e) {
    e.wps = 'w', e.et = 's', e.presentation = 'p', e.pdf = 'f'
}(t || (t = {})));
var r; var i; var a; var p; var c; var s; var u; var d = (r = 0, function () {
        return ++r
    }); var f = (i = null, function (e, t) {
        if (!i) {
            i = document.createElement('iframe');
            var n = {
                id: 'wps-iframe',
                src: e,
                scrolling: 'no',
                frameborder: '0',
                allowfullscreen: 'false',
                webkitallowfullscreen: 'true',
                mozallowfullscreen: 'true',
                height: 'auto',
                width: '100%'
            };
            for (var o in n) i.setAttribute(o, n[o]);
            t ? t.appendChild(i) : document.body.appendChild(i), i.destroy = function () {
                i.parentNode.removeChild(i), i = null
            }
        }
        return i
    }); var l = function (e) {
        f().contentWindow.postMessage(JSON.stringify(e), '*')
    }; var m = function (e) {
        return new Promise(function (t) {
            var n = d();
            e.type = y();
            var r = function (e) {
                var i = o.parse(e.data);
                i.eventName === 'wps.api.reply' && i.msgId === n && (t(i.data), o.remove(r))
            };
            o.add(r), l({ eventName: 'wps.jssdk.api', data: e, msgId: n })
        })
    }; var v = function (e) {
        var t = n({}, e); var o = t.headers; var r = void 0 === o ? {} : o; var i = t.subscriptions; var a = void 0 === i ? {} : i;
            var p = (t.wpsUrl, r.backBtn); var c = void 0 === p ? {} : p; var s = r.shareBtn; var u = void 0 === s ? {} : s;
            var d = r.otherMenuBtn; var f = void 0 === d ? {} : d; var l = function (e, t) {
                e.subscribe && typeof e.subscribe === 'function' && (e.callback = t, a[t] = e.subscribe, delete e.subscribe)
            };
        if (l(c, 'wpsconfig_back_btn'), l(u, 'wpsconfig_share_btn'), l(f, 'wpsconfig_other_menu_btn'), f.items && Array.isArray(f.items)) {
            var m = [];
            f.items.forEach(function (e, t) {
                switch (void 0 === e && (e = {}), e.type) {
                    case 'export_img':
                        e.type = 1, e.callback = 'export_img';
                        break;
                    case 'export_pdf':
                        e.type = 1, e.callback = 'export_pdf';
                        break;
                    case 'save_version':
                        e.type = 1, e.callback = 'save_version';
                        break;
                    case 'about_wps':
                        e.type = 1, e.callback = 'about_wps';
                        break;
                    case 'split_line':
                        e.type = 2;
                        break;
                    case 'custom':
                        e.type = 3, l(e, 'wpsconfig_other_menu_btn_' + t), m.push(e)
                }
            }), m.length && (x || b) && (f.items = m)
        }
        if (typeof a.print === 'object') {
            var v = 'wpsconfig_print';
            typeof a.print.subscribe === 'function' && (a[v] = a.print.subscribe, t.print = { callback: v }, void 0 !== a.print.custom && (t.print.custom = a.print.custom)), delete a.print
        }
        typeof a.exportPdf === 'function' && (a[v = 'wpsconfig_export_pdf'] = a.exportPdf, t.exportPdf = { callback: v }, delete a.exportPdf);
        return n({}, t, { subscriptions: a })
    }; var y = (a = '', function (n) {
        if (void 0 === n && (n = ''), !a && n) {
            var o = n.toLowerCase();
            o.indexOf('/office/s/') !== -1 && (a = e.spreadsheet), o.indexOf('/office/w/') !== -1 && (a = e.writer), o.indexOf('/office/p/') !== -1 && (a = e.presentation), o.indexOf('/office/f/') !== -1 && (a = e.pdf)
        }
        if (!a) {
            var r = n.match(/[\\?&]type=([a-z]+)/) || [];
            a = t[r[1]] || ''
        }
        return a
    }); var w = window.navigator.userAgent.toLowerCase(); var x = /Android|webOS|iPhone|iPod|BlackBerry|iPad/i.test(w);
    var b = (function () {
        try {
            return window._parent.location.search.indexOf('from=wxminiprogram') !== -1
        } catch (e) {
            return !1
        }
    }());
!(function (e) {
    e[e.wdExportFormatPDF = 17] = 'wdExportFormatPDF', e[e.wdExportFormatXPS = 18] = 'wdExportFormatXPS'
}(p || (p = {}))), (function (e) {
    e[e.wdExportAllDocument = 0] = 'wdExportAllDocument', e[e.wdExportSelection = 1] = 'wdExportSelection', e[e.wdExportCurrentPage = 2] = 'wdExportCurrentPage', e[e.wdExportFromTo = 3] = 'wdExportFromTo'
}(c || (c = {}))), (function (e) {
    e[e.wdExportDocumentContent = 0] = 'wdExportDocumentContent', e[e.wdExportDocumentWithMarkup = 7] = 'wdExportDocumentWithMarkup'
}(s || (s = {}))), (function (e) {
    e[e.title = 1] = 'title', e[e.tag = 2] = 'tag'
}(u || (u = {})));
var F;
!(function (e) {
    e[e.xlTypePDF = 0] = 'xlTypePDF', e[e.xlTypeXPS = 1] = 'xlTypeXPS'
}(F || (F = {})));
var A, g, E;
!(function (e) {
    e[e.ppFixedFormatTypePDF = 2] = 'ppFixedFormatTypePDF', e[e.ppFixedFormatTypeXPS = 1] = 'ppFixedFormatTypeXPS'
}(A || (A = {}))), (function (e) {
    e[e.ppPrintAll = 1] = 'ppPrintAll', e[e.ppPrintCurrent = 3] = 'ppPrintCurrent'
}(g || (g = {}))), (function (e) {
    e[e.msoFalse = 0] = 'msoFalse', e[e.msoTrue = -1] = 'msoTrue'
}(E || (E = {})));
var h;

function P(e) {
    return e = e || Object.create(null), {
        on: function (t, n) {
            (e[t] || (e[t] = [])).push(n)
        },
off: function (t, n) {
            e[t] && e[t].splice(e[t].indexOf(n) >>> 0, 1)
        },
emit: function (t, n) {
            (e[t] || []).slice().map(function (e) {
                e(n)
            }), (e['*'] || []).slice().map(function (e) {
                e(t, n)
            })
        }
    }
}

var k = 'fileOpen'; var D = function (e) {
    return e === 'wps.advanced.api.ready' || e === 'web_loaded'
}; var _ = function (e, t) {
    void 0 === e && (e = {});
    o.add(function (n) {
        var r = o.parse(n.data); var i = r.eventName; var a = void 0 === i ? '' : i; var p = r.data; var c = void 0 === p ? null : p;
            var s = r.url; var u = void 0 === s ? null : s;
        ['wps.jssdk.api'].indexOf(a) === -1 && (a === 'ready' ? (l({
            eventName: 'setConfig',
            data: e
        }), h.tokenData && l({
            eventName: 'setToken',
            data: h.tokenData
        }), h.iframeReady = !0) : a === 'open.result' && h.emit(k, c), D(a) && T(), typeof t[a] === 'function' && t[a](h, u || c))
    })
}; var T = function () {
    var t = y(h.url);
    t === e.writer && (function (e) {
        e.WpsApplication = function () {
            return {
                ActiveDocument: {
                    ExportAsFixedFormatAsync: function (e) {
                        var t = {
                            api: 'WpsApplication().ActiveDocument.ExportAsFixedFormatAsync',
                            args: n({
                                ExportFormat: p.wdExportFormatPDF,
                                Range: c.wdExportAllDocument,
                                From: 1,
                                To: 1,
                                Item: s.wdExportDocumentWithMarkup,
                                IncludeDocProps: !0
                            }, typeof e === 'object' ? e : {})
                        };
                        return m(t)
                    },
ImportDataIntoFieldsAsync: function (e) {
                        var t = {
                            api: 'WpsApplication().ActiveDocument.ImportDataIntoFieldsAsync',
                            args: { Data: e.Data, Options: e.Options }
                        };
                        return m(t)
                    },
ReplaceTextAsync: function (e) {
                        var t = { api: 'WpsApplication().ActiveDocument.ReplaceTextAsync', args: { Data: e.Data } };
                        return m(t)
                    }
                },
Enum: n({}, p, c, s)
            }
        }
    }(h)), t === e.spreadsheet && (function (e) {
        e.EtApplication = function () {
            return {
                ActiveWorkbook: {
                    ExportAsFixedFormatAsync: function (e) {
                        var t = {
                            api: 'EtApplication().ActiveWorkbook.ExportAsFixedFormatAsync',
                            args: n({ Type: F.xlTypePDF, IncludeDocProps: !0 }, typeof e === 'object' ? e : {})
                        };
                        return m(t)
                    },
ActiveSheet: {
                        ExportAsFixedFormatAsync: function (e) {
                            var t = {
                                api: 'EtApplication().ActiveWorkbook.ActiveSheet.ExportAsFixedFormatAsync',
                                args: n({ Type: F.xlTypePDF, IncludeDocProps: !0 }, typeof e === 'object' ? e : {})
                            };
                            return m(t)
                        }
                    }
                },
Enum: n({}, F)
            }
        }
    }(h)), t === e.presentation && (function (e) {
        e.WppApplication = function () {
            return {
                ActivePresentation: {
                    ExportAsFixedFormatAsync: function (e) {
                        var t = {
                            api: 'WppApplication().ActivePresentation.ExportAsFixedFormatAsync',
                            args: n({
                                FixedFormatType: A.ppFixedFormatTypePDF,
                                RangeType: g.ppPrintAll,
                                FrameSlides: E.msoTrue
                            }, typeof e === 'object' ? e : {})
                        };
                        return m(t)
                    }
                },
Enum: n({}, A, g)
            }
        }
    }(h))
};
// console.log("WPS WebOffice JS-SDK V1.0.11");
var O = function (e) {
    void 0 === e && (e = {}), h && h.destroy();
    try {
        var t; var r = v(e); var i = r.wpsUrl; var a = r.subscriptions; var p = void 0 === a ? {} : a; var c = r.mount;
            var s = f(i, void 0 === c ? null : c);
        return delete r.mount, delete r.wpsUrl, delete r.subscriptions, h = {
            url: i,
            version: '1.0.11',
            iframe: s,
            Enum: n({}, E),
            iframeReady: !1,
            tokenData: null,
            setToken: function (e) {
                h.tokenData = e, h.iframeReady && l({ eventName: 'setToken', data: e })
            },
            ready: function () {
                return t || (t = new Promise(function (e) {
                    var t = function (n) {
                        var r = o.parse(n.data).eventName;
                        D(r) && (e(), o.remove(t))
                    };
                    o.add(t)
                }))
            },
            destroy: function () {
                s.destroy(), o.empty(), h = null
            },
            save: function () {
                return m({ api: 'save' })
            }
        }, Object.assign(h, new P.prototype.constructor()), _(r, p), h.ready(), h
    } catch (e) {
        // console.error(e)
    }
};
export default { config: O };
export { O as config };
// # sourceMappingURL=jwps.es6.js.map
