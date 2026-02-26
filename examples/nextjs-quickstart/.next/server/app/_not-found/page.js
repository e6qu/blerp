(() => {
  var e = {};
  ((e.id = 492),
    (e.ids = [492]),
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
      6825: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, {
            GlobalError: () => i.a,
            __next_app__: () => u,
            pages: () => c,
            routeModule: () => m,
            tree: () => d,
          }));
        var s = r(260),
          n = r(8203),
          o = r(5155),
          i = r.n(o),
          l = r(7292),
          a = {};
        for (let e in l)
          0 >
            ["default", "tree", "pages", "GlobalError", "__next_app__", "routeModule"].indexOf(e) &&
            (a[e] = () => l[e]);
        r.d(t, a);
        let d = [
            "",
            {
              children: [
                "/_not-found",
                {
                  children: [
                    "__PAGE__",
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(r.t.bind(r, 9937, 23)),
                        "next/dist/client/components/not-found-error",
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
          c = [],
          u = { require: r, loadChunk: () => Promise.resolve() },
          m = new s.AppPageRouteModule({
            definition: {
              kind: n.RouteKind.APP_PAGE,
              page: "/_not-found/page",
              pathname: "/_not-found",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: d },
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
      1354: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => o }));
        var s = r(2740),
          n = r(8184);
        function o({ children: e }) {
          return (0, s.jsx)(n.F4, {
            publishableKey: "pk_test_123",
            children: (0, s.jsx)("html", {
              lang: "en",
              children: (0, s.jsx)("body", { children: e }),
            }),
          });
        }
        r(6301);
      },
      1980: (e, t, r) => {
        "use strict";
        r.d(t, { BlerpProvider: () => c, o: () => m, useAuth: () => u });
        var s = r(5512),
          n = r(8009),
          o = r(9221),
          i = r(6129),
          l = r(1381);
        let a = new i.E(),
          d = (0, n.createContext)(void 0);
        function c({ children: e, publishableKey: t }) {
          let r = (0, n.useMemo)(
              () => (0, o.Ay)({ baseUrl: "/", headers: { Authorization: `Bearer ${t}` } }),
              [t],
            ),
            i = (0, n.useMemo)(
              () => ({ userId: null, isLoaded: !0, isSignedIn: !1, client: r }),
              [r],
            );
          return (0, s.jsx)(l.Ht, {
            client: a,
            children: (0, s.jsx)(d.Provider, { value: i, children: e }),
          });
        }
        function u() {
          let e = (0, n.useContext)(d);
          if (void 0 === e) throw Error("useAuth must be used within a BlerpProvider");
          let { userId: t, isLoaded: r, isSignedIn: s } = e;
          return { userId: t, isLoaded: r, isSignedIn: s };
        }
        function m() {
          let e = (0, n.useContext)(d);
          if (void 0 === e) throw Error("useBlerpClient must be used within a BlerpProvider");
          return e.client;
        }
      },
      2697: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { SignIn: () => n, UserButton: () => o }));
        var s = r(5512);
        function n() {
          return (0, s.jsxs)("div", {
            className: "mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm",
            children: [
              (0, s.jsx)("h2", {
                className: "mb-6 text-2xl font-bold text-gray-900",
                children: "Sign in to Blerp",
              }),
              (0, s.jsx)("p", {
                className: "text-sm text-gray-500",
                children: "SignIn component placeholder.",
              }),
            ],
          });
        }
        function o() {
          return (0, s.jsx)("div", {
            className:
              "h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold",
            children: "U",
          });
        }
      },
      2200: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { OrganizationSwitcher: () => c }));
        var s = r(5512),
          n = r(8009),
          o = r(9743),
          i = r(1980),
          l = r(1128),
          a = r(3604),
          d = r(7922);
        function c() {
          let { data: e, isLoading: t } = (function () {
              let e = (0, i.o)();
              return (0, o.I)({
                queryKey: ["organizations"],
                queryFn: async () => {
                  let { data: t, error: r } = await e.GET("/v1/organizations", {});
                  if (r) throw r;
                  return t.data || [];
                },
              });
            })(),
            [r, c] = (0, n.useState)(null),
            [u, m] = (0, n.useState)(!1),
            p = e?.find((e) => e.id === r);
          return t
            ? (0, s.jsx)("div", { className: "h-10 w-full animate-pulse rounded bg-gray-100" })
            : (0, s.jsxs)("div", {
                className: "relative",
                children: [
                  (0, s.jsxs)("button", {
                    onClick: () => m(!u),
                    className:
                      "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    children: [
                      (0, s.jsx)("span", {
                        className: "truncate",
                        children: p ? p.name : "Select Organization",
                      }),
                      (0, s.jsx)(l.A, { className: "ml-2 h-4 w-4 text-gray-400" }),
                    ],
                  }),
                  u &&
                    (0, s.jsx)("div", {
                      className:
                        "absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-white shadow-lg",
                      children: (0, s.jsxs)("div", {
                        className: "py-1",
                        children: [
                          e?.map((e) =>
                            s.jsxs(
                              "button",
                              {
                                onClick: () => {
                                  (c(e.id), m(!1));
                                },
                                className:
                                  "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                                children: [
                                  s.jsx("span", { className: "flex-1 truncate", children: e.name }),
                                  e.id === r && s.jsx(a.A, { className: "h-4 w-4 text-blue-600" }),
                                ],
                              },
                              e.id,
                            ),
                          ),
                          (0, s.jsxs)("button", {
                            className:
                              "flex w-full items-center border-t px-4 py-2 text-sm text-blue-600 hover:bg-blue-50",
                            children: [
                              (0, s.jsx)(d.A, { className: "mr-2 h-4 w-4" }),
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
        (r.r(t), r.d(t, { SignUp: () => a }));
        var s = r(5512),
          n = r(8009),
          o = r(6277),
          i = r(3929),
          l = r(1980);
        function a() {
          let e = (0, l.o)(),
            [t, r] = (0, n.useState)(""),
            [a, d] = (0, n.useState)(null),
            c = async (r) => {
              r.preventDefault();
              let { data: s, error: n } = await e.POST("/v1/auth/signups", {
                body: { email: t, strategy: "password" },
              });
              n
                ? alert(n.error.message)
                : s && d(`Signup initiated: ${s.id}. Please check your email.`);
            },
            u = async (t) => {
              let { data: r, error: s } = await e.GET("/v1/auth/oauth/{provider}", {
                params: {
                  path: { provider: t },
                  query: { redirect_uri: window.location.origin + "/callback" },
                },
              });
              s ? alert("Failed to initiate OAuth") : r && r.url && (window.location.href = r.url);
            };
          return (0, s.jsxs)("div", {
            className: "mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm",
            children: [
              (0, s.jsx)("h2", {
                className: "mb-6 text-2xl font-bold text-gray-900",
                children: "Create your account",
              }),
              (0, s.jsxs)("div", {
                className: "grid grid-cols-2 gap-4 mb-6",
                children: [
                  (0, s.jsxs)("button", {
                    onClick: () => u("github"),
                    className:
                      "flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50",
                    children: [(0, s.jsx)(o.A, { className: "mr-2 h-4 w-4" }), "GitHub"],
                  }),
                  (0, s.jsxs)("button", {
                    onClick: () => u("google"),
                    className:
                      "flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50",
                    children: [(0, s.jsx)(i.A, { className: "mr-2 h-4 w-4" }), "Google"],
                  }),
                ],
              }),
              (0, s.jsxs)("div", {
                className: "relative mb-6",
                children: [
                  (0, s.jsx)("div", {
                    className: "absolute inset-0 flex items-center",
                    "aria-hidden": "true",
                    children: (0, s.jsx)("div", { className: "w-full border-t border-gray-300" }),
                  }),
                  (0, s.jsx)("div", {
                    className: "relative flex justify-center text-sm",
                    children: (0, s.jsx)("span", {
                      className: "bg-white px-2 text-gray-500",
                      children: "Or continue with email",
                    }),
                  }),
                ],
              }),
              (0, s.jsxs)("form", {
                onSubmit: c,
                className: "space-y-4",
                children: [
                  (0, s.jsxs)("div", {
                    children: [
                      (0, s.jsx)("label", {
                        htmlFor: "email",
                        className: "block text-sm font-medium text-gray-700",
                        children: "Email address",
                      }),
                      (0, s.jsx)("input", {
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
                  (0, s.jsx)("button", {
                    type: "submit",
                    className:
                      "flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    children: "Continue",
                  }),
                ],
              }),
              a && (0, s.jsx)("p", { className: "mt-4 text-sm text-green-600", children: a }),
            ],
          });
        }
      },
      9932: (e, t, r) => {
        "use strict";
        r.d(t, { BlerpProvider: () => n, useAuth: () => o });
        var s = r(6760);
        let n = (0, s.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call BlerpProvider() from the server but BlerpProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/BlerpProvider.js",
            "BlerpProvider",
          ),
          o = (0, s.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call useAuth() from the server but useAuth is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/BlerpProvider.js",
            "useAuth",
          );
        (0, s.registerClientReference)(
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
        (r.r(t), r.d(t, { SignIn: () => n, UserButton: () => o }));
        var s = r(6760);
        let n = (0, s.registerClientReference)(
            function () {
              throw Error(
                "Attempted to call SignIn() from the server but SignIn is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
              );
            },
            "/Users/zardoz/projects/blerp/packages/nextjs/dist/client/components/Auth.js",
            "SignIn",
          ),
          o = (0, s.registerClientReference)(
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
        (r.r(t), r.d(t, { OrganizationSwitcher: () => s }));
        let s = (0, r(6760).registerClientReference)(
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
        (r.r(t), r.d(t, { SignUp: () => s }));
        let s = (0, r(6760).registerClientReference)(
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
        r.d(t, { F4: () => s.BlerpProvider, Hx: () => n.SignUp, Ls: () => o.SignIn });
        var s = r(9932),
          n = r(8455),
          o = r(4889);
        r(1415);
      },
    }));
  var t = require("../../webpack-runtime.js");
  t.C(e);
  var r = (e) => t((t.s = e)),
    s = t.X(0, [83], () => r(6825));
  module.exports = s;
})();
