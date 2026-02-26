(() => {
  var e = {};
  ((e.id = 105),
    (e.ids = [105]),
    (e.modules = {
      846: (e) => {
        "use strict";
        e.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js");
      },
      9121: (e) => {
        "use strict";
        e.exports = require("next/dist/server/app-render/action-async-storage.external.js");
      },
      9294: (e) => {
        "use strict";
        e.exports = require("next/dist/server/app-render/work-async-storage.external.js");
      },
      3033: (e) => {
        "use strict";
        e.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");
      },
      3873: (e) => {
        "use strict";
        e.exports = require("path");
      },
      1271: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, {
            GlobalError: () => s.a,
            __next_app__: () => d,
            pages: () => u,
            routeModule: () => p,
            tree: () => l,
          }));
        var i = r(260),
          o = r(8203),
          n = r(5155),
          s = r.n(n),
          a = r(7292),
          c = {};
        for (let e in a)
          0 >
            ["default", "tree", "pages", "GlobalError", "__next_app__", "routeModule"].indexOf(e) &&
            (c[e] = () => a[e]);
        r.d(t, c);
        let l = [
            "",
            {
              children: [
                "dashboard",
                {
                  children: [
                    "__PAGE__",
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(r.bind(r, 2176)),
                        "/Users/zardoz/projects/blerp/examples/nextjs-quickstart/src/app/dashboard/page.tsx",
                      ],
                    },
                  ],
                },
                {},
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(r.bind(r, 1354)),
                "/Users/zardoz/projects/blerp/examples/nextjs-quickstart/src/app/layout.tsx",
              ],
              "not-found": [
                () => Promise.resolve().then(r.t.bind(r, 9937, 23)),
                "next/dist/client/components/not-found-error",
              ],
            },
          ],
          u = [
            "/Users/zardoz/projects/blerp/examples/nextjs-quickstart/src/app/dashboard/page.tsx",
          ],
          d = { require: r, loadChunk: () => Promise.resolve() },
          p = new i.AppPageRouteModule({
            definition: {
              kind: o.RouteKind.APP_PAGE,
              page: "/dashboard/page",
              pathname: "/dashboard",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: l },
          });
      },
      1616: (e, t, r) => {
        (Promise.resolve().then(r.t.bind(r, 3219, 23)),
          Promise.resolve().then(r.t.bind(r, 4863, 23)),
          Promise.resolve().then(r.t.bind(r, 5155, 23)),
          Promise.resolve().then(r.t.bind(r, 9350, 23)),
          Promise.resolve().then(r.t.bind(r, 6313, 23)),
          Promise.resolve().then(r.t.bind(r, 8530, 23)),
          Promise.resolve().then(r.t.bind(r, 8921, 23)));
      },
      5168: (e, t, r) => {
        (Promise.resolve().then(r.t.bind(r, 6959, 23)),
          Promise.resolve().then(r.t.bind(r, 3875, 23)),
          Promise.resolve().then(r.t.bind(r, 8903, 23)),
          Promise.resolve().then(r.t.bind(r, 4178, 23)),
          Promise.resolve().then(r.t.bind(r, 6013, 23)),
          Promise.resolve().then(r.t.bind(r, 7190, 23)),
          Promise.resolve().then(r.t.bind(r, 1365, 23)));
      },
      4545: (e, t, r) => {
        (Promise.resolve().then(r.bind(r, 9932)),
          Promise.resolve().then(r.bind(r, 4889)),
          Promise.resolve().then(r.bind(r, 1415)),
          Promise.resolve().then(r.bind(r, 8455)));
      },
      4817: (e, t, r) => {
        (Promise.resolve().then(r.bind(r, 1980)),
          Promise.resolve().then(r.bind(r, 2697)),
          Promise.resolve().then(r.bind(r, 2200)),
          Promise.resolve().then(r.bind(r, 1007)));
      },
      6487: () => {},
      8335: () => {},
      4446: (e, t, r) => {
        var i;
        (() => {
          var o = {
              226: function (o, n) {
                !(function (s, a) {
                  "use strict";
                  var c = "function",
                    l = "undefined",
                    u = "object",
                    d = "string",
                    p = "major",
                    b = "model",
                    h = "name",
                    f = "type",
                    m = "vendor",
                    w = "version",
                    g = "architecture",
                    y = "console",
                    v = "mobile",
                    x = "tablet",
                    k = "smarttv",
                    j = "wearable",
                    S = "embedded",
                    A = "Amazon",
                    R = "Apple",
                    _ = "ASUS",
                    P = "BlackBerry",
                    C = "Browser",
                    E = "Chrome",
                    O = "Firefox",
                    T = "Google",
                    q = "Huawei",
                    N = "Microsoft",
                    U = "Motorola",
                    z = "Opera",
                    I = "Samsung",
                    M = "Sharp",
                    B = "Sony",
                    D = "Xiaomi",
                    L = "Zebra",
                    $ = "Facebook",
                    G = "Chromium OS",
                    H = "Mac OS",
                    W = function (e, t) {
                      var r = {};
                      for (var i in e)
                        t[i] && t[i].length % 2 == 0 ? (r[i] = t[i].concat(e[i])) : (r[i] = e[i]);
                      return r;
                    },
                    J = function (e) {
                      for (var t = {}, r = 0; r < e.length; r++) t[e[r].toUpperCase()] = e[r];
                      return t;
                    },
                    F = function (e, t) {
                      return typeof e === d && -1 !== V(t).indexOf(V(e));
                    },
                    V = function (e) {
                      return e.toLowerCase();
                    },
                    K = function (e, t) {
                      if (typeof e === d)
                        return (
                          (e = e.replace(/^\s\s*/, "")),
                          typeof t === l ? e : e.substring(0, 350)
                        );
                    },
                    Z = function (e, t) {
                      for (var r, i, o, n, s, l, d = 0; d < t.length && !s; ) {
                        var p = t[d],
                          b = t[d + 1];
                        for (r = i = 0; r < p.length && !s && p[r]; )
                          if ((s = p[r++].exec(e)))
                            for (o = 0; o < b.length; o++)
                              ((l = s[++i]),
                                typeof (n = b[o]) === u && n.length > 0
                                  ? 2 === n.length
                                    ? typeof n[1] == c
                                      ? (this[n[0]] = n[1].call(this, l))
                                      : (this[n[0]] = n[1])
                                    : 3 === n.length
                                      ? typeof n[1] !== c || (n[1].exec && n[1].test)
                                        ? (this[n[0]] = l ? l.replace(n[1], n[2]) : void 0)
                                        : (this[n[0]] = l ? n[1].call(this, l, n[2]) : void 0)
                                      : 4 === n.length &&
                                        (this[n[0]] = l
                                          ? n[3].call(this, l.replace(n[1], n[2]))
                                          : void 0)
                                  : (this[n] = l || a));
                        d += 2;
                      }
                    },
                    X = function (e, t) {
                      for (var r in t)
                        if (typeof t[r] === u && t[r].length > 0) {
                          for (var i = 0; i < t[r].length; i++)
                            if (F(t[r][i], e)) return "?" === r ? a : r;
                        } else if (F(t[r], e)) return "?" === r ? a : r;
                      return e;
                    },
                    Y = {
                      ME: "4.90",
                      "NT 3.11": "NT3.51",
                      "NT 4.0": "NT4.0",
                      2e3: "NT 5.0",
                      XP: ["NT 5.1", "NT 5.2"],
                      Vista: "NT 6.0",
                      7: "NT 6.1",
                      8: "NT 6.2",
                      8.1: "NT 6.3",
                      10: ["NT 6.4", "NT 10.0"],
                      RT: "ARM",
                    },
                    Q = {
                      browser: [
                        [/\b(?:crmo|crios)\/([\w\.]+)/i],
                        [w, [h, "Chrome"]],
                        [/edg(?:e|ios|a)?\/([\w\.]+)/i],
                        [w, [h, "Edge"]],
                        [
                          /(opera mini)\/([-\w\.]+)/i,
                          /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
                          /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i,
                        ],
                        [h, w],
                        [/opios[\/ ]+([\w\.]+)/i],
                        [w, [h, z + " Mini"]],
                        [/\bopr\/([\w\.]+)/i],
                        [w, [h, z]],
                        [
                          /(kindle)\/([\w\.]+)/i,
                          /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,
                          /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,
                          /(ba?idubrowser)[\/ ]?([\w\.]+)/i,
                          /(?:ms|\()(ie) ([\w\.]+)/i,
                          /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,
                          /(heytap|ovi)browser\/([\d\.]+)/i,
                          /(weibo)__([\d\.]+)/i,
                        ],
                        [h, w],
                        [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],
                        [w, [h, "UC" + C]],
                        [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i],
                        [w, [h, "WeChat(Win) Desktop"]],
                        [/micromessenger\/([\w\.]+)/i],
                        [w, [h, "WeChat"]],
                        [/konqueror\/([\w\.]+)/i],
                        [w, [h, "Konqueror"]],
                        [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],
                        [w, [h, "IE"]],
                        [/ya(?:search)?browser\/([\w\.]+)/i],
                        [w, [h, "Yandex"]],
                        [/(avast|avg)\/([\w\.]+)/i],
                        [[h, /(.+)/, "$1 Secure " + C], w],
                        [/\bfocus\/([\w\.]+)/i],
                        [w, [h, O + " Focus"]],
                        [/\bopt\/([\w\.]+)/i],
                        [w, [h, z + " Touch"]],
                        [/coc_coc\w+\/([\w\.]+)/i],
                        [w, [h, "Coc Coc"]],
                        [/dolfin\/([\w\.]+)/i],
                        [w, [h, "Dolphin"]],
                        [/coast\/([\w\.]+)/i],
                        [w, [h, z + " Coast"]],
                        [/miuibrowser\/([\w\.]+)/i],
                        [w, [h, "MIUI " + C]],
                        [/fxios\/([-\w\.]+)/i],
                        [w, [h, O]],
                        [/\bqihu|(qi?ho?o?|360)browser/i],
                        [[h, "360 " + C]],
                        [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i],
                        [[h, /(.+)/, "$1 " + C], w],
                        [/(comodo_dragon)\/([\w\.]+)/i],
                        [[h, /_/g, " "], w],
                        [
                          /(electron)\/([\w\.]+) safari/i,
                          /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
                          /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i,
                        ],
                        [h, w],
                        [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i],
                        [h],
                        [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],
                        [[h, $], w],
                        [
                          /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
                          /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
                          /safari (line)\/([\w\.]+)/i,
                          /\b(line)\/([\w\.]+)\/iab/i,
                          /(chromium|instagram)[\/ ]([-\w\.]+)/i,
                        ],
                        [h, w],
                        [/\bgsa\/([\w\.]+) .*safari\//i],
                        [w, [h, "GSA"]],
                        [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],
                        [w, [h, "TikTok"]],
                        [/headlesschrome(?:\/([\w\.]+)| )/i],
                        [w, [h, E + " Headless"]],
                        [/ wv\).+(chrome)\/([\w\.]+)/i],
                        [[h, E + " WebView"], w],
                        [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],
                        [w, [h, "Android " + C]],
                        [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],
                        [h, w],
                        [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i],
                        [w, [h, "Mobile Safari"]],
                        [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i],
                        [w, h],
                        [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],
                        [
                          h,
                          [
                            w,
                            X,
                            {
                              "1.0": "/8",
                              1.2: "/1",
                              1.3: "/3",
                              "2.0": "/412",
                              "2.0.2": "/416",
                              "2.0.3": "/417",
                              "2.0.4": "/419",
                              "?": "/",
                            },
                          ],
                        ],
                        [/(webkit|khtml)\/([\w\.]+)/i],
                        [h, w],
                        [/(navigator|netscape\d?)\/([-\w\.]+)/i],
                        [[h, "Netscape"], w],
                        [/mobile vr; rv:([\w\.]+)\).+firefox/i],
                        [w, [h, O + " Reality"]],
                        [
                          /ekiohf.+(flow)\/([\w\.]+)/i,
                          /(swiftfox)/i,
                          /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
                          /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
                          /(firefox)\/([\w\.]+)/i,
                          /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
                          /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
                          /(links) \(([\w\.]+)/i,
                          /panasonic;(viera)/i,
                        ],
                        [h, w],
                        [/(cobalt)\/([\w\.]+)/i],
                        [h, [w, /master.|lts./, ""]],
                      ],
                      cpu: [
                        [/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i],
                        [[g, "amd64"]],
                        [/(ia32(?=;))/i],
                        [[g, V]],
                        [/((?:i[346]|x)86)[;\)]/i],
                        [[g, "ia32"]],
                        [/\b(aarch64|arm(v?8e?l?|_?64))\b/i],
                        [[g, "arm64"]],
                        [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],
                        [[g, "armhf"]],
                        [/windows (ce|mobile); ppc;/i],
                        [[g, "arm"]],
                        [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],
                        [[g, /ower/, "", V]],
                        [/(sun4\w)[;\)]/i],
                        [[g, "sparc"]],
                        [
                          /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i,
                        ],
                        [[g, V]],
                      ],
                      device: [
                        [
                          /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i,
                        ],
                        [b, [m, I], [f, x]],
                        [
                          /\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
                          /samsung[- ]([-\w]+)/i,
                          /sec-(sgh\w+)/i,
                        ],
                        [b, [m, I], [f, v]],
                        [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],
                        [b, [m, R], [f, v]],
                        [
                          /\((ipad);[-\w\),; ]+apple/i,
                          /applecoremedia\/[\w\.]+ \((ipad)/i,
                          /\b(ipad)\d\d?,\d\d?[;\]].+ios/i,
                        ],
                        [b, [m, R], [f, x]],
                        [/(macintosh);/i],
                        [b, [m, R]],
                        [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],
                        [b, [m, M], [f, v]],
                        [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],
                        [b, [m, q], [f, x]],
                        [
                          /(?:huawei|honor)([-\w ]+)[;\)]/i,
                          /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i,
                        ],
                        [b, [m, q], [f, v]],
                        [
                          /\b(poco[\w ]+)(?: bui|\))/i,
                          /\b; (\w+) build\/hm\1/i,
                          /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
                          /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
                          /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i,
                        ],
                        [
                          [b, /_/g, " "],
                          [m, D],
                          [f, v],
                        ],
                        [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i],
                        [
                          [b, /_/g, " "],
                          [m, D],
                          [f, x],
                        ],
                        [
                          /; (\w+) bui.+ oppo/i,
                          /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i,
                        ],
                        [b, [m, "OPPO"], [f, v]],
                        [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i],
                        [b, [m, "Vivo"], [f, v]],
                        [/\b(rmx[12]\d{3})(?: bui|;|\))/i],
                        [b, [m, "Realme"], [f, v]],
                        [
                          /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
                          /\bmot(?:orola)?[- ](\w*)/i,
                          /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i,
                        ],
                        [b, [m, U], [f, v]],
                        [/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
                        [b, [m, U], [f, x]],
                        [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],
                        [b, [m, "LG"], [f, x]],
                        [
                          /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
                          /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
                          /\blg-?([\d\w]+) bui/i,
                        ],
                        [b, [m, "LG"], [f, v]],
                        [
                          /(ideatab[-\w ]+)/i,
                          /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i,
                        ],
                        [b, [m, "Lenovo"], [f, x]],
                        [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i],
                        [
                          [b, /_/g, " "],
                          [m, "Nokia"],
                          [f, v],
                        ],
                        [/(pixel c)\b/i],
                        [b, [m, T], [f, x]],
                        [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],
                        [b, [m, T], [f, v]],
                        [
                          /droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i,
                        ],
                        [b, [m, B], [f, v]],
                        [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
                        [
                          [b, "Xperia Tablet"],
                          [m, B],
                          [f, x],
                        ],
                        [
                          / (kb2005|in20[12]5|be20[12][59])\b/i,
                          /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i,
                        ],
                        [b, [m, "OnePlus"], [f, v]],
                        [
                          /(alexa)webm/i,
                          /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,
                          /(kf[a-z]+)( bui|\)).+silk\//i,
                        ],
                        [b, [m, A], [f, x]],
                        [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],
                        [
                          [b, /(.+)/g, "Fire Phone $1"],
                          [m, A],
                          [f, v],
                        ],
                        [/(playbook);[-\w\),; ]+(rim)/i],
                        [b, m, [f, x]],
                        [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i],
                        [b, [m, P], [f, v]],
                        [
                          /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i,
                        ],
                        [b, [m, _], [f, x]],
                        [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
                        [b, [m, _], [f, v]],
                        [/(nexus 9)/i],
                        [b, [m, "HTC"], [f, x]],
                        [
                          /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
                          /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
                          /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i,
                        ],
                        [m, [b, /_/g, " "], [f, v]],
                        [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],
                        [b, [m, "Acer"], [f, x]],
                        [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i],
                        [b, [m, "Meizu"], [f, v]],
                        [
                          /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i,
                          /(hp) ([\w ]+\w)/i,
                          /(asus)-?(\w+)/i,
                          /(microsoft); (lumia[\w ]+)/i,
                          /(lenovo)[-_ ]?([-\w]+)/i,
                          /(jolla)/i,
                          /(oppo) ?([\w ]+) bui/i,
                        ],
                        [m, b, [f, v]],
                        [
                          /(kobo)\s(ereader|touch)/i,
                          /(archos) (gamepad2?)/i,
                          /(hp).+(touchpad(?!.+tablet)|tablet)/i,
                          /(kindle)\/([\w\.]+)/i,
                          /(nook)[\w ]+build\/(\w+)/i,
                          /(dell) (strea[kpr\d ]*[\dko])/i,
                          /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
                          /(trinity)[- ]*(t\d{3}) bui/i,
                          /(gigaset)[- ]+(q\w{1,9}) bui/i,
                          /(vodafone) ([\w ]+)(?:\)| bui)/i,
                        ],
                        [m, b, [f, x]],
                        [/(surface duo)/i],
                        [b, [m, N], [f, x]],
                        [/droid [\d\.]+; (fp\du?)(?: b|\))/i],
                        [b, [m, "Fairphone"], [f, v]],
                        [/(u304aa)/i],
                        [b, [m, "AT&T"], [f, v]],
                        [/\bsie-(\w*)/i],
                        [b, [m, "Siemens"], [f, v]],
                        [/\b(rct\w+) b/i],
                        [b, [m, "RCA"], [f, x]],
                        [/\b(venue[\d ]{2,7}) b/i],
                        [b, [m, "Dell"], [f, x]],
                        [/\b(q(?:mv|ta)\w+) b/i],
                        [b, [m, "Verizon"], [f, x]],
                        [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],
                        [b, [m, "Barnes & Noble"], [f, x]],
                        [/\b(tm\d{3}\w+) b/i],
                        [b, [m, "NuVision"], [f, x]],
                        [/\b(k88) b/i],
                        [b, [m, "ZTE"], [f, x]],
                        [/\b(nx\d{3}j) b/i],
                        [b, [m, "ZTE"], [f, v]],
                        [/\b(gen\d{3}) b.+49h/i],
                        [b, [m, "Swiss"], [f, v]],
                        [/\b(zur\d{3}) b/i],
                        [b, [m, "Swiss"], [f, x]],
                        [/\b((zeki)?tb.*\b) b/i],
                        [b, [m, "Zeki"], [f, x]],
                        [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i],
                        [[m, "Dragon Touch"], b, [f, x]],
                        [/\b(ns-?\w{0,9}) b/i],
                        [b, [m, "Insignia"], [f, x]],
                        [/\b((nxa|next)-?\w{0,9}) b/i],
                        [b, [m, "NextBook"], [f, x]],
                        [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],
                        [[m, "Voice"], b, [f, v]],
                        [/\b(lvtel\-)?(v1[12]) b/i],
                        [[m, "LvTel"], b, [f, v]],
                        [/\b(ph-1) /i],
                        [b, [m, "Essential"], [f, v]],
                        [/\b(v(100md|700na|7011|917g).*\b) b/i],
                        [b, [m, "Envizen"], [f, x]],
                        [/\b(trio[-\w\. ]+) b/i],
                        [b, [m, "MachSpeed"], [f, x]],
                        [/\btu_(1491) b/i],
                        [b, [m, "Rotor"], [f, x]],
                        [/(shield[\w ]+) b/i],
                        [b, [m, "Nvidia"], [f, x]],
                        [/(sprint) (\w+)/i],
                        [m, b, [f, v]],
                        [/(kin\.[onetw]{3})/i],
                        [
                          [b, /\./g, " "],
                          [m, N],
                          [f, v],
                        ],
                        [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],
                        [b, [m, L], [f, x]],
                        [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
                        [b, [m, L], [f, v]],
                        [/smart-tv.+(samsung)/i],
                        [m, [f, k]],
                        [/hbbtv.+maple;(\d+)/i],
                        [
                          [b, /^/, "SmartTV"],
                          [m, I],
                          [f, k],
                        ],
                        [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],
                        [
                          [m, "LG"],
                          [f, k],
                        ],
                        [/(apple) ?tv/i],
                        [m, [b, R + " TV"], [f, k]],
                        [/crkey/i],
                        [
                          [b, E + "cast"],
                          [m, T],
                          [f, k],
                        ],
                        [/droid.+aft(\w)( bui|\))/i],
                        [b, [m, A], [f, k]],
                        [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i],
                        [b, [m, M], [f, k]],
                        [/(bravia[\w ]+)( bui|\))/i],
                        [b, [m, B], [f, k]],
                        [/(mitv-\w{5}) bui/i],
                        [b, [m, D], [f, k]],
                        [/Hbbtv.*(technisat) (.*);/i],
                        [m, b, [f, k]],
                        [
                          /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
                          /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i,
                        ],
                        [
                          [m, K],
                          [b, K],
                          [f, k],
                        ],
                        [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],
                        [[f, k]],
                        [/(ouya)/i, /(nintendo) ([wids3utch]+)/i],
                        [m, b, [f, y]],
                        [/droid.+; (shield) bui/i],
                        [b, [m, "Nvidia"], [f, y]],
                        [/(playstation [345portablevi]+)/i],
                        [b, [m, B], [f, y]],
                        [/\b(xbox(?: one)?(?!; xbox))[\); ]/i],
                        [b, [m, N], [f, y]],
                        [/((pebble))app/i],
                        [m, b, [f, j]],
                        [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],
                        [b, [m, R], [f, j]],
                        [/droid.+; (glass) \d/i],
                        [b, [m, T], [f, j]],
                        [/droid.+; (wt63?0{2,3})\)/i],
                        [b, [m, L], [f, j]],
                        [/(quest( 2| pro)?)/i],
                        [b, [m, $], [f, j]],
                        [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],
                        [m, [f, S]],
                        [/(aeobc)\b/i],
                        [b, [m, A], [f, S]],
                        [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i],
                        [b, [f, v]],
                        [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],
                        [b, [f, x]],
                        [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],
                        [[f, x]],
                        [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],
                        [[f, v]],
                        [/(android[-\w\. ]{0,9});.+buil/i],
                        [b, [m, "Generic"]],
                      ],
                      engine: [
                        [/windows.+ edge\/([\w\.]+)/i],
                        [w, [h, "EdgeHTML"]],
                        [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],
                        [w, [h, "Blink"]],
                        [
                          /(presto)\/([\w\.]+)/i,
                          /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,
                          /ekioh(flow)\/([\w\.]+)/i,
                          /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
                          /(icab)[\/ ]([23]\.[\d\.]+)/i,
                          /\b(libweb)/i,
                        ],
                        [h, w],
                        [/rv\:([\w\.]{1,9})\b.+(gecko)/i],
                        [w, h],
                      ],
                      os: [
                        [/microsoft (windows) (vista|xp)/i],
                        [h, w],
                        [
                          /(windows) nt 6\.2; (arm)/i,
                          /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,
                          /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
                        ],
                        [h, [w, X, Y]],
                        [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i],
                        [
                          [h, "Windows"],
                          [w, X, Y],
                        ],
                        [
                          /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
                          /ios;fbsv\/([\d\.]+)/i,
                          /cfnetwork\/.+darwin/i,
                        ],
                        [
                          [w, /_/g, "."],
                          [h, "iOS"],
                        ],
                        [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i],
                        [
                          [h, H],
                          [w, /_/g, "."],
                        ],
                        [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],
                        [w, h],
                        [
                          /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
                          /(blackberry)\w*\/([\w\.]*)/i,
                          /(tizen|kaios)[\/ ]([\w\.]+)/i,
                          /\((series40);/i,
                        ],
                        [h, w],
                        [/\(bb(10);/i],
                        [w, [h, P]],
                        [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i],
                        [w, [h, "Symbian"]],
                        [
                          /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i,
                        ],
                        [w, [h, O + " OS"]],
                        [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],
                        [w, [h, "webOS"]],
                        [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],
                        [w, [h, "watchOS"]],
                        [/crkey\/([\d\.]+)/i],
                        [w, [h, E + "cast"]],
                        [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],
                        [[h, G], w],
                        [
                          /panasonic;(viera)/i,
                          /(netrange)mmh/i,
                          /(nettv)\/(\d+\.[\w\.]+)/i,
                          /(nintendo|playstation) ([wids345portablevuch]+)/i,
                          /(xbox); +xbox ([^\);]+)/i,
                          /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
                          /(mint)[\/\(\) ]?(\w*)/i,
                          /(mageia|vectorlinux)[; ]/i,
                          /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
                          /(hurd|linux) ?([\w\.]*)/i,
                          /(gnu) ?([\w\.]*)/i,
                          /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
                          /(haiku) (\w+)/i,
                        ],
                        [h, w],
                        [/(sunos) ?([\w\.\d]*)/i],
                        [[h, "Solaris"], w],
                        [
                          /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
                          /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
                          /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
                          /(unix) ?([\w\.]*)/i,
                        ],
                        [h, w],
                      ],
                    },
                    ee = function (e, t) {
                      if ((typeof e === u && ((t = e), (e = a)), !(this instanceof ee)))
                        return new ee(e, t).getResult();
                      var r = typeof s !== l && s.navigator ? s.navigator : a,
                        i = e || (r && r.userAgent ? r.userAgent : ""),
                        o = r && r.userAgentData ? r.userAgentData : a,
                        n = t ? W(Q, t) : Q,
                        y = r && r.userAgent == i;
                      return (
                        (this.getBrowser = function () {
                          var e,
                            t = {};
                          return (
                            (t[h] = a),
                            (t[w] = a),
                            Z.call(t, i, n.browser),
                            (t[p] =
                              typeof (e = t[w]) === d
                                ? e.replace(/[^\d\.]/g, "").split(".")[0]
                                : a),
                            y && r && r.brave && typeof r.brave.isBrave == c && (t[h] = "Brave"),
                            t
                          );
                        }),
                        (this.getCPU = function () {
                          var e = {};
                          return ((e[g] = a), Z.call(e, i, n.cpu), e);
                        }),
                        (this.getDevice = function () {
                          var e = {};
                          return (
                            (e[m] = a),
                            (e[b] = a),
                            (e[f] = a),
                            Z.call(e, i, n.device),
                            y && !e[f] && o && o.mobile && (e[f] = v),
                            y &&
                              "Macintosh" == e[b] &&
                              r &&
                              typeof r.standalone !== l &&
                              r.maxTouchPoints &&
                              r.maxTouchPoints > 2 &&
                              ((e[b] = "iPad"), (e[f] = x)),
                            e
                          );
                        }),
                        (this.getEngine = function () {
                          var e = {};
                          return ((e[h] = a), (e[w] = a), Z.call(e, i, n.engine), e);
                        }),
                        (this.getOS = function () {
                          var e = {};
                          return (
                            (e[h] = a),
                            (e[w] = a),
                            Z.call(e, i, n.os),
                            y &&
                              !e[h] &&
                              o &&
                              "Unknown" != o.platform &&
                              (e[h] = o.platform.replace(/chrome os/i, G).replace(/macos/i, H)),
                            e
                          );
                        }),
                        (this.getResult = function () {
                          return {
                            ua: this.getUA(),
                            browser: this.getBrowser(),
                            engine: this.getEngine(),
                            os: this.getOS(),
                            device: this.getDevice(),
                            cpu: this.getCPU(),
                          };
                        }),
                        (this.getUA = function () {
                          return i;
                        }),
                        (this.setUA = function (e) {
                          return ((i = typeof e === d && e.length > 350 ? K(e, 350) : e), this);
                        }),
                        this.setUA(i),
                        this
                      );
                    };
                  ((ee.VERSION = "1.0.35"),
                    (ee.BROWSER = J([h, w, p])),
                    (ee.CPU = J([g])),
                    (ee.DEVICE = J([b, m, f, y, v, k, x, j, S])),
                    (ee.ENGINE = ee.OS = J([h, w])),
                    typeof n !== l
                      ? (o.exports && (n = o.exports = ee), (n.UAParser = ee))
                      : r.amdO
                        ? void 0 !==
                            (i = function () {
                              return ee;
                            }.call(t, r, t, e)) && (e.exports = i)
                        : typeof s !== l && (s.UAParser = ee));
                  var et = typeof s !== l && (s.jQuery || s.Zepto);
                  if (et && !et.ua) {
                    var er = new ee();
                    ((et.ua = er.getResult()),
                      (et.ua.get = function () {
                        return er.getUA();
                      }),
                      (et.ua.set = function (e) {
                        er.setUA(e);
                        var t = er.getResult();
                        for (var r in t) et.ua[r] = t[r];
                      }));
                  }
                })("object" == typeof window ? window : this);
              },
            },
            n = {};
          function s(e) {
            var t = n[e];
            if (void 0 !== t) return t.exports;
            var r = (n[e] = { exports: {} }),
              i = !0;
            try {
              (o[e].call(r.exports, r, r.exports, s), (i = !1));
            } finally {
              i && delete n[e];
            }
            return r.exports;
          }
          s.ab = __dirname + "/";
          var a = s(226);
          e.exports = a;
        })();
      },
      6050: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "unstable_after", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let i = r(9294);
        function o(e) {
          let t = i.workAsyncStorage.getStore();
          if (!t)
            throw Error(
              "`unstable_after` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context",
            );
          let { afterContext: r } = t;
          if (!r)
            throw Error(
              "`unstable_after` must be explicitly enabled by setting `experimental.after: true` in your next.config.js.",
            );
          return r.after(e);
        }
      },
      5036: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            Object.keys(e).forEach(function (r) {
              "default" === r ||
                Object.prototype.hasOwnProperty.call(t, r) ||
                Object.defineProperty(t, r, {
                  enumerable: !0,
                  get: function () {
                    return e[r];
                  },
                });
            });
          })(r(6050), t));
      },
      6807: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "connection", {
            enumerable: !0,
            get: function () {
              return c;
            },
          }));
        let i = r(9294),
          o = r(3033),
          n = r(436),
          s = r(2312),
          a = r(457);
        function c() {
          let e = i.workAsyncStorage.getStore(),
            t = o.workUnitAsyncStorage.getStore();
          if (e) {
            if (e.forceStatic) return Promise.resolve(void 0);
            if (t) {
              if ("cache" === t.type)
                throw Error(
                  `Route ${e.route} used "connection" inside "use cache". The \`connection()\` function is used to indicate the subsequent code must only run when there is an actual Request, but caches must be able to be produced before a Request so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`,
                );
              if ("unstable-cache" === t.type)
                throw Error(
                  `Route ${e.route} used "connection" inside a function cached with "unstable_cache(...)". The \`connection()\` function is used to indicate the subsequent code must only run when there is an actual Request, but caches must be able to be produced before a Request so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`,
                );
              if ("after" === t.phase)
                throw Error(
                  `Route ${e.route} used "connection" inside "unstable_after(...)". The \`connection()\` function is used to indicate the subsequent code must only run when there is an actual Request, but "unstable_after(...)" executes after the request, so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/unstable_after`,
                );
            }
            if (e.dynamicShouldError)
              throw new s.StaticGenBailoutError(
                `Route ${e.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`connection\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`,
              );
            if (t) {
              if ("prerender" === t.type)
                return (0, a.makeHangingPromise)(t.renderSignal, "`connection()`");
              "prerender-ppr" === t.type
                ? (0, n.postponeWithTracking)(e.route, "connection", t.dynamicTracking)
                : "prerender-legacy" === t.type &&
                  (0, n.throwToInterruptStaticGeneration)("connection", e, t);
            }
            (0, n.trackDynamicDataInDynamicRender)(e, t);
          }
          return Promise.resolve(void 0);
        }
      },
      7200: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, "U", {
          enumerable: !0,
          get: function () {
            return d;
          },
        });
        let i = r(6620),
          o = r(9181),
          n = r(9294),
          s = r(3033),
          a = r(436),
          c = r(2312),
          l = r(457),
          u = r(7301);
        function d() {
          let e = "cookies",
            t = n.workAsyncStorage.getStore(),
            r = s.workUnitAsyncStorage.getStore();
          if (t) {
            if (t.forceStatic)
              return b(i.RequestCookiesAdapter.seal(new o.RequestCookies(new Headers({}))));
            if (r) {
              if ("cache" === r.type)
                throw Error(
                  `Route ${t.route} used "cookies" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "cookies" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`,
                );
              if ("unstable-cache" === r.type)
                throw Error(
                  `Route ${t.route} used "cookies" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "cookies" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`,
                );
              if ("after" === r.phase)
                throw Error(
                  `Route ${t.route} used "cookies" inside "unstable_after(...)". This is not supported. If you need this data inside an "unstable_after" callback, use "cookies" outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/unstable_after`,
                );
            }
            if (t.dynamicShouldError)
              throw new c.StaticGenBailoutError(
                `Route ${t.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`cookies\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`,
              );
            if (r) {
              if ("prerender" === r.type)
                return (function (e, t) {
                  let r = p.get(t);
                  if (r) return r;
                  let i = (0, l.makeHangingPromise)(t.renderSignal, "`cookies()`");
                  return (
                    p.set(t, i),
                    Object.defineProperties(i, {
                      [Symbol.iterator]: {
                        value: function () {
                          let r = "`cookies()[Symbol.iterator]()`",
                            i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                      size: {
                        get() {
                          let r = "`cookies().size`",
                            i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                      get: {
                        value: function () {
                          let r;
                          r =
                            0 == arguments.length
                              ? "`cookies().get()`"
                              : `\`cookies().get(${h(arguments[0])})\``;
                          let i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                      getAll: {
                        value: function () {
                          let r;
                          r =
                            0 == arguments.length
                              ? "`cookies().getAll()`"
                              : `\`cookies().getAll(${h(arguments[0])})\``;
                          let i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                      has: {
                        value: function () {
                          let r;
                          r =
                            0 == arguments.length
                              ? "`cookies().has()`"
                              : `\`cookies().has(${h(arguments[0])})\``;
                          let i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                      set: {
                        value: function () {
                          let r;
                          if (0 == arguments.length) r = "`cookies().set()`";
                          else {
                            let e = arguments[0];
                            r = e ? `\`cookies().set(${h(e)}, ...)\`` : "`cookies().set(...)`";
                          }
                          let i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                      delete: {
                        value: function () {
                          let r;
                          r =
                            0 == arguments.length
                              ? "`cookies().delete()`"
                              : 1 == arguments.length
                                ? `\`cookies().delete(${h(arguments[0])})\``
                                : `\`cookies().delete(${h(arguments[0])}, ...)\``;
                          let i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                      clear: {
                        value: function () {
                          let r = "`cookies().clear()`",
                            i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                      toString: {
                        value: function () {
                          let r = "`cookies().toString()`",
                            i = f(e, r);
                          (0, a.abortAndThrowOnSynchronousRequestDataAccess)(e, r, i, t);
                        },
                      },
                    }),
                    i
                  );
                })(t.route, r);
              "prerender-ppr" === r.type
                ? (0, a.postponeWithTracking)(t.route, e, r.dynamicTracking)
                : "prerender-legacy" === r.type && (0, a.throwToInterruptStaticGeneration)(e, t, r);
            }
            (0, a.trackDynamicDataInDynamicRender)(t, r);
          }
          let u = (0, s.getExpectedRequestStore)(e);
          return b(
            (0, i.areCookiesMutableInCurrentPhase)(u) ? u.userspaceMutableCookies : u.cookies,
          );
        }
        r(676);
        let p = new WeakMap();
        function b(e) {
          let t = p.get(e);
          if (t) return t;
          let r = Promise.resolve(e);
          return (
            p.set(e, r),
            Object.defineProperties(r, {
              [Symbol.iterator]: {
                value: e[Symbol.iterator] ? e[Symbol.iterator].bind(e) : m.bind(e),
              },
              size: { get: () => e.size },
              get: { value: e.get.bind(e) },
              getAll: { value: e.getAll.bind(e) },
              has: { value: e.has.bind(e) },
              set: { value: e.set.bind(e) },
              delete: { value: e.delete.bind(e) },
              clear: { value: "function" == typeof e.clear ? e.clear.bind(e) : w.bind(e, r) },
              toString: { value: e.toString.bind(e) },
            }),
            r
          );
        }
        function h(e) {
          return "object" == typeof e && null !== e && "string" == typeof e.name
            ? `'${e.name}'`
            : "string" == typeof e
              ? `'${e}'`
              : "...";
        }
        function f(e, t) {
          let r = e ? `Route "${e}" ` : "This route ";
          return Error(
            `${r}used ${t}. \`cookies()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`,
          );
        }
        function m() {
          return this.getAll()
            .map((e) => [e.name, e])
            .values();
        }
        function w(e) {
          for (let e of this.getAll()) this.delete(e.name);
          return e;
        }
        (0, u.createDedupedByCallsiteServerErrorLoggerDev)(f);
      },
      6250: (e, t, r) => {
        "use strict";
        let i = r(3033),
          o = r(9294),
          n = r(436),
          s = r(7301),
          a = r(2312),
          c = r(2490);
        new WeakMap();
        class l {
          constructor(e) {
            this._provider = e;
          }
          get isEnabled() {
            return null !== this._provider && this._provider.isEnabled;
          }
          enable() {
            (u("draftMode().enable()"), null !== this._provider && this._provider.enable());
          }
          disable() {
            (u("draftMode().disable()"), null !== this._provider && this._provider.disable());
          }
        }
        function u(e) {
          let t = o.workAsyncStorage.getStore(),
            r = i.workUnitAsyncStorage.getStore();
          if (t) {
            if (r) {
              if ("cache" === r.type)
                throw Error(
                  `Route ${t.route} used "${e}" inside "use cache". The enabled status of draftMode can be read in caches but you must not enable or disable draftMode inside a cache. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`,
                );
              if ("unstable-cache" === r.type)
                throw Error(
                  `Route ${t.route} used "${e}" inside a function cached with "unstable_cache(...)". The enabled status of draftMode can be read in caches but you must not enable or disable draftMode inside a cache. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`,
                );
            }
            if (t.dynamicShouldError)
              throw new a.StaticGenBailoutError(
                `Route ${t.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${e}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`,
              );
            if (r) {
              if ("prerender" === r.type) {
                let i = Error(
                  `Route ${t.route} used ${e} without first calling \`await connection()\`. See more info here: https://nextjs.org/docs/messages/next-prerender-sync-headers`,
                );
                (0, n.abortAndThrowOnSynchronousRequestDataAccess)(t.route, e, i, r);
              } else if ("prerender-ppr" === r.type)
                (0, n.postponeWithTracking)(t.route, e, r.dynamicTracking);
              else if ("prerender-legacy" === r.type) {
                r.revalidate = 0;
                let i = new c.DynamicServerError(
                  `Route ${t.route} couldn't be rendered statically because it used \`${e}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`,
                );
                throw ((t.dynamicUsageDescription = e), (t.dynamicUsageStack = i.stack), i);
              }
            }
          }
        }
        (0, s.createDedupedByCallsiteServerErrorLoggerDev)(function (e, t) {
          let r = e ? `Route "${e}" ` : "This route ";
          return Error(
            `${r}used ${t}. \`draftMode()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`,
          );
        });
      },
      3009: (e, t, r) => {
        "use strict";
        (r(9785), r(9294), r(3033), r(436), r(2312), r(457));
        let i = r(7301);
        r(676);
        let o = new WeakMap();
        (0, i.createDedupedByCallsiteServerErrorLoggerDev)(function (e, t) {
          let r = e ? `Route "${e}" ` : "This route ";
          return Error(
            `${r}used ${t}. \`headers()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`,
          );
        });
      },
      1520: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            ImageResponse: function () {
              return i.ImageResponse;
            },
            NextRequest: function () {
              return o.NextRequest;
            },
            NextResponse: function () {
              return n.NextResponse;
            },
            URLPattern: function () {
              return a.URLPattern;
            },
            connection: function () {
              return l.connection;
            },
            unstable_after: function () {
              return c.unstable_after;
            },
            userAgent: function () {
              return s.userAgent;
            },
            userAgentFromString: function () {
              return s.userAgentFromString;
            },
          }));
        let i = r(4159),
          o = r(1639),
          n = r(4899),
          s = r(2215),
          a = r(1512),
          c = r(5036),
          l = r(6807);
      },
      9785: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            HeadersAdapter: function () {
              return n;
            },
            ReadonlyHeadersError: function () {
              return o;
            },
          }));
        let i = r(614);
        class o extends Error {
          constructor() {
            super(
              "Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers",
            );
          }
          static callable() {
            throw new o();
          }
        }
        class n extends Headers {
          constructor(e) {
            (super(),
              (this.headers = new Proxy(e, {
                get(t, r, o) {
                  if ("symbol" == typeof r) return i.ReflectAdapter.get(t, r, o);
                  let n = r.toLowerCase(),
                    s = Object.keys(e).find((e) => e.toLowerCase() === n);
                  if (void 0 !== s) return i.ReflectAdapter.get(t, s, o);
                },
                set(t, r, o, n) {
                  if ("symbol" == typeof r) return i.ReflectAdapter.set(t, r, o, n);
                  let s = r.toLowerCase(),
                    a = Object.keys(e).find((e) => e.toLowerCase() === s);
                  return i.ReflectAdapter.set(t, a ?? r, o, n);
                },
                has(t, r) {
                  if ("symbol" == typeof r) return i.ReflectAdapter.has(t, r);
                  let o = r.toLowerCase(),
                    n = Object.keys(e).find((e) => e.toLowerCase() === o);
                  return void 0 !== n && i.ReflectAdapter.has(t, n);
                },
                deleteProperty(t, r) {
                  if ("symbol" == typeof r) return i.ReflectAdapter.deleteProperty(t, r);
                  let o = r.toLowerCase(),
                    n = Object.keys(e).find((e) => e.toLowerCase() === o);
                  return void 0 === n || i.ReflectAdapter.deleteProperty(t, n);
                },
              })));
          }
          static seal(e) {
            return new Proxy(e, {
              get(e, t, r) {
                switch (t) {
                  case "append":
                  case "delete":
                  case "set":
                    return o.callable;
                  default:
                    return i.ReflectAdapter.get(e, t, r);
                }
              },
            });
          }
          merge(e) {
            return Array.isArray(e) ? e.join(", ") : e;
          }
          static from(e) {
            return e instanceof Headers ? e : new n(e);
          }
          append(e, t) {
            let r = this.headers[e];
            "string" == typeof r
              ? (this.headers[e] = [r, t])
              : Array.isArray(r)
                ? r.push(t)
                : (this.headers[e] = t);
          }
          delete(e) {
            delete this.headers[e];
          }
          get(e) {
            let t = this.headers[e];
            return void 0 !== t ? this.merge(t) : null;
          }
          has(e) {
            return void 0 !== this.headers[e];
          }
          set(e, t) {
            this.headers[e] = t;
          }
          forEach(e, t) {
            for (let [r, i] of this.entries()) e.call(t, i, r, this);
          }
          *entries() {
            for (let e of Object.keys(this.headers)) {
              let t = e.toLowerCase(),
                r = this.get(t);
              yield [t, r];
            }
          }
          *keys() {
            for (let e of Object.keys(this.headers)) {
              let t = e.toLowerCase();
              yield t;
            }
          }
          *values() {
            for (let e of Object.keys(this.headers)) {
              let t = this.get(e);
              yield t;
            }
          }
          [Symbol.iterator]() {
            return this.entries();
          }
        }
      },
      6620: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            MutableRequestCookiesAdapter: function () {
              return p;
            },
            ReadonlyRequestCookiesError: function () {
              return a;
            },
            RequestCookiesAdapter: function () {
              return c;
            },
            appendMutableCookies: function () {
              return d;
            },
            areCookiesMutableInCurrentPhase: function () {
              return h;
            },
            getModifiedCookieValues: function () {
              return u;
            },
            responseCookiesToRequestCookies: function () {
              return m;
            },
            wrapWithMutableAccessCheck: function () {
              return b;
            },
          }));
        let i = r(9181),
          o = r(614),
          n = r(9294),
          s = r(3033);
        class a extends Error {
          constructor() {
            super(
              "Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options",
            );
          }
          static callable() {
            throw new a();
          }
        }
        class c {
          static seal(e) {
            return new Proxy(e, {
              get(e, t, r) {
                switch (t) {
                  case "clear":
                  case "delete":
                  case "set":
                    return a.callable;
                  default:
                    return o.ReflectAdapter.get(e, t, r);
                }
              },
            });
          }
        }
        let l = Symbol.for("next.mutated.cookies");
        function u(e) {
          let t = e[l];
          return t && Array.isArray(t) && 0 !== t.length ? t : [];
        }
        function d(e, t) {
          let r = u(t);
          if (0 === r.length) return !1;
          let o = new i.ResponseCookies(e),
            n = o.getAll();
          for (let e of r) o.set(e);
          for (let e of n) o.set(e);
          return !0;
        }
        class p {
          static wrap(e, t) {
            let r = new i.ResponseCookies(new Headers());
            for (let t of e.getAll()) r.set(t);
            let s = [],
              a = new Set(),
              c = () => {
                let e = n.workAsyncStorage.getStore();
                if (
                  (e && (e.pathWasRevalidated = !0),
                  (s = r.getAll().filter((e) => a.has(e.name))),
                  t)
                ) {
                  let e = [];
                  for (let t of s) {
                    let r = new i.ResponseCookies(new Headers());
                    (r.set(t), e.push(r.toString()));
                  }
                  t(e);
                }
              },
              u = new Proxy(r, {
                get(e, t, r) {
                  switch (t) {
                    case l:
                      return s;
                    case "delete":
                      return function (...t) {
                        a.add("string" == typeof t[0] ? t[0] : t[0].name);
                        try {
                          return (e.delete(...t), u);
                        } finally {
                          c();
                        }
                      };
                    case "set":
                      return function (...t) {
                        a.add("string" == typeof t[0] ? t[0] : t[0].name);
                        try {
                          return (e.set(...t), u);
                        } finally {
                          c();
                        }
                      };
                    default:
                      return o.ReflectAdapter.get(e, t, r);
                  }
                },
              });
            return u;
          }
        }
        function b(e) {
          let t = new Proxy(e, {
            get(e, r, i) {
              switch (r) {
                case "delete":
                  return function (...r) {
                    return (f("cookies().delete"), e.delete(...r), t);
                  };
                case "set":
                  return function (...r) {
                    return (f("cookies().set"), e.set(...r), t);
                  };
                default:
                  return o.ReflectAdapter.get(e, r, i);
              }
            },
          });
          return t;
        }
        function h(e) {
          return "action" === e.phase;
        }
        function f(e) {
          if (!h((0, s.getExpectedRequestStore)(e))) throw new a();
        }
        function m(e) {
          let t = new i.RequestCookies(new Headers());
          for (let r of e.getAll()) t.set(r);
          return t;
        }
      },
      4159: (e, t) => {
        "use strict";
        function r() {
          throw Error(
            'ImageResponse moved from "next/server" to "next/og" since Next.js 14, please import from "next/og" instead',
          );
        }
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "ImageResponse", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
      },
      4899: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "NextResponse", {
            enumerable: !0,
            get: function () {
              return d;
            },
          }));
        let i = r(9181),
          o = r(9619),
          n = r(5225),
          s = r(614),
          a = r(9181),
          c = Symbol("internal response"),
          l = new Set([301, 302, 303, 307, 308]);
        function u(e, t) {
          var r;
          if (null == e ? void 0 : null == (r = e.request) ? void 0 : r.headers) {
            if (!(e.request.headers instanceof Headers))
              throw Error("request.headers must be an instance of Headers");
            let r = [];
            for (let [i, o] of e.request.headers)
              (t.set("x-middleware-request-" + i, o), r.push(i));
            t.set("x-middleware-override-headers", r.join(","));
          }
        }
        class d extends Response {
          constructor(e, t = {}) {
            super(e, t);
            let r = this.headers,
              l = new Proxy(new a.ResponseCookies(r), {
                get(e, o, n) {
                  switch (o) {
                    case "delete":
                    case "set":
                      return (...n) => {
                        let s = Reflect.apply(e[o], e, n),
                          c = new Headers(r);
                        return (
                          s instanceof a.ResponseCookies &&
                            r.set(
                              "x-middleware-set-cookie",
                              s
                                .getAll()
                                .map((e) => (0, i.stringifyCookie)(e))
                                .join(","),
                            ),
                          u(t, c),
                          s
                        );
                      };
                    default:
                      return s.ReflectAdapter.get(e, o, n);
                  }
                },
              });
            this[c] = {
              cookies: l,
              url: t.url
                ? new o.NextURL(t.url, {
                    headers: (0, n.toNodeOutgoingHttpHeaders)(r),
                    nextConfig: t.nextConfig,
                  })
                : void 0,
            };
          }
          [Symbol.for("edge-runtime.inspect.custom")]() {
            return {
              cookies: this.cookies,
              url: this.url,
              body: this.body,
              bodyUsed: this.bodyUsed,
              headers: Object.fromEntries(this.headers),
              ok: this.ok,
              redirected: this.redirected,
              status: this.status,
              statusText: this.statusText,
              type: this.type,
            };
          }
          get cookies() {
            return this[c].cookies;
          }
          static json(e, t) {
            let r = Response.json(e, t);
            return new d(r.body, r);
          }
          static redirect(e, t) {
            let r = "number" == typeof t ? t : ((null == t ? void 0 : t.status) ?? 307);
            if (!l.has(r))
              throw RangeError('Failed to execute "redirect" on "response": Invalid status code');
            let i = "object" == typeof t ? t : {},
              o = new Headers(null == i ? void 0 : i.headers);
            return (
              o.set("Location", (0, n.validateURL)(e)),
              new d(null, { ...i, headers: o, status: r })
            );
          }
          static rewrite(e, t) {
            let r = new Headers(null == t ? void 0 : t.headers);
            return (
              r.set("x-middleware-rewrite", (0, n.validateURL)(e)),
              u(t, r),
              new d(null, { ...t, headers: r })
            );
          }
          static next(e) {
            let t = new Headers(null == e ? void 0 : e.headers);
            return (t.set("x-middleware-next", "1"), u(e, t), new d(null, { ...e, headers: t }));
          }
        }
      },
      1512: (e, t) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "URLPattern", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let r = "undefined" == typeof URLPattern ? void 0 : URLPattern;
      },
      2215: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            isBot: function () {
              return o;
            },
            userAgent: function () {
              return s;
            },
            userAgentFromString: function () {
              return n;
            },
          }));
        let i = (function (e) {
          return e && e.__esModule ? e : { default: e };
        })(r(4446));
        function o(e) {
          return /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Google-InspectionTool|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver/i.test(
            e,
          );
        }
        function n(e) {
          return { ...(0, i.default)(e), isBot: void 0 !== e && o(e) };
        }
        function s({ headers: e }) {
          return n(e.get("user-agent") || void 0);
        }
      },
      2176: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => p }));
        var i = r(2740),
          o = r(7200);
        (r(3009), r(6250), new TextEncoder());
        let n = new TextDecoder(),
          s = (e) => "object" == typeof e && null !== e;
        class a extends Error {
          static code = "ERR_JOSE_GENERIC";
          code = "ERR_JOSE_GENERIC";
          constructor(e, t) {
            (super(e, t),
              (this.name = this.constructor.name),
              Error.captureStackTrace?.(this, this.constructor));
          }
        }
        class c extends a {
          static code = "ERR_JWT_INVALID";
          code = "ERR_JWT_INVALID";
        }
        class l extends a {
          [Symbol.asyncIterator];
          static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
          code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
          constructor(e = "multiple matching keys found in the JSON Web Key Set", t) {
            super(e, t);
          }
        }
        async function u() {
          let e = await (0, o.U)(),
            t = e.get("__blerp_session")?.value;
          if (!t) return { userId: null };
          try {
            return {
              userId:
                (function (e) {
                  let t, r;
                  if ("string" != typeof e)
                    throw new c("JWTs must use Compact JWS serialization, JWT must be a string");
                  let { 1: i, length: o } = e.split(".");
                  if (5 === o)
                    throw new c("Only JWTs using Compact JWS serialization can be decoded");
                  if (3 !== o) throw new c("Invalid JWT");
                  if (!i) throw new c("JWTs must contain a payload");
                  try {
                    t = (function (e) {
                      if (Uint8Array.fromBase64)
                        return Uint8Array.fromBase64("string" == typeof e ? e : n.decode(e), {
                          alphabet: "base64url",
                        });
                      let t = e;
                      (t instanceof Uint8Array && (t = n.decode(t)),
                        (t = t.replace(/-/g, "+").replace(/_/g, "/")));
                      try {
                        return (function (e) {
                          if (Uint8Array.fromBase64) return Uint8Array.fromBase64(e);
                          let t = atob(e),
                            r = new Uint8Array(t.length);
                          for (let e = 0; e < t.length; e++) r[e] = t.charCodeAt(e);
                          return r;
                        })(t);
                      } catch {
                        throw TypeError("The input to be decoded is not correctly encoded.");
                      }
                    })(i);
                  } catch {
                    throw new c("Failed to base64url decode the payload");
                  }
                  try {
                    r = JSON.parse(n.decode(t));
                  } catch {
                    throw new c("Failed to parse the decoded payload as JSON");
                  }
                  if (
                    !(function (e) {
                      if (!s(e) || "[object Object]" !== Object.prototype.toString.call(e))
                        return !1;
                      if (null === Object.getPrototypeOf(e)) return !0;
                      let t = e;
                      for (; null !== Object.getPrototypeOf(t); ) t = Object.getPrototypeOf(t);
                      return Object.getPrototypeOf(e) === t;
                    })(r)
                  )
                    throw new c("Invalid JWT Claims Set");
                  return r;
                })(t).sub || null,
            };
          } catch {
            return { userId: null };
          }
        }
        async function d() {
          let { userId: e } = await u();
          return e
            ? {
                id: e,
                firstName: "Mock",
                lastName: "User",
                emailAddresses: [{ emailAddress: "mock@example.com" }],
              }
            : null;
        }
        async function p() {
          let { userId: e } = await u(),
            t = await d();
          return (0, i.jsxs)("div", {
            className: "p-8",
            children: [
              (0, i.jsx)("h1", { children: "Dashboard" }),
              (0, i.jsxs)("p", { children: ["User ID: ", e] }),
              t && (0, i.jsx)("pre", { children: JSON.stringify(t, null, 2) }),
            ],
          });
        }
        r(1520);
      },
      1354: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => n }));
        var i = r(2740),
          o = r(8184);
        function n({ children: e }) {
          return (0, i.jsx)(o.F4, {
            publishableKey: "pk_test_123",
            children: (0, i.jsx)("html", {
              lang: "en",
              children: (0, i.jsx)("body", { children: e }),
            }),
          });
        }
        r(6301);
      },
      1980: (e, t, r) => {
        "use strict";
        r.d(t, { BlerpProvider: () => u, o: () => p, useAuth: () => d });
        var i = r(5512),
          o = r(8009),
          n = r(9221),
          s = r(6129),
          a = r(1381);
        let c = new s.E(),
          l = (0, o.createContext)(void 0);
        function u({ children: e, publishableKey: t }) {
          let r = (0, o.useMemo)(
              () => (0, n.Ay)({ baseUrl: "/", headers: { Authorization: `Bearer ${t}` } }),
              [t],
            ),
            s = (0, o.useMemo)(
              () => ({ userId: null, isLoaded: !0, isSignedIn: !1, client: r }),
              [r],
            );
          return (0, i.jsx)(a.Ht, {
            client: c,
            children: (0, i.jsx)(l.Provider, { value: s, children: e }),
          });
        }
        function d() {
          let e = (0, o.useContext)(l);
          if (void 0 === e) throw Error("useAuth must be used within a BlerpProvider");
          let { userId: t, isLoaded: r, isSignedIn: i } = e;
          return { userId: t, isLoaded: r, isSignedIn: i };
        }
        function p() {
          let e = (0, o.useContext)(l);
          if (void 0 === e) throw Error("useBlerpClient must be used within a BlerpProvider");
          return e.client;
        }
      },
      2697: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { SignIn: () => o, UserButton: () => n }));
        var i = r(5512);
        function o() {
          return (0, i.jsxs)("div", {
            className: "mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm",
            children: [
              (0, i.jsx)("h2", {
                className: "mb-6 text-2xl font-bold text-gray-900",
                children: "Sign in to Blerp",
              }),
              (0, i.jsx)("p", {
                className: "text-sm text-gray-500",
                children: "SignIn component placeholder.",
              }),
            ],
          });
        }
        function n() {
          return (0, i.jsx)("div", {
            className:
              "h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold",
            children: "U",
          });
        }
      },
      2200: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { OrganizationSwitcher: () => u }));
        var i = r(5512),
          o = r(8009),
          n = r(9743),
          s = r(1980),
          a = r(1128),
          c = r(3604),
          l = r(7922);
        function u() {
          let { data: e, isLoading: t } = (function () {
              let e = (0, s.o)();
              return (0, n.I)({
                queryKey: ["organizations"],
                queryFn: async () => {
                  let { data: t, error: r } = await e.GET("/v1/organizations", {});
                  if (r) throw r;
                  return t.data || [];
                },
              });
            })(),
            [r, u] = (0, o.useState)(null),
            [d, p] = (0, o.useState)(!1),
            b = e?.find((e) => e.id === r);
          return t
            ? (0, i.jsx)("div", { className: "h-10 w-full animate-pulse rounded bg-gray-100" })
            : (0, i.jsxs)("div", {
                className: "relative",
                children: [
                  (0, i.jsxs)("button", {
                    onClick: () => p(!d),
                    className:
                      "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    children: [
                      (0, i.jsx)("span", {
                        className: "truncate",
                        children: b ? b.name : "Select Organization",
                      }),
                      (0, i.jsx)(a.A, { className: "ml-2 h-4 w-4 text-gray-400" }),
                    ],
                  }),
                  d &&
                    (0, i.jsx)("div", {
                      className:
                        "absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-white shadow-lg",
                      children: (0, i.jsxs)("div", {
                        className: "py-1",
                        children: [
                          e?.map((e) =>
                            i.jsxs(
                              "button",
                              {
                                onClick: () => {
                                  (u(e.id), p(!1));
                                },
                                className:
                                  "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                                children: [
                                  i.jsx("span", { className: "flex-1 truncate", children: e.name }),
                                  e.id === r && i.jsx(c.A, { className: "h-4 w-4 text-blue-600" }),
                                ],
                              },
                              e.id,
                            ),
                          ),
                          (0, i.jsxs)("button", {
                            className:
                              "flex w-full items-center border-t px-4 py-2 text-sm text-blue-600 hover:bg-blue-50",
                            children: [
                              (0, i.jsx)(l.A, { className: "mr-2 h-4 w-4" }),
                              "Create Organization",
                            ],
                          }),
                        ],
                      }),
                    }),
                ],
              });
        }
      },
      1007: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { SignUp: () => c }));
        var i = r(5512),
          o = r(8009),
          n = r(6277),
          s = r(3929),
          a = r(1980);
        function c() {
          let e = (0, a.o)(),
            [t, r] = (0, o.useState)(""),
            [c, l] = (0, o.useState)(null),
            u = async (r) => {
              r.preventDefault();
              let { data: i, error: o } = await e.POST("/v1/auth/signups", {
                body: { email: t, strategy: "password" },
              });
              o
                ? alert(o.error.message)
                : i && l(`Signup initiated: ${i.id}. Please check your email.`);
            },
            d = async (t) => {
              let { data: r, error: i } = await e.GET("/v1/auth/oauth/{provider}", {
                params: {
                  path: { provider: t },
                  query: { redirect_uri: window.location.origin + "/callback" },
                },
              });
              i ? alert("Failed to initiate OAuth") : r && r.url && (window.location.href = r.url);
            };
          return (0, i.jsxs)("div", {
            className: "mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm",
            children: [
              (0, i.jsx)("h2", {
                className: "mb-6 text-2xl font-bold text-gray-900",
                children: "Create your account",
              }),
              (0, i.jsxs)("div", {
                className: "grid grid-cols-2 gap-4 mb-6",
                children: [
                  (0, i.jsxs)("button", {
                    onClick: () => d("github"),
                    className:
                      "flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50",
                    children: [(0, i.jsx)(n.A, { className: "mr-2 h-4 w-4" }), "GitHub"],
                  }),
                  (0, i.jsxs)("button", {
                    onClick: () => d("google"),
                    className:
                      "flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50",
                    children: [(0, i.jsx)(s.A, { className: "mr-2 h-4 w-4" }), "Google"],
                  }),
                ],
              }),
              (0, i.jsxs)("div", {
                className: "relative mb-6",
                children: [
                  (0, i.jsx)("div", {
                    className: "absolute inset-0 flex items-center",
                    "aria-hidden": "true",
                    children: (0, i.jsx)("div", { className: "w-full border-t border-gray-300" }),
                  }),
                  (0, i.jsx)("div", {
                    className: "relative flex justify-center text-sm",
                    children: (0, i.jsx)("span", {
                      className: "bg-white px-2 text-gray-500",
                      children: "Or continue with email",
                    }),
                  }),
                ],
              }),
              (0, i.jsxs)("form", {
                onSubmit: u,
                className: "space-y-4",
                children: [
                  (0, i.jsxs)("div", {
                    children: [
                      (0, i.jsx)("label", {
                        htmlFor: "email",
                        className: "block text-sm font-medium text-gray-700",
                        children: "Email address",
                      }),
                      (0, i.jsx)("input", {
                        id: "email",
                        type: "email",
                        value: t,
                        onChange: (e) => r(e.target.value),
                        className:
                          "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
                        required: !0,
                      }),
                    ],
                  }),
                  (0, i.jsx)("button", {
                    type: "submit",
                    className:
                      "flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    children: "Continue",
                  }),
                ],
              }),
              c && (0, i.jsx)("p", { className: "mt-4 text-sm text-green-600", children: c }),
            ],
          });
        }
      },
      9932: (e, t, r) => {
        "use strict";
        r.d(t, { BlerpProvider: () => o, useAuth: () => n });
        var i = r(6760);
        let o = (0, i.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call BlerpProvider() from the server but BlerpProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/BlerpProvider.js",
            "BlerpProvider",
          ),
          n = (0, i.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call useAuth() from the server but useAuth is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/BlerpProvider.js",
            "useAuth",
          );
        (0, i.registerClientReference)(
          function () {
            throw Error(
              "Attempted to call useBlerpClient() from the server but useBlerpClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/BlerpProvider.js",
          "useBlerpClient",
        );
      },
      4889: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { SignIn: () => o, UserButton: () => n }));
        var i = r(6760);
        let o = (0, i.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call SignIn() from the server but SignIn is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/components/Auth.js",
            "SignIn",
          ),
          n = (0, i.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call UserButton() from the server but UserButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/components/Auth.js",
            "UserButton",
          );
      },
      1415: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { OrganizationSwitcher: () => i }));
        let i = (0, r(6760).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call OrganizationSwitcher() from the server but OrganizationSwitcher is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/components/OrganizationSwitcher.js",
          "OrganizationSwitcher",
        );
      },
      8455: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { SignUp: () => i }));
        let i = (0, r(6760).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call SignUp() from the server but SignUp is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/components/SignUp.js",
          "SignUp",
        );
      },
      8184: (e, t, r) => {
        "use strict";
        r.d(t, { F4: () => i.BlerpProvider, Hx: () => o.SignUp, Ls: () => n.SignIn });
        var i = r(9932),
          o = r(8455),
          n = r(4889);
        r(1415);
      },
    }));
  var t = require("../../webpack-runtime.js");
  t.C(e);
  var r = (e) => t((t.s = e)),
    i = t.X(0, [83], () => r(1271));
  module.exports = i;
})();
