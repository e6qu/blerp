(() => {
  var e = {};
  ((e.id = 974),
    (e.ids = [974]),
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
      3388: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, {
            GlobalError: () => i.a,
            __next_app__: () => d,
            pages: () => c,
            routeModule: () => f,
            tree: () => l,
          }));
        var n = r(260),
          o = r(8203),
          s = r(5155),
          i = r.n(s),
          a = r(7292),
          u = {};
        for (let e in a)
          0 >
            ["default", "tree", "pages", "GlobalError", "__next_app__", "routeModule"].indexOf(e) &&
            (u[e] = () => a[e]);
        r.d(t, u);
        let l = [
            "",
            {
              children: [
                "__PAGE__",
                {},
                {
                  page: [
                    () => Promise.resolve().then(r.bind(r, 387)),
                    "/Users/zardoz/projects/blerp/examples/nextjs-quickstart/src/app/page.tsx",
                  ],
                },
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
          c = ["/Users/zardoz/projects/blerp/examples/nextjs-quickstart/src/app/page.tsx"],
          d = { require: r, loadChunk: () => Promise.resolve() },
          f = new n.AppPageRouteModule({
            definition: {
              kind: o.RouteKind.APP_PAGE,
              page: "/page",
              pathname: "/",
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
      7074: (e, t, r) => {
        Promise.resolve().then(r.t.bind(r, 5197, 23));
      },
      3930: (e, t, r) => {
        Promise.resolve().then(r.t.bind(r, 7801, 23));
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
      4380: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "addBasePath", {
            enumerable: !0,
            get: function () {
              return s;
            },
          }));
        let n = r(4147),
          o = r(4887);
        function s(e, t) {
          return (0, o.normalizePathTrailingSlash)((0, n.addPathPrefix)(e, ""));
        }
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      8485: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "addLocale", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }),
          r(4887));
        let n = function (e) {
          for (var t = arguments.length, r = Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++)
            r[n - 1] = arguments[n];
          return e;
        };
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      9793: (e, t, r) => {
        "use strict";
        function n(e, t, r, n) {
          return !1;
        }
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "getDomainLocale", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }),
          r(4887),
          ("function" == typeof t.default ||
            ("object" == typeof t.default && null !== t.default)) &&
            void 0 === t.default.__esModule &&
            (Object.defineProperty(t.default, "__esModule", { value: !0 }),
            Object.assign(t.default, t),
            (e.exports = t.default)));
      },
      5119: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "hasBasePath", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let n = r(8610);
        function o(e) {
          return (0, n.pathHasPrefix)(e, "");
        }
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      7801: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "default", {
            enumerable: !0,
            get: function () {
              return v;
            },
          }));
        let n = r(8523),
          o = r(5512),
          s = n._(r(8009)),
          i = r(8919),
          a = r(5285),
          u = r(5024),
          l = r(3438),
          c = r(8485),
          d = r(4055),
          f = r(7829),
          p = r(9118),
          h = r(9793),
          m = r(4380),
          g = r(5267),
          b = r(3727);
        function _(e) {
          return "string" == typeof e ? e : (0, u.formatUrl)(e);
        }
        let v = s.default.forwardRef(function (e, t) {
          let r, n;
          let {
            href: u,
            as: v,
            children: x,
            prefetch: y = null,
            passHref: E,
            replace: P,
            shallow: R,
            scroll: j,
            locale: S,
            onClick: O,
            onMouseEnter: A,
            onTouchStart: N,
            legacyBehavior: C = !1,
            ...w
          } = e;
          ((r = x),
            C &&
              ("string" == typeof r || "number" == typeof r) &&
              (r = (0, o.jsx)("a", { children: r })));
          let I = s.default.useContext(d.RouterContext),
            T = s.default.useContext(f.AppRouterContext),
            M = null != I ? I : T,
            U = !I,
            L = !1 !== y,
            k = null === y ? g.PrefetchKind.AUTO : g.PrefetchKind.FULL,
            { href: D, as: B } = s.default.useMemo(() => {
              if (!I) {
                let e = _(u);
                return { href: e, as: v ? _(v) : e };
              }
              let [e, t] = (0, i.resolveHref)(I, u, !0);
              return { href: e, as: v ? (0, i.resolveHref)(I, v) : t || e };
            }, [I, u, v]),
            z = s.default.useRef(D),
            F = s.default.useRef(B);
          C && (n = s.default.Children.only(r));
          let G = C ? n && "object" == typeof n && n.ref : t,
            [X, H, W] = (0, p.useIntersection)({ rootMargin: "200px" }),
            q = s.default.useCallback(
              (e) => {
                ((F.current !== B || z.current !== D) && (W(), (F.current = B), (z.current = D)),
                  X(e));
              },
              [B, D, W, X],
            ),
            Y = (0, b.useMergedRef)(q, G);
          s.default.useEffect(() => {}, [B, D, H, S, L, null == I ? void 0 : I.locale, M, U, k]);
          let K = {
            ref: Y,
            onClick(e) {
              (C || "function" != typeof O || O(e),
                C && n.props && "function" == typeof n.props.onClick && n.props.onClick(e),
                M &&
                  !e.defaultPrevented &&
                  (function (e, t, r, n, o, i, u, l, c) {
                    let { nodeName: d } = e.currentTarget;
                    if (
                      "A" === d.toUpperCase() &&
                      ((function (e) {
                        let t = e.currentTarget.getAttribute("target");
                        return (
                          (t && "_self" !== t) ||
                          e.metaKey ||
                          e.ctrlKey ||
                          e.shiftKey ||
                          e.altKey ||
                          (e.nativeEvent && 2 === e.nativeEvent.which)
                        );
                      })(e) ||
                        (!c && !(0, a.isLocalURL)(r)))
                    )
                      return;
                    e.preventDefault();
                    let f = () => {
                      let e = null == u || u;
                      "beforePopState" in t
                        ? t[o ? "replace" : "push"](r, n, { shallow: i, locale: l, scroll: e })
                        : t[o ? "replace" : "push"](n || r, { scroll: e });
                    };
                    c ? s.default.startTransition(f) : f();
                  })(e, M, D, B, P, R, j, S, U));
            },
            onMouseEnter(e) {
              (C || "function" != typeof A || A(e),
                C &&
                  n.props &&
                  "function" == typeof n.props.onMouseEnter &&
                  n.props.onMouseEnter(e));
            },
            onTouchStart: function (e) {
              (C || "function" != typeof N || N(e),
                C &&
                  n.props &&
                  "function" == typeof n.props.onTouchStart &&
                  n.props.onTouchStart(e));
            },
          };
          if ((0, l.isAbsoluteUrl)(B)) K.href = B;
          else if (!C || E || ("a" === n.type && !("href" in n.props))) {
            let e = void 0 !== S ? S : null == I ? void 0 : I.locale,
              t =
                (null == I ? void 0 : I.isLocaleDomain) &&
                (0, h.getDomainLocale)(
                  B,
                  e,
                  null == I ? void 0 : I.locales,
                  null == I ? void 0 : I.domainLocales,
                );
            K.href =
              t || (0, m.addBasePath)((0, c.addLocale)(B, e, null == I ? void 0 : I.defaultLocale));
          }
          return C ? s.default.cloneElement(n, K) : (0, o.jsx)("a", { ...w, ...K, children: r });
        });
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      4887: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "normalizePathTrailingSlash", {
            enumerable: !0,
            get: function () {
              return s;
            },
          }));
        let n = r(5612),
          o = r(1546),
          s = (e) => {
            if (!e.startsWith("/")) return e;
            let { pathname: t, query: r, hash: s } = (0, o.parsePath)(e);
            return "" + (0, n.removeTrailingSlash)(t) + r + s;
          };
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      1284: (e, t) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            cancelIdleCallback: function () {
              return n;
            },
            requestIdleCallback: function () {
              return r;
            },
          }));
        let r =
            ("undefined" != typeof self &&
              self.requestIdleCallback &&
              self.requestIdleCallback.bind(window)) ||
            function (e) {
              let t = Date.now();
              return self.setTimeout(function () {
                e({
                  didTimeout: !1,
                  timeRemaining: function () {
                    return Math.max(0, 50 - (Date.now() - t));
                  },
                });
              }, 1);
            },
          n =
            ("undefined" != typeof self &&
              self.cancelIdleCallback &&
              self.cancelIdleCallback.bind(window)) ||
            function (e) {
              return clearTimeout(e);
            };
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      8919: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "resolveHref", {
            enumerable: !0,
            get: function () {
              return d;
            },
          }));
        let n = r(3866),
          o = r(5024),
          s = r(7258),
          i = r(3438),
          a = r(4887),
          u = r(5285),
          l = r(1335),
          c = r(5669);
        function d(e, t, r) {
          let d;
          let f = "string" == typeof t ? t : (0, o.formatWithValidation)(t),
            p = f.match(/^[a-zA-Z]{1,}:\/\//),
            h = p ? f.slice(p[0].length) : f;
          if ((h.split("?", 1)[0] || "").match(/(\/\/|\\)/)) {
            console.error(
              "Invalid href '" +
                f +
                "' passed to next/router in page: '" +
                e.pathname +
                "'. Repeated forward-slashes (//) or backslashes \\ are not valid in the href.",
            );
            let t = (0, i.normalizeRepeatedSlashes)(h);
            f = (p ? p[0] : "") + t;
          }
          if (!(0, u.isLocalURL)(f)) return r ? [f] : f;
          try {
            d = new URL(f.startsWith("#") ? e.asPath : e.pathname, "http://n");
          } catch (e) {
            d = new URL("/", "http://n");
          }
          try {
            let e = new URL(f, d);
            e.pathname = (0, a.normalizePathTrailingSlash)(e.pathname);
            let t = "";
            if ((0, l.isDynamicRoute)(e.pathname) && e.searchParams && r) {
              let r = (0, n.searchParamsToUrlQuery)(e.searchParams),
                { result: i, params: a } = (0, c.interpolateAs)(e.pathname, e.pathname, r);
              i &&
                (t = (0, o.formatWithValidation)({
                  pathname: i,
                  hash: e.hash,
                  query: (0, s.omit)(r, a),
                }));
            }
            let i = e.origin === d.origin ? e.href.slice(e.origin.length) : e.href;
            return r ? [i, t || i] : i;
          } catch (e) {
            return r ? [f] : f;
          }
        }
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      9118: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "useIntersection", {
            enumerable: !0,
            get: function () {
              return u;
            },
          }));
        let n = r(8009),
          o = r(1284),
          s = "function" == typeof IntersectionObserver,
          i = new Map(),
          a = [];
        function u(e) {
          let { rootRef: t, rootMargin: r, disabled: u } = e,
            l = u || !s,
            [c, d] = (0, n.useState)(!1),
            f = (0, n.useRef)(null),
            p = (0, n.useCallback)((e) => {
              f.current = e;
            }, []);
          return (
            (0, n.useEffect)(() => {
              if (s) {
                if (l || c) return;
                let e = f.current;
                if (e && e.tagName)
                  return (function (e, t, r) {
                    let {
                      id: n,
                      observer: o,
                      elements: s,
                    } = (function (e) {
                      let t;
                      let r = { root: e.root || null, margin: e.rootMargin || "" },
                        n = a.find((e) => e.root === r.root && e.margin === r.margin);
                      if (n && (t = i.get(n))) return t;
                      let o = new Map();
                      return (
                        (t = {
                          id: r,
                          observer: new IntersectionObserver((e) => {
                            e.forEach((e) => {
                              let t = o.get(e.target),
                                r = e.isIntersecting || e.intersectionRatio > 0;
                              t && r && t(r);
                            });
                          }, e),
                          elements: o,
                        }),
                        a.push(r),
                        i.set(r, t),
                        t
                      );
                    })(r);
                    return (
                      s.set(e, t),
                      o.observe(e),
                      function () {
                        if ((s.delete(e), o.unobserve(e), 0 === s.size)) {
                          (o.disconnect(), i.delete(n));
                          let e = a.findIndex((e) => e.root === n.root && e.margin === n.margin);
                          e > -1 && a.splice(e, 1);
                        }
                      }
                    );
                  })(e, (e) => e && d(e), { root: null == t ? void 0 : t.current, rootMargin: r });
              } else if (!c) {
                let e = (0, o.requestIdleCallback)(() => d(!0));
                return () => (0, o.cancelIdleCallback)(e);
              }
            }, [l, r, t, c, f.current]),
            [
              p,
              c,
              (0, n.useCallback)(() => {
                d(!1);
              }, []),
            ]
          );
        }
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      3727: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "useMergedRef", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let n = r(8009);
        function o(e, t) {
          let r = (0, n.useRef)(() => {}),
            o = (0, n.useRef)(() => {});
          return (0, n.useMemo)(
            () =>
              e && t
                ? (n) => {
                    null === n
                      ? (r.current(), o.current())
                      : ((r.current = s(e, n)), (o.current = s(t, n)));
                  }
                : e || t,
            [e, t],
          );
        }
        function s(e, t) {
          if ("function" != typeof e)
            return (
              (e.current = t),
              () => {
                e.current = null;
              }
            );
          {
            let r = e(t);
            return "function" == typeof r ? r : () => e(null);
          }
        }
        ("function" == typeof t.default || ("object" == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, "__esModule", { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      9204: (e, t) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            ACTION_SUFFIX: function () {
              return d;
            },
            APP_DIR_ALIAS: function () {
              return I;
            },
            CACHE_ONE_YEAR: function () {
              return R;
            },
            DOT_NEXT_ALIAS: function () {
              return C;
            },
            ESLINT_DEFAULT_DIRS: function () {
              return Q;
            },
            GSP_NO_RETURNED_VALUE: function () {
              return W;
            },
            GSSP_COMPONENT_MEMBER_ERROR: function () {
              return K;
            },
            GSSP_NO_RETURNED_VALUE: function () {
              return q;
            },
            INFINITE_CACHE: function () {
              return j;
            },
            INSTRUMENTATION_HOOK_FILENAME: function () {
              return A;
            },
            MATCHED_PATH_HEADER: function () {
              return o;
            },
            MIDDLEWARE_FILENAME: function () {
              return S;
            },
            MIDDLEWARE_LOCATION_REGEXP: function () {
              return O;
            },
            NEXT_BODY_SUFFIX: function () {
              return h;
            },
            NEXT_CACHE_IMPLICIT_TAG_ID: function () {
              return P;
            },
            NEXT_CACHE_REVALIDATED_TAGS_HEADER: function () {
              return b;
            },
            NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER: function () {
              return _;
            },
            NEXT_CACHE_SOFT_TAGS_HEADER: function () {
              return g;
            },
            NEXT_CACHE_SOFT_TAG_MAX_LENGTH: function () {
              return E;
            },
            NEXT_CACHE_TAGS_HEADER: function () {
              return m;
            },
            NEXT_CACHE_TAG_MAX_ITEMS: function () {
              return x;
            },
            NEXT_CACHE_TAG_MAX_LENGTH: function () {
              return y;
            },
            NEXT_DATA_SUFFIX: function () {
              return f;
            },
            NEXT_INTERCEPTION_MARKER_PREFIX: function () {
              return n;
            },
            NEXT_META_SUFFIX: function () {
              return p;
            },
            NEXT_QUERY_PARAM_PREFIX: function () {
              return r;
            },
            NEXT_RESUME_HEADER: function () {
              return v;
            },
            NON_STANDARD_NODE_ENV: function () {
              return V;
            },
            PAGES_DIR_ALIAS: function () {
              return N;
            },
            PRERENDER_REVALIDATE_HEADER: function () {
              return s;
            },
            PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER: function () {
              return i;
            },
            PUBLIC_DIR_MIDDLEWARE_CONFLICT: function () {
              return B;
            },
            ROOT_DIR_ALIAS: function () {
              return w;
            },
            RSC_ACTION_CLIENT_WRAPPER_ALIAS: function () {
              return D;
            },
            RSC_ACTION_ENCRYPTION_ALIAS: function () {
              return k;
            },
            RSC_ACTION_PROXY_ALIAS: function () {
              return U;
            },
            RSC_ACTION_VALIDATE_ALIAS: function () {
              return M;
            },
            RSC_CACHE_WRAPPER_ALIAS: function () {
              return L;
            },
            RSC_MOD_REF_PROXY_ALIAS: function () {
              return T;
            },
            RSC_PREFETCH_SUFFIX: function () {
              return a;
            },
            RSC_SEGMENTS_DIR_SUFFIX: function () {
              return u;
            },
            RSC_SEGMENT_SUFFIX: function () {
              return l;
            },
            RSC_SUFFIX: function () {
              return c;
            },
            SERVER_PROPS_EXPORT_ERROR: function () {
              return H;
            },
            SERVER_PROPS_GET_INIT_PROPS_CONFLICT: function () {
              return F;
            },
            SERVER_PROPS_SSG_CONFLICT: function () {
              return G;
            },
            SERVER_RUNTIME: function () {
              return Z;
            },
            SSG_FALLBACK_EXPORT_ERROR: function () {
              return $;
            },
            SSG_GET_INITIAL_PROPS_CONFLICT: function () {
              return z;
            },
            STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR: function () {
              return X;
            },
            UNSTABLE_REVALIDATE_RENAME_ERROR: function () {
              return Y;
            },
            WEBPACK_LAYERS: function () {
              return ee;
            },
            WEBPACK_RESOURCE_QUERIES: function () {
              return et;
            },
          }));
        let r = "nxtP",
          n = "nxtI",
          o = "x-matched-path",
          s = "x-prerender-revalidate",
          i = "x-prerender-revalidate-if-generated",
          a = ".prefetch.rsc",
          u = ".segments",
          l = ".segment.rsc",
          c = ".rsc",
          d = ".action",
          f = ".json",
          p = ".meta",
          h = ".body",
          m = "x-next-cache-tags",
          g = "x-next-cache-soft-tags",
          b = "x-next-revalidated-tags",
          _ = "x-next-revalidate-tag-token",
          v = "next-resume",
          x = 64,
          y = 256,
          E = 1024,
          P = "_N_T_",
          R = 31536e3,
          j = 0xfffffffe,
          S = "middleware",
          O = `(?:src/)?${S}`,
          A = "instrumentation",
          N = "private-next-pages",
          C = "private-dot-next",
          w = "private-next-root-dir",
          I = "private-next-app-dir",
          T = "private-next-rsc-mod-ref-proxy",
          M = "private-next-rsc-action-validate",
          U = "private-next-rsc-server-reference",
          L = "private-next-rsc-cache-wrapper",
          k = "private-next-rsc-action-encryption",
          D = "private-next-rsc-action-client-wrapper",
          B =
            "You can not have a '_next' folder inside of your public folder. This conflicts with the internal '/_next' route. https://nextjs.org/docs/messages/public-next-folder-conflict",
          z =
            "You can not use getInitialProps with getStaticProps. To use SSG, please remove your getInitialProps",
          F =
            "You can not use getInitialProps with getServerSideProps. Please remove getInitialProps.",
          G =
            "You can not use getStaticProps or getStaticPaths with getServerSideProps. To use SSG, please remove getServerSideProps",
          X =
            "can not have getInitialProps/getServerSideProps, https://nextjs.org/docs/messages/404-get-initial-props",
          H =
            "pages with `getServerSideProps` can not be exported. See more info here: https://nextjs.org/docs/messages/gssp-export",
          W =
            "Your `getStaticProps` function did not return an object. Did you forget to add a `return`?",
          q =
            "Your `getServerSideProps` function did not return an object. Did you forget to add a `return`?",
          Y =
            "The `unstable_revalidate` property is available for general use.\nPlease use `revalidate` instead.",
          K =
            "can not be attached to a page's component and must be exported from the page. See more info here: https://nextjs.org/docs/messages/gssp-component-member",
          V =
            'You are using a non-standard "NODE_ENV" value in your environment. This creates inconsistencies in the project and is strongly advised against. Read more: https://nextjs.org/docs/messages/non-standard-node-env',
          $ =
            "Pages with `fallback` enabled in `getStaticPaths` can not be exported. See more info here: https://nextjs.org/docs/messages/ssg-fallback-true-export",
          Q = ["app", "pages", "components", "lib", "src"],
          Z = { edge: "edge", experimentalEdge: "experimental-edge", nodejs: "nodejs" },
          J = {
            shared: "shared",
            reactServerComponents: "rsc",
            serverSideRendering: "ssr",
            actionBrowser: "action-browser",
            api: "api",
            middleware: "middleware",
            instrument: "instrument",
            edgeAsset: "edge-asset",
            appPagesBrowser: "app-pages-browser",
          },
          ee = {
            ...J,
            GROUP: {
              builtinReact: [J.reactServerComponents, J.actionBrowser],
              serverOnly: [J.reactServerComponents, J.actionBrowser, J.instrument, J.middleware],
              neutralTarget: [J.api],
              clientOnly: [J.serverSideRendering, J.appPagesBrowser],
              bundled: [
                J.reactServerComponents,
                J.actionBrowser,
                J.serverSideRendering,
                J.appPagesBrowser,
                J.shared,
                J.instrument,
              ],
              appPages: [
                J.reactServerComponents,
                J.serverSideRendering,
                J.appPagesBrowser,
                J.actionBrowser,
              ],
            },
          },
          et = {
            edgeSSREntry: "__next_edge_ssr_entry__",
            metadata: "__next_metadata__",
            metadataRoute: "__next_metadata_route__",
            metadataImageMeta: "__next_metadata_image_meta__",
          };
      },
      4055: (e, t, r) => {
        "use strict";
        e.exports = r(8104).vendored.contexts.RouterContext;
      },
      880: (e, t) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "escapeStringRegexp", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let r = /[|\\{}()[\]^$+*?.-]/,
          n = /[|\\{}()[\]^$+*?.-]/g;
        function o(e) {
          return r.test(e) ? e.replace(n, "\\$&") : e;
        }
      },
      4147: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "addPathPrefix", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let n = r(1546);
        function o(e, t) {
          if (!e.startsWith("/") || !t) return e;
          let { pathname: r, query: o, hash: s } = (0, n.parsePath)(e);
          return "" + t + r + o + s;
        }
      },
      5024: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            formatUrl: function () {
              return s;
            },
            formatWithValidation: function () {
              return a;
            },
            urlObjectKeys: function () {
              return i;
            },
          }));
        let n = r(3666)._(r(3866)),
          o = /https?|ftp|gopher|file/;
        function s(e) {
          let { auth: t, hostname: r } = e,
            s = e.protocol || "",
            i = e.pathname || "",
            a = e.hash || "",
            u = e.query || "",
            l = !1;
          ((t = t ? encodeURIComponent(t).replace(/%3A/i, ":") + "@" : ""),
            e.host
              ? (l = t + e.host)
              : r &&
                ((l = t + (~r.indexOf(":") ? "[" + r + "]" : r)), e.port && (l += ":" + e.port)),
            u && "object" == typeof u && (u = String(n.urlQueryToSearchParams(u))));
          let c = e.search || (u && "?" + u) || "";
          return (
            s && !s.endsWith(":") && (s += ":"),
            e.slashes || ((!s || o.test(s)) && !1 !== l)
              ? ((l = "//" + (l || "")), i && "/" !== i[0] && (i = "/" + i))
              : l || (l = ""),
            a && "#" !== a[0] && (a = "#" + a),
            c && "?" !== c[0] && (c = "?" + c),
            "" +
              s +
              l +
              (i = i.replace(/[?#]/g, encodeURIComponent)) +
              (c = c.replace("#", "%23")) +
              a
          );
        }
        let i = [
          "auth",
          "hash",
          "host",
          "hostname",
          "href",
          "path",
          "pathname",
          "port",
          "protocol",
          "query",
          "search",
          "slashes",
        ];
        function a(e) {
          return s(e);
        }
      },
      1335: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            getSortedRouteObjects: function () {
              return n.getSortedRouteObjects;
            },
            getSortedRoutes: function () {
              return n.getSortedRoutes;
            },
            isDynamicRoute: function () {
              return o.isDynamicRoute;
            },
          }));
        let n = r(2509),
          o = r(8812);
      },
      5669: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "interpolateAs", {
            enumerable: !0,
            get: function () {
              return s;
            },
          }));
        let n = r(6885),
          o = r(3004);
        function s(e, t, r) {
          let s = "",
            i = (0, o.getRouteRegex)(e),
            a = i.groups,
            u = (t !== e ? (0, n.getRouteMatcher)(i)(t) : "") || r;
          s = e;
          let l = Object.keys(a);
          return (
            l.every((e) => {
              let t = u[e] || "",
                { repeat: r, optional: n } = a[e],
                o = "[" + (r ? "..." : "") + e + "]";
              return (
                n && (o = (t ? "" : "/") + "[" + o + "]"),
                r && !Array.isArray(t) && (t = [t]),
                (n || e in u) &&
                  (s =
                    s.replace(
                      o,
                      r ? t.map((e) => encodeURIComponent(e)).join("/") : encodeURIComponent(t),
                    ) || "/")
              );
            }) || (s = ""),
            { params: l, result: s }
          );
        }
      },
      8812: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "isDynamicRoute", {
            enumerable: !0,
            get: function () {
              return s;
            },
          }));
        let n = r(5640),
          o = /\/\[[^/]+?\](?=\/|$)/;
        function s(e) {
          return (
            (0, n.isInterceptionRouteAppPath)(e) &&
              (e = (0, n.extractInterceptionRouteInformation)(e).interceptedRoute),
            o.test(e)
          );
        }
      },
      5285: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "isLocalURL", {
            enumerable: !0,
            get: function () {
              return s;
            },
          }));
        let n = r(3438),
          o = r(5119);
        function s(e) {
          if (!(0, n.isAbsoluteUrl)(e)) return !0;
          try {
            let t = (0, n.getLocationOrigin)(),
              r = new URL(e, t);
            return r.origin === t && (0, o.hasBasePath)(r.pathname);
          } catch (e) {
            return !1;
          }
        }
      },
      7258: (e, t) => {
        "use strict";
        function r(e, t) {
          let r = {};
          return (
            Object.keys(e).forEach((n) => {
              t.includes(n) || (r[n] = e[n]);
            }),
            r
          );
        }
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "omit", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
      },
      1546: (e, t) => {
        "use strict";
        function r(e) {
          let t = e.indexOf("#"),
            r = e.indexOf("?"),
            n = r > -1 && (t < 0 || r < t);
          return n || t > -1
            ? {
                pathname: e.substring(0, n ? r : t),
                query: n ? e.substring(r, t > -1 ? t : void 0) : "",
                hash: t > -1 ? e.slice(t) : "",
              }
            : { pathname: e, query: "", hash: "" };
        }
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "parsePath", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
      },
      8610: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "pathHasPrefix", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let n = r(1546);
        function o(e, t) {
          if ("string" != typeof e) return !1;
          let { pathname: r } = (0, n.parsePath)(e);
          return r === t || r.startsWith(t + "/");
        }
      },
      3866: (e, t) => {
        "use strict";
        function r(e) {
          let t = {};
          return (
            e.forEach((e, r) => {
              void 0 === t[r]
                ? (t[r] = e)
                : Array.isArray(t[r])
                  ? t[r].push(e)
                  : (t[r] = [t[r], e]);
            }),
            t
          );
        }
        function n(e) {
          return "string" != typeof e && ("number" != typeof e || isNaN(e)) && "boolean" != typeof e
            ? ""
            : String(e);
        }
        function o(e) {
          let t = new URLSearchParams();
          return (
            Object.entries(e).forEach((e) => {
              let [r, o] = e;
              Array.isArray(o) ? o.forEach((e) => t.append(r, n(e))) : t.set(r, n(o));
            }),
            t
          );
        }
        function s(e) {
          for (var t = arguments.length, r = Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++)
            r[n - 1] = arguments[n];
          return (
            r.forEach((t) => {
              (Array.from(t.keys()).forEach((t) => e.delete(t)),
                t.forEach((t, r) => e.append(r, t)));
            }),
            e
          );
        }
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            assign: function () {
              return s;
            },
            searchParamsToUrlQuery: function () {
              return r;
            },
            urlQueryToSearchParams: function () {
              return o;
            },
          }));
      },
      5612: (e, t) => {
        "use strict";
        function r(e) {
          return e.replace(/\/$/, "") || "/";
        }
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "removeTrailingSlash", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
      },
      6885: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "getRouteMatcher", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let n = r(3438);
        function o(e) {
          let { re: t, groups: r } = e;
          return (e) => {
            let o = t.exec(e);
            if (!o) return !1;
            let s = (e) => {
                try {
                  return decodeURIComponent(e);
                } catch (e) {
                  throw new n.DecodeError("failed to decode param");
                }
              },
              i = {};
            return (
              Object.keys(r).forEach((e) => {
                let t = r[e],
                  n = o[t.pos];
                void 0 !== n &&
                  (i[e] = ~n.indexOf("/")
                    ? n.split("/").map((e) => s(e))
                    : t.repeat
                      ? [s(n)]
                      : s(n));
              }),
              i
            );
          };
        }
      },
      3004: (e, t, r) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            getNamedMiddlewareRegex: function () {
              return m;
            },
            getNamedRouteRegex: function () {
              return h;
            },
            getRouteRegex: function () {
              return d;
            },
            parseParameter: function () {
              return u;
            },
          }));
        let n = r(9204),
          o = r(5640),
          s = r(880),
          i = r(5612),
          a = /\[((?:\[.*\])|.+)\]/;
        function u(e) {
          let t = e.match(a);
          return t ? l(t[1]) : l(e);
        }
        function l(e) {
          let t = e.startsWith("[") && e.endsWith("]");
          t && (e = e.slice(1, -1));
          let r = e.startsWith("...");
          return (r && (e = e.slice(3)), { key: e, repeat: r, optional: t });
        }
        function c(e) {
          let t = (0, i.removeTrailingSlash)(e).slice(1).split("/"),
            r = {},
            n = 1;
          return {
            parameterizedRoute: t
              .map((e) => {
                let t = o.INTERCEPTION_ROUTE_MARKERS.find((t) => e.startsWith(t)),
                  i = e.match(a);
                if (t && i) {
                  let { key: e, optional: o, repeat: a } = l(i[1]);
                  return (
                    (r[e] = { pos: n++, repeat: a, optional: o }),
                    "/" + (0, s.escapeStringRegexp)(t) + "([^/]+?)"
                  );
                }
                if (!i) return "/" + (0, s.escapeStringRegexp)(e);
                {
                  let { key: e, repeat: t, optional: o } = l(i[1]);
                  return (
                    (r[e] = { pos: n++, repeat: t, optional: o }),
                    t ? (o ? "(?:/(.+?))?" : "/(.+?)") : "/([^/]+?)"
                  );
                }
              })
              .join(""),
            groups: r,
          };
        }
        function d(e) {
          let { parameterizedRoute: t, groups: r } = c(e);
          return { re: RegExp("^" + t + "(?:/)?$"), groups: r };
        }
        function f(e) {
          let {
              interceptionMarker: t,
              getSafeRouteKey: r,
              segment: n,
              routeKeys: o,
              keyPrefix: i,
            } = e,
            { key: a, optional: u, repeat: c } = l(n),
            d = a.replace(/\W/g, "");
          i && (d = "" + i + d);
          let f = !1;
          ((0 === d.length || d.length > 30) && (f = !0),
            isNaN(parseInt(d.slice(0, 1))) || (f = !0),
            f && (d = r()),
            i ? (o[d] = "" + i + a) : (o[d] = a));
          let p = t ? (0, s.escapeStringRegexp)(t) : "";
          return c
            ? u
              ? "(?:/" + p + "(?<" + d + ">.+?))?"
              : "/" + p + "(?<" + d + ">.+?)"
            : "/" + p + "(?<" + d + ">[^/]+?)";
        }
        function p(e, t) {
          let r;
          let a = (0, i.removeTrailingSlash)(e).slice(1).split("/"),
            u =
              ((r = 0),
              () => {
                let e = "",
                  t = ++r;
                for (; t > 0; )
                  ((e += String.fromCharCode(97 + ((t - 1) % 26))), (t = Math.floor((t - 1) / 26)));
                return e;
              }),
            l = {};
          return {
            namedParameterizedRoute: a
              .map((e) => {
                let r = o.INTERCEPTION_ROUTE_MARKERS.some((t) => e.startsWith(t)),
                  i = e.match(/\[((?:\[.*\])|.+)\]/);
                if (r && i) {
                  let [r] = e.split(i[0]);
                  return f({
                    getSafeRouteKey: u,
                    interceptionMarker: r,
                    segment: i[1],
                    routeKeys: l,
                    keyPrefix: t ? n.NEXT_INTERCEPTION_MARKER_PREFIX : void 0,
                  });
                }
                return i
                  ? f({
                      getSafeRouteKey: u,
                      segment: i[1],
                      routeKeys: l,
                      keyPrefix: t ? n.NEXT_QUERY_PARAM_PREFIX : void 0,
                    })
                  : "/" + (0, s.escapeStringRegexp)(e);
              })
              .join(""),
            routeKeys: l,
          };
        }
        function h(e, t) {
          let r = p(e, t);
          return {
            ...d(e),
            namedRegex: "^" + r.namedParameterizedRoute + "(?:/)?$",
            routeKeys: r.routeKeys,
          };
        }
        function m(e, t) {
          let { parameterizedRoute: r } = c(e),
            { catchAll: n = !0 } = t;
          if ("/" === r) return { namedRegex: "^/" + (n ? ".*" : "") + "$" };
          let { namedParameterizedRoute: o } = p(e, !1);
          return { namedRegex: "^" + o + (n ? "(?:(/.*)?)" : "") + "$" };
        }
      },
      2509: (e, t) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            getSortedRouteObjects: function () {
              return o;
            },
            getSortedRoutes: function () {
              return n;
            },
          }));
        class r {
          insert(e) {
            this._insert(e.split("/").filter(Boolean), [], !1);
          }
          smoosh() {
            return this._smoosh();
          }
          _smoosh(e) {
            void 0 === e && (e = "/");
            let t = [...this.children.keys()].sort();
            (null !== this.slugName && t.splice(t.indexOf("[]"), 1),
              null !== this.restSlugName && t.splice(t.indexOf("[...]"), 1),
              null !== this.optionalRestSlugName && t.splice(t.indexOf("[[...]]"), 1));
            let r = t
              .map((t) => this.children.get(t)._smoosh("" + e + t + "/"))
              .reduce((e, t) => [...e, ...t], []);
            if (
              (null !== this.slugName &&
                r.push(...this.children.get("[]")._smoosh(e + "[" + this.slugName + "]/")),
              !this.placeholder)
            ) {
              let t = "/" === e ? "/" : e.slice(0, -1);
              if (null != this.optionalRestSlugName)
                throw Error(
                  'You cannot define a route with the same specificity as a optional catch-all route ("' +
                    t +
                    '" and "' +
                    t +
                    "[[..." +
                    this.optionalRestSlugName +
                    ']]").',
                );
              r.unshift(t);
            }
            return (
              null !== this.restSlugName &&
                r.push(
                  ...this.children.get("[...]")._smoosh(e + "[..." + this.restSlugName + "]/"),
                ),
              null !== this.optionalRestSlugName &&
                r.push(
                  ...this.children
                    .get("[[...]]")
                    ._smoosh(e + "[[..." + this.optionalRestSlugName + "]]/"),
                ),
              r
            );
          }
          _insert(e, t, n) {
            if (0 === e.length) {
              this.placeholder = !1;
              return;
            }
            if (n) throw Error("Catch-all must be the last part of the URL.");
            let o = e[0];
            if (o.startsWith("[") && o.endsWith("]")) {
              let r = o.slice(1, -1),
                i = !1;
              if (
                (r.startsWith("[") && r.endsWith("]") && ((r = r.slice(1, -1)), (i = !0)),
                r.startsWith("…"))
              )
                throw Error(
                  "Detected a three-dot character ('…') at ('" + r + "'). Did you mean ('...')?",
                );
              if (
                (r.startsWith("...") && ((r = r.substring(3)), (n = !0)),
                r.startsWith("[") || r.endsWith("]"))
              )
                throw Error(
                  "Segment names may not start or end with extra brackets ('" + r + "').",
                );
              if (r.startsWith("."))
                throw Error("Segment names may not start with erroneous periods ('" + r + "').");
              function s(e, r) {
                if (null !== e && e !== r)
                  throw Error(
                    "You cannot use different slug names for the same dynamic path ('" +
                      e +
                      "' !== '" +
                      r +
                      "').",
                  );
                (t.forEach((e) => {
                  if (e === r)
                    throw Error(
                      'You cannot have the same slug name "' +
                        r +
                        '" repeat within a single dynamic path',
                    );
                  if (e.replace(/\W/g, "") === o.replace(/\W/g, ""))
                    throw Error(
                      'You cannot have the slug names "' +
                        e +
                        '" and "' +
                        r +
                        '" differ only by non-word symbols within a single dynamic path',
                    );
                }),
                  t.push(r));
              }
              if (n) {
                if (i) {
                  if (null != this.restSlugName)
                    throw Error(
                      'You cannot use both an required and optional catch-all route at the same level ("[...' +
                        this.restSlugName +
                        ']" and "' +
                        e[0] +
                        '" ).',
                    );
                  (s(this.optionalRestSlugName, r),
                    (this.optionalRestSlugName = r),
                    (o = "[[...]]"));
                } else {
                  if (null != this.optionalRestSlugName)
                    throw Error(
                      'You cannot use both an optional and required catch-all route at the same level ("[[...' +
                        this.optionalRestSlugName +
                        ']]" and "' +
                        e[0] +
                        '").',
                    );
                  (s(this.restSlugName, r), (this.restSlugName = r), (o = "[...]"));
                }
              } else {
                if (i)
                  throw Error('Optional route parameters are not yet supported ("' + e[0] + '").');
                (s(this.slugName, r), (this.slugName = r), (o = "[]"));
              }
            }
            (this.children.has(o) || this.children.set(o, new r()),
              this.children.get(o)._insert(e.slice(1), t, n));
          }
          constructor() {
            ((this.placeholder = !0),
              (this.children = new Map()),
              (this.slugName = null),
              (this.restSlugName = null),
              (this.optionalRestSlugName = null));
          }
        }
        function n(e) {
          let t = new r();
          return (e.forEach((e) => t.insert(e)), t.smoosh());
        }
        function o(e, t) {
          let r = {},
            o = [];
          for (let n = 0; n < e.length; n++) {
            let s = t(e[n]);
            ((r[s] = n), (o[n] = s));
          }
          return n(o).map((t) => e[r[t]]);
        }
      },
      3438: (e, t) => {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          (function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          })(t, {
            DecodeError: function () {
              return h;
            },
            MiddlewareNotFoundError: function () {
              return _;
            },
            MissingStaticPage: function () {
              return b;
            },
            NormalizeError: function () {
              return m;
            },
            PageNotFoundError: function () {
              return g;
            },
            SP: function () {
              return f;
            },
            ST: function () {
              return p;
            },
            WEB_VITALS: function () {
              return r;
            },
            execOnce: function () {
              return n;
            },
            getDisplayName: function () {
              return u;
            },
            getLocationOrigin: function () {
              return i;
            },
            getURL: function () {
              return a;
            },
            isAbsoluteUrl: function () {
              return s;
            },
            isResSent: function () {
              return l;
            },
            loadGetInitialProps: function () {
              return d;
            },
            normalizeRepeatedSlashes: function () {
              return c;
            },
            stringifyError: function () {
              return v;
            },
          }));
        let r = ["CLS", "FCP", "FID", "INP", "LCP", "TTFB"];
        function n(e) {
          let t,
            r = !1;
          return function () {
            for (var n = arguments.length, o = Array(n), s = 0; s < n; s++) o[s] = arguments[s];
            return (r || ((r = !0), (t = e(...o))), t);
          };
        }
        let o = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/,
          s = (e) => o.test(e);
        function i() {
          let { protocol: e, hostname: t, port: r } = window.location;
          return e + "//" + t + (r ? ":" + r : "");
        }
        function a() {
          let { href: e } = window.location,
            t = i();
          return e.substring(t.length);
        }
        function u(e) {
          return "string" == typeof e ? e : e.displayName || e.name || "Unknown";
        }
        function l(e) {
          return e.finished || e.headersSent;
        }
        function c(e) {
          let t = e.split("?");
          return (
            t[0].replace(/\\/g, "/").replace(/\/\/+/g, "/") +
            (t[1] ? "?" + t.slice(1).join("?") : "")
          );
        }
        async function d(e, t) {
          let r = t.res || (t.ctx && t.ctx.res);
          if (!e.getInitialProps)
            return t.ctx && t.Component ? { pageProps: await d(t.Component, t.ctx) } : {};
          let n = await e.getInitialProps(t);
          if (r && l(r)) return n;
          if (!n)
            throw Error(
              '"' +
                u(e) +
                '.getInitialProps()" should resolve to an object. But found "' +
                n +
                '" instead.',
            );
          return n;
        }
        let f = "undefined" != typeof performance,
          p =
            f &&
            ["mark", "measure", "getEntriesByName"].every(
              (e) => "function" == typeof performance[e],
            );
        class h extends Error {}
        class m extends Error {}
        class g extends Error {
          constructor(e) {
            (super(),
              (this.code = "ENOENT"),
              (this.name = "PageNotFoundError"),
              (this.message = "Cannot find module for page: " + e));
          }
        }
        class b extends Error {
          constructor(e, t) {
            (super(), (this.message = "Failed to load static file for page: " + e + " " + t));
          }
        }
        class _ extends Error {
          constructor() {
            (super(), (this.code = "ENOENT"), (this.message = "Cannot find the middleware module"));
          }
        }
        function v(e) {
          return JSON.stringify({ message: e.message, stack: e.stack });
        }
      },
      5197: (e, t, r) => {
        let { createProxy: n } = r(3439);
        e.exports = n(
          "/Users/zardoz/projects/blerp/examples/nextjs-quickstart/node_modules/next/dist/client/link.js",
        );
      },
      1354: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => s }));
        var n = r(2740),
          o = r(8184);
        function s({ children: e }) {
          return (0, n.jsx)(o.F4, {
            publishableKey: "pk_test_123",
            children: (0, n.jsx)("html", {
              lang: "en",
              children: (0, n.jsx)("body", { children: e }),
            }),
          });
        }
        r(6301);
      },
      387: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => i }));
        var n = r(2740),
          o = r(5197),
          s = r.n(o);
        function i() {
          return (0, n.jsxs)("div", {
            className: "p-8",
            children: [
              (0, n.jsx)("h1", { children: "Blerp Next.js Quickstart" }),
              (0, n.jsx)("p", { children: "This is a public page." }),
              (0, n.jsx)(s(), {
                href: "/dashboard",
                className: "text-blue-600 underline",
                children: "Go to Dashboard (Protected)",
              }),
            ],
          });
        }
      },
      1980: (e, t, r) => {
        "use strict";
        r.d(t, { BlerpProvider: () => c, o: () => f, useAuth: () => d });
        var n = r(5512),
          o = r(8009),
          s = r(9221),
          i = r(6129),
          a = r(1381);
        let u = new i.E(),
          l = (0, o.createContext)(void 0);
        function c({ children: e, publishableKey: t }) {
          let r = (0, o.useMemo)(
              () => (0, s.Ay)({ baseUrl: "/", headers: { Authorization: `Bearer ${t}` } }),
              [t],
            ),
            i = (0, o.useMemo)(
              () => ({ userId: null, isLoaded: !0, isSignedIn: !1, client: r }),
              [r],
            );
          return (0, n.jsx)(a.Ht, {
            client: u,
            children: (0, n.jsx)(l.Provider, { value: i, children: e }),
          });
        }
        function d() {
          let e = (0, o.useContext)(l);
          if (void 0 === e) throw Error("useAuth must be used within a BlerpProvider");
          let { userId: t, isLoaded: r, isSignedIn: n } = e;
          return { userId: t, isLoaded: r, isSignedIn: n };
        }
        function f() {
          let e = (0, o.useContext)(l);
          if (void 0 === e) throw Error("useBlerpClient must be used within a BlerpProvider");
          return e.client;
        }
      },
      2697: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { SignIn: () => o, UserButton: () => s }));
        var n = r(5512);
        function o() {
          return (0, n.jsxs)("div", {
            className: "mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm",
            children: [
              (0, n.jsx)("h2", {
                className: "mb-6 text-2xl font-bold text-gray-900",
                children: "Sign in to Blerp",
              }),
              (0, n.jsx)("p", {
                className: "text-sm text-gray-500",
                children: "SignIn component placeholder.",
              }),
            ],
          });
        }
        function s() {
          return (0, n.jsx)("div", {
            className:
              "h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold",
            children: "U",
          });
        }
      },
      2200: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { OrganizationSwitcher: () => c }));
        var n = r(5512),
          o = r(8009),
          s = r(9743),
          i = r(1980),
          a = r(1128),
          u = r(3604),
          l = r(7922);
        function c() {
          let { data: e, isLoading: t } = (function () {
              let e = (0, i.o)();
              return (0, s.I)({
                queryKey: ["organizations"],
                queryFn: async () => {
                  let { data: t, error: r } = await e.GET("/v1/organizations", {});
                  if (r) throw r;
                  return t.data || [];
                },
              });
            })(),
            [r, c] = (0, o.useState)(null),
            [d, f] = (0, o.useState)(!1),
            p = e?.find((e) => e.id === r);
          return t
            ? (0, n.jsx)("div", { className: "h-10 w-full animate-pulse rounded bg-gray-100" })
            : (0, n.jsxs)("div", {
                className: "relative",
                children: [
                  (0, n.jsxs)("button", {
                    onClick: () => f(!d),
                    className:
                      "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    children: [
                      (0, n.jsx)("span", {
                        className: "truncate",
                        children: p ? p.name : "Select Organization",
                      }),
                      (0, n.jsx)(a.A, { className: "ml-2 h-4 w-4 text-gray-400" }),
                    ],
                  }),
                  d &&
                    (0, n.jsx)("div", {
                      className:
                        "absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-white shadow-lg",
                      children: (0, n.jsxs)("div", {
                        className: "py-1",
                        children: [
                          e?.map((e) =>
                            n.jsxs(
                              "button",
                              {
                                onClick: () => {
                                  (c(e.id), f(!1));
                                },
                                className:
                                  "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                                children: [
                                  n.jsx("span", { className: "flex-1 truncate", children: e.name }),
                                  e.id === r && n.jsx(u.A, { className: "h-4 w-4 text-blue-600" }),
                                ],
                              },
                              e.id,
                            ),
                          ),
                          (0, n.jsxs)("button", {
                            className:
                              "flex w-full items-center border-t px-4 py-2 text-sm text-blue-600 hover:bg-blue-50",
                            children: [
                              (0, n.jsx)(l.A, { className: "mr-2 h-4 w-4" }),
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
        (r.r(t), r.d(t, { SignUp: () => u }));
        var n = r(5512),
          o = r(8009),
          s = r(6277),
          i = r(3929),
          a = r(1980);
        function u() {
          let e = (0, a.o)(),
            [t, r] = (0, o.useState)(""),
            [u, l] = (0, o.useState)(null),
            c = async (r) => {
              r.preventDefault();
              let { data: n, error: o } = await e.POST("/v1/auth/signups", {
                body: { email: t, strategy: "password" },
              });
              o
                ? alert(o.error.message)
                : n && l(`Signup initiated: ${n.id}. Please check your email.`);
            },
            d = async (t) => {
              let { data: r, error: n } = await e.GET("/v1/auth/oauth/{provider}", {
                params: {
                  path: { provider: t },
                  query: { redirect_uri: window.location.origin + "/callback" },
                },
              });
              n ? alert("Failed to initiate OAuth") : r && r.url && (window.location.href = r.url);
            };
          return (0, n.jsxs)("div", {
            className: "mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm",
            children: [
              (0, n.jsx)("h2", {
                className: "mb-6 text-2xl font-bold text-gray-900",
                children: "Create your account",
              }),
              (0, n.jsxs)("div", {
                className: "grid grid-cols-2 gap-4 mb-6",
                children: [
                  (0, n.jsxs)("button", {
                    onClick: () => d("github"),
                    className:
                      "flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50",
                    children: [(0, n.jsx)(s.A, { className: "mr-2 h-4 w-4" }), "GitHub"],
                  }),
                  (0, n.jsxs)("button", {
                    onClick: () => d("google"),
                    className:
                      "flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50",
                    children: [(0, n.jsx)(i.A, { className: "mr-2 h-4 w-4" }), "Google"],
                  }),
                ],
              }),
              (0, n.jsxs)("div", {
                className: "relative mb-6",
                children: [
                  (0, n.jsx)("div", {
                    className: "absolute inset-0 flex items-center",
                    "aria-hidden": "true",
                    children: (0, n.jsx)("div", { className: "w-full border-t border-gray-300" }),
                  }),
                  (0, n.jsx)("div", {
                    className: "relative flex justify-center text-sm",
                    children: (0, n.jsx)("span", {
                      className: "bg-white px-2 text-gray-500",
                      children: "Or continue with email",
                    }),
                  }),
                ],
              }),
              (0, n.jsxs)("form", {
                onSubmit: c,
                className: "space-y-4",
                children: [
                  (0, n.jsxs)("div", {
                    children: [
                      (0, n.jsx)("label", {
                        htmlFor: "email",
                        className: "block text-sm font-medium text-gray-700",
                        children: "Email address",
                      }),
                      (0, n.jsx)("input", {
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
                  (0, n.jsx)("button", {
                    type: "submit",
                    className:
                      "flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    children: "Continue",
                  }),
                ],
              }),
              u && (0, n.jsx)("p", { className: "mt-4 text-sm text-green-600", children: u }),
            ],
          });
        }
      },
      9932: (e, t, r) => {
        "use strict";
        r.d(t, { BlerpProvider: () => o, useAuth: () => s });
        var n = r(6760);
        let o = (0, n.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call BlerpProvider() from the server but BlerpProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/BlerpProvider.js",
            "BlerpProvider",
          ),
          s = (0, n.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call useAuth() from the server but useAuth is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/BlerpProvider.js",
            "useAuth",
          );
        (0, n.registerClientReference)(
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
        (r.r(t), r.d(t, { SignIn: () => o, UserButton: () => s }));
        var n = r(6760);
        let o = (0, n.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call SignIn() from the server but SignIn is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/components/Auth.js",
            "SignIn",
          ),
          s = (0, n.registerClientReference)(
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
        (r.r(t), r.d(t, { OrganizationSwitcher: () => n }));
        let n = (0, r(6760).registerClientReference)(
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
        (r.r(t), r.d(t, { SignUp: () => n }));
        let n = (0, r(6760).registerClientReference)(
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
        r.d(t, { F4: () => n.BlerpProvider, Hx: () => o.SignUp, Ls: () => s.SignIn });
        var n = r(9932),
          o = r(8455),
          s = r(4889);
        r(1415);
      },
    }));
  var t = require("../webpack-runtime.js");
  t.C(e);
  var r = (e) => t((t.s = e)),
    n = t.X(0, [83], () => r(3388));
  module.exports = n;
})();
