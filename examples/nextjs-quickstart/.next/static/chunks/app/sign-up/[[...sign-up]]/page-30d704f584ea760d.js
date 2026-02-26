(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [177, 330, 810],
  {
    7951: (e, t, r) => {
      (Promise.resolve().then(r.bind(r, 2864)),
        Promise.resolve().then(r.bind(r, 9653)),
        Promise.resolve().then(r.bind(r, 2960)),
        Promise.resolve().then(r.bind(r, 987)));
    },
    2864: (e, t, r) => {
      "use strict";
      r.d(t, { BlerpProvider: () => u, o: () => m, useAuth: () => c });
      var s = r(5155),
        a = r(2115),
        n = r(419),
        i = r(9395),
        l = r(5549);
      let o = new i.E(),
        d = (0, a.createContext)(void 0);
      function u(e) {
        let { children: t, publishableKey: r } = e,
          i = (0, a.useMemo)(
            () => (0, n.Ay)({ baseUrl: "/", headers: { Authorization: "Bearer ".concat(r) } }),
            [r],
          ),
          u = (0, a.useMemo)(
            () => ({ userId: null, isLoaded: !0, isSignedIn: !1, client: i }),
            [i],
          );
        return (0, s.jsx)(l.Ht, {
          client: o,
          children: (0, s.jsx)(d.Provider, { value: u, children: t }),
        });
      }
      function c() {
        let e = (0, a.useContext)(d);
        if (void 0 === e) throw Error("useAuth must be used within a BlerpProvider");
        let { userId: t, isLoaded: r, isSignedIn: s } = e;
        return { userId: t, isLoaded: r, isSignedIn: s };
      }
      function m() {
        let e = (0, a.useContext)(d);
        if (void 0 === e) throw Error("useBlerpClient must be used within a BlerpProvider");
        return e.client;
      }
    },
    9653: (e, t, r) => {
      "use strict";
      (r.r(t), r.d(t, { SignIn: () => a, UserButton: () => n }));
      var s = r(5155);
      function a() {
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
      function n() {
        return (0, s.jsx)("div", {
          className:
            "h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold",
          children: "U",
        });
      }
    },
    2960: (e, t, r) => {
      "use strict";
      (r.r(t), r.d(t, { OrganizationSwitcher: () => u }));
      var s = r(5155),
        a = r(2115),
        n = r(4889),
        i = r(2864),
        l = r(2172),
        o = r(4894),
        d = r(102);
      function u() {
        let { data: e, isLoading: t } = (function () {
            let e = (0, i.o)();
            return (0, n.I)({
              queryKey: ["organizations"],
              queryFn: async () => {
                let { data: t, error: r } = await e.GET("/v1/organizations", {});
                if (r) throw r;
                return t.data || [];
              },
            });
          })(),
          [r, u] = (0, a.useState)(null),
          [c, m] = (0, a.useState)(!1),
          x = null == e ? void 0 : e.find((e) => e.id === r);
        return t
          ? (0, s.jsx)("div", { className: "h-10 w-full animate-pulse rounded bg-gray-100" })
          : (0, s.jsxs)("div", {
              className: "relative",
              children: [
                (0, s.jsxs)("button", {
                  onClick: () => m(!c),
                  className:
                    "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  children: [
                    (0, s.jsx)("span", {
                      className: "truncate",
                      children: x ? x.name : "Select Organization",
                    }),
                    (0, s.jsx)(l.A, { className: "ml-2 h-4 w-4 text-gray-400" }),
                  ],
                }),
                c &&
                  (0, s.jsx)("div", {
                    className:
                      "absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-white shadow-lg",
                    children: (0, s.jsxs)("div", {
                      className: "py-1",
                      children: [
                        null == e
                          ? void 0
                          : e.map((e) =>
                              (0, s.jsxs)(
                                "button",
                                {
                                  onClick: () => {
                                    (u(e.id), m(!1));
                                  },
                                  className:
                                    "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                                  children: [
                                    (0, s.jsx)("span", {
                                      className: "flex-1 truncate",
                                      children: e.name,
                                    }),
                                    e.id === r &&
                                      (0, s.jsx)(o.A, { className: "h-4 w-4 text-blue-600" }),
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
    987: (e, t, r) => {
      "use strict";
      (r.r(t), r.d(t, { SignUp: () => o }));
      var s = r(5155),
        a = r(2115),
        n = r(3877),
        i = r(4189),
        l = r(2864);
      function o() {
        let e = (0, l.o)(),
          [t, r] = (0, a.useState)(""),
          [o, d] = (0, a.useState)(null),
          u = async (r) => {
            r.preventDefault();
            let { data: s, error: a } = await e.POST("/v1/auth/signups", {
              body: { email: t, strategy: "password" },
            });
            a
              ? alert(a.error.message)
              : s && d("Signup initiated: ".concat(s.id, ". Please check your email."));
          },
          c = async (t) => {
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
                  onClick: () => c("github"),
                  className:
                    "flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50",
                  children: [(0, s.jsx)(n.A, { className: "mr-2 h-4 w-4" }), "GitHub"],
                }),
                (0, s.jsxs)("button", {
                  onClick: () => c("google"),
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
              onSubmit: u,
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
            o && (0, s.jsx)("p", { className: "mt-4 text-sm text-green-600", children: o }),
          ],
        });
      }
    },
  },
  (e) => {
    var t = (t) => e((e.s = t));
    (e.O(0, [952, 441, 517, 358], () => t(7951)), (_N_E = e.O()));
  },
]);
