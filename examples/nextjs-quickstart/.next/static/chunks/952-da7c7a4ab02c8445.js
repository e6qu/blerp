"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [952],
  {
    7257: (t, e, s) => {
      s.d(e, { A: () => c });
      var r = s(2115);
      let i = function () {
          for (var t = arguments.length, e = Array(t), s = 0; s < t; s++) e[s] = arguments[s];
          return e
            .filter((t, e, s) => !!t && "" !== t.trim() && s.indexOf(t) === e)
            .join(" ")
            .trim();
        },
        n = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
        a = (t) =>
          t.replace(/^([A-Z])|[\s-_]+(\w)/g, (t, e, s) => (s ? s.toUpperCase() : e.toLowerCase())),
        o = (t) => {
          let e = a(t);
          return e.charAt(0).toUpperCase() + e.slice(1);
        };
      var u = {
        xmlns: "http://www.w3.org/2000/svg",
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      };
      let h = (t) => {
          for (let e in t) if (e.startsWith("aria-") || "role" === e || "title" === e) return !0;
          return !1;
        },
        l = (0, r.forwardRef)((t, e) => {
          let {
            color: s = "currentColor",
            size: n = 24,
            strokeWidth: a = 2,
            absoluteStrokeWidth: o,
            className: l = "",
            children: c,
            iconNode: d,
            ...f
          } = t;
          return (0, r.createElement)(
            "svg",
            {
              ref: e,
              ...u,
              width: n,
              height: n,
              stroke: s,
              strokeWidth: o ? (24 * Number(a)) / Number(n) : a,
              className: i("lucide", l),
              ...(!c && !h(f) && { "aria-hidden": "true" }),
              ...f,
            },
            [
              ...d.map((t) => {
                let [e, s] = t;
                return (0, r.createElement)(e, s);
              }),
              ...(Array.isArray(c) ? c : [c]),
            ],
          );
        }),
        c = (t, e) => {
          let s = (0, r.forwardRef)((s, a) => {
            let { className: u, ...h } = s;
            return (0, r.createElement)(l, {
              ref: a,
              iconNode: e,
              className: i("lucide-".concat(n(o(t))), "lucide-".concat(t), u),
              ...h,
            });
          });
          return ((s.displayName = o(t)), s);
        };
    },
    4894: (t, e, s) => {
      s.d(e, { A: () => r });
      let r = (0, s(7257).A)("check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
    },
    2172: (t, e, s) => {
      s.d(e, { A: () => r });
      let r = (0, s(7257).A)("chevron-down", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]);
    },
    3877: (t, e, s) => {
      s.d(e, { A: () => r });
      let r = (0, s(7257).A)("github", [
        [
          "path",
          {
            d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
            key: "tonef",
          },
        ],
        ["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "9comsn" }],
      ]);
    },
    4189: (t, e, s) => {
      s.d(e, { A: () => r });
      let r = (0, s(7257).A)("mail", [
        ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
        ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }],
      ]);
    },
    102: (t, e, s) => {
      s.d(e, { A: () => r });
      let r = (0, s(7257).A)("plus", [
        ["path", { d: "M5 12h14", key: "1ays0h" }],
        ["path", { d: "M12 5v14", key: "s699le" }],
      ]);
    },
    8878: (t, e, s) => {
      s.d(e, { m: () => n });
      var r = s(5844),
        i = s(5638),
        n = new (class extends r.Q {
          #t;
          #e;
          #s;
          constructor() {
            (super(),
              (this.#s = (t) => {
                if (!i.S$ && window.addEventListener) {
                  let e = () => t();
                  return (
                    window.addEventListener("visibilitychange", e, !1),
                    () => {
                      window.removeEventListener("visibilitychange", e);
                    }
                  );
                }
              }));
          }
          onSubscribe() {
            this.#e || this.setEventListener(this.#s);
          }
          onUnsubscribe() {
            this.hasListeners() || (this.#e?.(), (this.#e = void 0));
          }
          setEventListener(t) {
            ((this.#s = t),
              this.#e?.(),
              (this.#e = t((t) => {
                "boolean" == typeof t ? this.setFocused(t) : this.onFocus();
              })));
          }
          setFocused(t) {
            this.#t !== t && ((this.#t = t), this.onFocus());
          }
          onFocus() {
            let t = this.isFocused();
            this.listeners.forEach((e) => {
              e(t);
            });
          }
          isFocused() {
            return "boolean" == typeof this.#t
              ? this.#t
              : globalThis.document?.visibilityState !== "hidden";
          }
        })();
    },
    5563: (t, e, s) => {
      s.d(e, { jG: () => i });
      var r = s(7939).Zq,
        i = (function () {
          let t = [],
            e = 0,
            s = (t) => {
              t();
            },
            i = (t) => {
              t();
            },
            n = r,
            a = (r) => {
              e
                ? t.push(r)
                : n(() => {
                    s(r);
                  });
            },
            o = () => {
              let e = t;
              ((t = []),
                e.length &&
                  n(() => {
                    i(() => {
                      e.forEach((t) => {
                        s(t);
                      });
                    });
                  }));
            };
          return {
            batch: (t) => {
              let s;
              e++;
              try {
                s = t();
              } finally {
                --e || o();
              }
              return s;
            },
            batchCalls:
              (t) =>
              (...e) => {
                a(() => {
                  t(...e);
                });
              },
            schedule: a,
            setNotifyFunction: (t) => {
              s = t;
            },
            setBatchNotifyFunction: (t) => {
              i = t;
            },
            setScheduler: (t) => {
              n = t;
            },
          };
        })();
    },
    7125: (t, e, s) => {
      s.d(e, { t: () => n });
      var r = s(5844),
        i = s(5638),
        n = new (class extends r.Q {
          #r = !0;
          #e;
          #s;
          constructor() {
            (super(),
              (this.#s = (t) => {
                if (!i.S$ && window.addEventListener) {
                  let e = () => t(!0),
                    s = () => t(!1);
                  return (
                    window.addEventListener("online", e, !1),
                    window.addEventListener("offline", s, !1),
                    () => {
                      (window.removeEventListener("online", e),
                        window.removeEventListener("offline", s));
                    }
                  );
                }
              }));
          }
          onSubscribe() {
            this.#e || this.setEventListener(this.#s);
          }
          onUnsubscribe() {
            this.hasListeners() || (this.#e?.(), (this.#e = void 0));
          }
          setEventListener(t) {
            ((this.#s = t), this.#e?.(), (this.#e = t(this.setOnline.bind(this))));
          }
          setOnline(t) {
            this.#r !== t &&
              ((this.#r = t),
              this.listeners.forEach((e) => {
                e(t);
              }));
          }
          isOnline() {
            return this.#r;
          }
        })();
    },
    9511: (t, e, s) => {
      s.d(e, { X: () => o, k: () => u });
      var r = s(5638),
        i = s(5563),
        n = s(2618),
        a = s(7506),
        o = class extends a.k {
          #i;
          #n;
          #a;
          #o;
          #u;
          #h;
          #l;
          constructor(t) {
            (super(),
              (this.#l = !1),
              (this.#h = t.defaultOptions),
              this.setOptions(t.options),
              (this.observers = []),
              (this.#o = t.client),
              (this.#a = this.#o.getQueryCache()),
              (this.queryKey = t.queryKey),
              (this.queryHash = t.queryHash),
              (this.#i = l(this.options)),
              (this.state = t.state ?? this.#i),
              this.scheduleGc());
          }
          get meta() {
            return this.options.meta;
          }
          get promise() {
            return this.#u?.promise;
          }
          setOptions(t) {
            if (
              ((this.options = { ...this.#h, ...t }),
              this.updateGcTime(this.options.gcTime),
              this.state && void 0 === this.state.data)
            ) {
              let t = l(this.options);
              void 0 !== t.data && (this.setState(h(t.data, t.dataUpdatedAt)), (this.#i = t));
            }
          }
          optionalRemove() {
            this.observers.length || "idle" !== this.state.fetchStatus || this.#a.remove(this);
          }
          setData(t, e) {
            let s = (0, r.pl)(this.state.data, t, this.options);
            return (
              this.#c({ data: s, type: "success", dataUpdatedAt: e?.updatedAt, manual: e?.manual }),
              s
            );
          }
          setState(t, e) {
            this.#c({ type: "setState", state: t, setStateOptions: e });
          }
          cancel(t) {
            let e = this.#u?.promise;
            return (this.#u?.cancel(t), e ? e.then(r.lQ).catch(r.lQ) : Promise.resolve());
          }
          destroy() {
            (super.destroy(), this.cancel({ silent: !0 }));
          }
          reset() {
            (this.destroy(), this.setState(this.#i));
          }
          isActive() {
            return this.observers.some((t) => !1 !== (0, r.Eh)(t.options.enabled, this));
          }
          isDisabled() {
            return this.getObserversCount() > 0
              ? !this.isActive()
              : this.options.queryFn === r.hT ||
                  this.state.dataUpdateCount + this.state.errorUpdateCount === 0;
          }
          isStatic() {
            return (
              this.getObserversCount() > 0 &&
              this.observers.some((t) => "static" === (0, r.d2)(t.options.staleTime, this))
            );
          }
          isStale() {
            return this.getObserversCount() > 0
              ? this.observers.some((t) => t.getCurrentResult().isStale)
              : void 0 === this.state.data || this.state.isInvalidated;
          }
          isStaleByTime(t = 0) {
            return (
              void 0 === this.state.data ||
              ("static" !== t &&
                (!!this.state.isInvalidated || !(0, r.j3)(this.state.dataUpdatedAt, t)))
            );
          }
          onFocus() {
            let t = this.observers.find((t) => t.shouldFetchOnWindowFocus());
            (t?.refetch({ cancelRefetch: !1 }), this.#u?.continue());
          }
          onOnline() {
            let t = this.observers.find((t) => t.shouldFetchOnReconnect());
            (t?.refetch({ cancelRefetch: !1 }), this.#u?.continue());
          }
          addObserver(t) {
            this.observers.includes(t) ||
              (this.observers.push(t),
              this.clearGcTimeout(),
              this.#a.notify({ type: "observerAdded", query: this, observer: t }));
          }
          removeObserver(t) {
            this.observers.includes(t) &&
              ((this.observers = this.observers.filter((e) => e !== t)),
              this.observers.length ||
                (this.#u && (this.#l ? this.#u.cancel({ revert: !0 }) : this.#u.cancelRetry()),
                this.scheduleGc()),
              this.#a.notify({ type: "observerRemoved", query: this, observer: t }));
          }
          getObserversCount() {
            return this.observers.length;
          }
          invalidate() {
            this.state.isInvalidated || this.#c({ type: "invalidate" });
          }
          async fetch(t, e) {
            if ("idle" !== this.state.fetchStatus && this.#u?.status() !== "rejected") {
              if (void 0 !== this.state.data && e?.cancelRefetch) this.cancel({ silent: !0 });
              else if (this.#u) return (this.#u.continueRetry(), this.#u.promise);
            }
            if ((t && this.setOptions(t), !this.options.queryFn)) {
              let t = this.observers.find((t) => t.options.queryFn);
              t && this.setOptions(t.options);
            }
            let s = new AbortController(),
              i = (t) => {
                Object.defineProperty(t, "signal", {
                  enumerable: !0,
                  get: () => ((this.#l = !0), s.signal),
                });
              },
              a = () => {
                let t = (0, r.ZM)(this.options, e),
                  s = (() => {
                    let t = { client: this.#o, queryKey: this.queryKey, meta: this.meta };
                    return (i(t), t);
                  })();
                return ((this.#l = !1), this.options.persister)
                  ? this.options.persister(t, s, this)
                  : t(s);
              },
              o = (() => {
                let t = {
                  fetchOptions: e,
                  options: this.options,
                  queryKey: this.queryKey,
                  client: this.#o,
                  state: this.state,
                  fetchFn: a,
                };
                return (i(t), t);
              })();
            (this.options.behavior?.onFetch(o, this),
              (this.#n = this.state),
              ("idle" === this.state.fetchStatus ||
                this.state.fetchMeta !== o.fetchOptions?.meta) &&
                this.#c({ type: "fetch", meta: o.fetchOptions?.meta }),
              (this.#u = (0, n.II)({
                initialPromise: e?.initialPromise,
                fn: o.fetchFn,
                onCancel: (t) => {
                  (t instanceof n.cc &&
                    t.revert &&
                    this.setState({ ...this.#n, fetchStatus: "idle" }),
                    s.abort());
                },
                onFail: (t, e) => {
                  this.#c({ type: "failed", failureCount: t, error: e });
                },
                onPause: () => {
                  this.#c({ type: "pause" });
                },
                onContinue: () => {
                  this.#c({ type: "continue" });
                },
                retry: o.options.retry,
                retryDelay: o.options.retryDelay,
                networkMode: o.options.networkMode,
                canRun: () => !0,
              })));
            try {
              let t = await this.#u.start();
              if (void 0 === t) throw Error(`${this.queryHash} data is undefined`);
              return (
                this.setData(t),
                this.#a.config.onSuccess?.(t, this),
                this.#a.config.onSettled?.(t, this.state.error, this),
                t
              );
            } catch (t) {
              if (t instanceof n.cc) {
                if (t.silent) return this.#u.promise;
                if (t.revert) {
                  if (void 0 === this.state.data) throw t;
                  return this.state.data;
                }
              }
              throw (
                this.#c({ type: "error", error: t }),
                this.#a.config.onError?.(t, this),
                this.#a.config.onSettled?.(this.state.data, t, this),
                t
              );
            } finally {
              this.scheduleGc();
            }
          }
          #c(t) {
            ((this.state = ((e) => {
              switch (t.type) {
                case "failed":
                  return { ...e, fetchFailureCount: t.failureCount, fetchFailureReason: t.error };
                case "pause":
                  return { ...e, fetchStatus: "paused" };
                case "continue":
                  return { ...e, fetchStatus: "fetching" };
                case "fetch":
                  return { ...e, ...u(e.data, this.options), fetchMeta: t.meta ?? null };
                case "success":
                  let s = {
                    ...e,
                    ...h(t.data, t.dataUpdatedAt),
                    dataUpdateCount: e.dataUpdateCount + 1,
                    ...(!t.manual && {
                      fetchStatus: "idle",
                      fetchFailureCount: 0,
                      fetchFailureReason: null,
                    }),
                  };
                  return ((this.#n = t.manual ? s : void 0), s);
                case "error":
                  let r = t.error;
                  return {
                    ...e,
                    error: r,
                    errorUpdateCount: e.errorUpdateCount + 1,
                    errorUpdatedAt: Date.now(),
                    fetchFailureCount: e.fetchFailureCount + 1,
                    fetchFailureReason: r,
                    fetchStatus: "idle",
                    status: "error",
                    isInvalidated: !0,
                  };
                case "invalidate":
                  return { ...e, isInvalidated: !0 };
                case "setState":
                  return { ...e, ...t.state };
              }
            })(this.state)),
              i.jG.batch(() => {
                (this.observers.forEach((t) => {
                  t.onQueryUpdate();
                }),
                  this.#a.notify({ query: this, type: "updated", action: t }));
              }));
          }
        };
      function u(t, e) {
        return {
          fetchFailureCount: 0,
          fetchFailureReason: null,
          fetchStatus: (0, n.v_)(e.networkMode) ? "fetching" : "paused",
          ...(void 0 === t && { error: null, status: "pending" }),
        };
      }
      function h(t, e) {
        return {
          data: t,
          dataUpdatedAt: e ?? Date.now(),
          error: null,
          isInvalidated: !1,
          status: "success",
        };
      }
      function l(t) {
        let e = "function" == typeof t.initialData ? t.initialData() : t.initialData,
          s = void 0 !== e,
          r = s
            ? "function" == typeof t.initialDataUpdatedAt
              ? t.initialDataUpdatedAt()
              : t.initialDataUpdatedAt
            : 0;
        return {
          data: e,
          dataUpdateCount: 0,
          dataUpdatedAt: s ? (r ?? Date.now()) : 0,
          error: null,
          errorUpdateCount: 0,
          errorUpdatedAt: 0,
          fetchFailureCount: 0,
          fetchFailureReason: null,
          fetchMeta: null,
          isInvalidated: !1,
          status: s ? "success" : "pending",
          fetchStatus: "idle",
        };
      }
    },
    9395: (t, e, s) => {
      s.d(e, { E: () => v });
      var r = s(5638),
        i = s(9511),
        n = s(5563),
        a = s(5844),
        o = class extends a.Q {
          constructor(t = {}) {
            (super(), (this.config = t), (this.#d = new Map()));
          }
          #d;
          build(t, e, s) {
            let n = e.queryKey,
              a = e.queryHash ?? (0, r.F$)(n, e),
              o = this.get(a);
            return (
              o ||
                ((o = new i.X({
                  client: t,
                  queryKey: n,
                  queryHash: a,
                  options: t.defaultQueryOptions(e),
                  state: s,
                  defaultOptions: t.getQueryDefaults(n),
                })),
                this.add(o)),
              o
            );
          }
          add(t) {
            this.#d.has(t.queryHash) ||
              (this.#d.set(t.queryHash, t), this.notify({ type: "added", query: t }));
          }
          remove(t) {
            let e = this.#d.get(t.queryHash);
            e &&
              (t.destroy(),
              e === t && this.#d.delete(t.queryHash),
              this.notify({ type: "removed", query: t }));
          }
          clear() {
            n.jG.batch(() => {
              this.getAll().forEach((t) => {
                this.remove(t);
              });
            });
          }
          get(t) {
            return this.#d.get(t);
          }
          getAll() {
            return [...this.#d.values()];
          }
          find(t) {
            let e = { exact: !0, ...t };
            return this.getAll().find((t) => (0, r.MK)(e, t));
          }
          findAll(t = {}) {
            let e = this.getAll();
            return Object.keys(t).length > 0 ? e.filter((e) => (0, r.MK)(t, e)) : e;
          }
          notify(t) {
            n.jG.batch(() => {
              this.listeners.forEach((e) => {
                e(t);
              });
            });
          }
          onFocus() {
            n.jG.batch(() => {
              this.getAll().forEach((t) => {
                t.onFocus();
              });
            });
          }
          onOnline() {
            n.jG.batch(() => {
              this.getAll().forEach((t) => {
                t.onOnline();
              });
            });
          }
        },
        u = s(7506),
        h = s(2618),
        l = class extends u.k {
          #o;
          #f;
          #p;
          #u;
          constructor(t) {
            (super(),
              (this.#o = t.client),
              (this.mutationId = t.mutationId),
              (this.#p = t.mutationCache),
              (this.#f = []),
              (this.state = t.state || {
                context: void 0,
                data: void 0,
                error: null,
                failureCount: 0,
                failureReason: null,
                isPaused: !1,
                status: "idle",
                variables: void 0,
                submittedAt: 0,
              }),
              this.setOptions(t.options),
              this.scheduleGc());
          }
          setOptions(t) {
            ((this.options = t), this.updateGcTime(this.options.gcTime));
          }
          get meta() {
            return this.options.meta;
          }
          addObserver(t) {
            this.#f.includes(t) ||
              (this.#f.push(t),
              this.clearGcTimeout(),
              this.#p.notify({ type: "observerAdded", mutation: this, observer: t }));
          }
          removeObserver(t) {
            ((this.#f = this.#f.filter((e) => e !== t)),
              this.scheduleGc(),
              this.#p.notify({ type: "observerRemoved", mutation: this, observer: t }));
          }
          optionalRemove() {
            this.#f.length ||
              ("pending" === this.state.status ? this.scheduleGc() : this.#p.remove(this));
          }
          continue() {
            return this.#u?.continue() ?? this.execute(this.state.variables);
          }
          async execute(t) {
            let e = () => {
                this.#c({ type: "continue" });
              },
              s = {
                client: this.#o,
                meta: this.options.meta,
                mutationKey: this.options.mutationKey,
              };
            this.#u = (0, h.II)({
              fn: () =>
                this.options.mutationFn
                  ? this.options.mutationFn(t, s)
                  : Promise.reject(Error("No mutationFn found")),
              onFail: (t, e) => {
                this.#c({ type: "failed", failureCount: t, error: e });
              },
              onPause: () => {
                this.#c({ type: "pause" });
              },
              onContinue: e,
              retry: this.options.retry ?? 0,
              retryDelay: this.options.retryDelay,
              networkMode: this.options.networkMode,
              canRun: () => this.#p.canRun(this),
            });
            let r = "pending" === this.state.status,
              i = !this.#u.canStart();
            try {
              if (r) e();
              else {
                (this.#c({ type: "pending", variables: t, isPaused: i }),
                  this.#p.config.onMutate && (await this.#p.config.onMutate(t, this, s)));
                let e = await this.options.onMutate?.(t, s);
                e !== this.state.context &&
                  this.#c({ type: "pending", context: e, variables: t, isPaused: i });
              }
              let n = await this.#u.start();
              return (
                await this.#p.config.onSuccess?.(n, t, this.state.context, this, s),
                await this.options.onSuccess?.(n, t, this.state.context, s),
                await this.#p.config.onSettled?.(
                  n,
                  null,
                  this.state.variables,
                  this.state.context,
                  this,
                  s,
                ),
                await this.options.onSettled?.(n, null, t, this.state.context, s),
                this.#c({ type: "success", data: n }),
                n
              );
            } catch (e) {
              try {
                await this.#p.config.onError?.(e, t, this.state.context, this, s);
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.options.onError?.(e, t, this.state.context, s);
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.#p.config.onSettled?.(
                  void 0,
                  e,
                  this.state.variables,
                  this.state.context,
                  this,
                  s,
                );
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.options.onSettled?.(void 0, e, t, this.state.context, s);
              } catch (t) {
                Promise.reject(t);
              }
              throw (this.#c({ type: "error", error: e }), e);
            } finally {
              this.#p.runNext(this);
            }
          }
          #c(t) {
            ((this.state = ((e) => {
              switch (t.type) {
                case "failed":
                  return { ...e, failureCount: t.failureCount, failureReason: t.error };
                case "pause":
                  return { ...e, isPaused: !0 };
                case "continue":
                  return { ...e, isPaused: !1 };
                case "pending":
                  return {
                    ...e,
                    context: t.context,
                    data: void 0,
                    failureCount: 0,
                    failureReason: null,
                    error: null,
                    isPaused: t.isPaused,
                    status: "pending",
                    variables: t.variables,
                    submittedAt: Date.now(),
                  };
                case "success":
                  return {
                    ...e,
                    data: t.data,
                    failureCount: 0,
                    failureReason: null,
                    error: null,
                    status: "success",
                    isPaused: !1,
                  };
                case "error":
                  return {
                    ...e,
                    data: void 0,
                    error: t.error,
                    failureCount: e.failureCount + 1,
                    failureReason: t.error,
                    isPaused: !1,
                    status: "error",
                  };
              }
            })(this.state)),
              n.jG.batch(() => {
                (this.#f.forEach((e) => {
                  e.onMutationUpdate(t);
                }),
                  this.#p.notify({ mutation: this, type: "updated", action: t }));
              }));
          }
        },
        c = class extends a.Q {
          constructor(t = {}) {
            (super(),
              (this.config = t),
              (this.#y = new Set()),
              (this.#m = new Map()),
              (this.#v = 0));
          }
          #y;
          #m;
          #v;
          build(t, e, s) {
            let r = new l({
              client: t,
              mutationCache: this,
              mutationId: ++this.#v,
              options: t.defaultMutationOptions(e),
              state: s,
            });
            return (this.add(r), r);
          }
          add(t) {
            this.#y.add(t);
            let e = d(t);
            if ("string" == typeof e) {
              let s = this.#m.get(e);
              s ? s.push(t) : this.#m.set(e, [t]);
            }
            this.notify({ type: "added", mutation: t });
          }
          remove(t) {
            if (this.#y.delete(t)) {
              let e = d(t);
              if ("string" == typeof e) {
                let s = this.#m.get(e);
                if (s) {
                  if (s.length > 1) {
                    let e = s.indexOf(t);
                    -1 !== e && s.splice(e, 1);
                  } else s[0] === t && this.#m.delete(e);
                }
              }
            }
            this.notify({ type: "removed", mutation: t });
          }
          canRun(t) {
            let e = d(t);
            if ("string" != typeof e) return !0;
            {
              let s = this.#m.get(e),
                r = s?.find((t) => "pending" === t.state.status);
              return !r || r === t;
            }
          }
          runNext(t) {
            let e = d(t);
            if ("string" != typeof e) return Promise.resolve();
            {
              let s = this.#m.get(e)?.find((e) => e !== t && e.state.isPaused);
              return s?.continue() ?? Promise.resolve();
            }
          }
          clear() {
            n.jG.batch(() => {
              (this.#y.forEach((t) => {
                this.notify({ type: "removed", mutation: t });
              }),
                this.#y.clear(),
                this.#m.clear());
            });
          }
          getAll() {
            return Array.from(this.#y);
          }
          find(t) {
            let e = { exact: !0, ...t };
            return this.getAll().find((t) => (0, r.nJ)(e, t));
          }
          findAll(t = {}) {
            return this.getAll().filter((e) => (0, r.nJ)(t, e));
          }
          notify(t) {
            n.jG.batch(() => {
              this.listeners.forEach((e) => {
                e(t);
              });
            });
          }
          resumePausedMutations() {
            let t = this.getAll().filter((t) => t.state.isPaused);
            return n.jG.batch(() => Promise.all(t.map((t) => t.continue().catch(r.lQ))));
          }
        };
      function d(t) {
        return t.options.scope?.id;
      }
      var f = s(8878),
        p = s(7125);
      function y(t) {
        return {
          onFetch: (e, s) => {
            let i = e.options,
              n = e.fetchOptions?.meta?.fetchMore?.direction,
              a = e.state.data?.pages || [],
              o = e.state.data?.pageParams || [],
              u = { pages: [], pageParams: [] },
              h = 0,
              l = async () => {
                let s = !1,
                  l = (t) => {
                    (0, r.ox)(
                      t,
                      () => e.signal,
                      () => (s = !0),
                    );
                  },
                  c = (0, r.ZM)(e.options, e.fetchOptions),
                  d = async (t, i, n) => {
                    if (s) return Promise.reject();
                    if (null == i && t.pages.length) return Promise.resolve(t);
                    let a = (() => {
                        let t = {
                          client: e.client,
                          queryKey: e.queryKey,
                          pageParam: i,
                          direction: n ? "backward" : "forward",
                          meta: e.options.meta,
                        };
                        return (l(t), t);
                      })(),
                      o = await c(a),
                      { maxPages: u } = e.options,
                      h = n ? r.ZZ : r.y9;
                    return { pages: h(t.pages, o, u), pageParams: h(t.pageParams, i, u) };
                  };
                if (n && a.length) {
                  let t = "backward" === n,
                    e = { pages: a, pageParams: o },
                    s = (
                      t
                        ? function (t, { pages: e, pageParams: s }) {
                            return e.length > 0
                              ? t.getPreviousPageParam?.(e[0], e, s[0], s)
                              : void 0;
                          }
                        : m
                    )(i, e);
                  u = await d(e, s, t);
                } else {
                  let e = t ?? a.length;
                  do {
                    let t = 0 === h ? (o[0] ?? i.initialPageParam) : m(i, u);
                    if (h > 0 && null == t) break;
                    ((u = await d(u, t)), h++);
                  } while (h < e);
                }
                return u;
              };
            e.options.persister
              ? (e.fetchFn = () =>
                  e.options.persister?.(
                    l,
                    {
                      client: e.client,
                      queryKey: e.queryKey,
                      meta: e.options.meta,
                      signal: e.signal,
                    },
                    s,
                  ))
              : (e.fetchFn = l);
          },
        };
      }
      function m(t, { pages: e, pageParams: s }) {
        let r = e.length - 1;
        return e.length > 0 ? t.getNextPageParam(e[r], e, s[r], s) : void 0;
      }
      var v = class {
        #b;
        #p;
        #h;
        #g;
        #w;
        #R;
        #C;
        #O;
        constructor(t = {}) {
          ((this.#b = t.queryCache || new o()),
            (this.#p = t.mutationCache || new c()),
            (this.#h = t.defaultOptions || {}),
            (this.#g = new Map()),
            (this.#w = new Map()),
            (this.#R = 0));
        }
        mount() {
          (this.#R++,
            1 === this.#R &&
              ((this.#C = f.m.subscribe(async (t) => {
                t && (await this.resumePausedMutations(), this.#b.onFocus());
              })),
              (this.#O = p.t.subscribe(async (t) => {
                t && (await this.resumePausedMutations(), this.#b.onOnline());
              }))));
        }
        unmount() {
          (this.#R--,
            0 === this.#R && (this.#C?.(), (this.#C = void 0), this.#O?.(), (this.#O = void 0)));
        }
        isFetching(t) {
          return this.#b.findAll({ ...t, fetchStatus: "fetching" }).length;
        }
        isMutating(t) {
          return this.#p.findAll({ ...t, status: "pending" }).length;
        }
        getQueryData(t) {
          let e = this.defaultQueryOptions({ queryKey: t });
          return this.#b.get(e.queryHash)?.state.data;
        }
        ensureQueryData(t) {
          let e = this.defaultQueryOptions(t),
            s = this.#b.build(this, e),
            i = s.state.data;
          return void 0 === i
            ? this.fetchQuery(t)
            : (t.revalidateIfStale &&
                s.isStaleByTime((0, r.d2)(e.staleTime, s)) &&
                this.prefetchQuery(e),
              Promise.resolve(i));
        }
        getQueriesData(t) {
          return this.#b.findAll(t).map(({ queryKey: t, state: e }) => [t, e.data]);
        }
        setQueryData(t, e, s) {
          let i = this.defaultQueryOptions({ queryKey: t }),
            n = this.#b.get(i.queryHash),
            a = n?.state.data,
            o = (0, r.Zw)(e, a);
          if (void 0 !== o) return this.#b.build(this, i).setData(o, { ...s, manual: !0 });
        }
        setQueriesData(t, e, s) {
          return n.jG.batch(() =>
            this.#b.findAll(t).map(({ queryKey: t }) => [t, this.setQueryData(t, e, s)]),
          );
        }
        getQueryState(t) {
          let e = this.defaultQueryOptions({ queryKey: t });
          return this.#b.get(e.queryHash)?.state;
        }
        removeQueries(t) {
          let e = this.#b;
          n.jG.batch(() => {
            e.findAll(t).forEach((t) => {
              e.remove(t);
            });
          });
        }
        resetQueries(t, e) {
          let s = this.#b;
          return n.jG.batch(
            () => (
              s.findAll(t).forEach((t) => {
                t.reset();
              }),
              this.refetchQueries({ type: "active", ...t }, e)
            ),
          );
        }
        cancelQueries(t, e = {}) {
          let s = { revert: !0, ...e };
          return Promise.all(n.jG.batch(() => this.#b.findAll(t).map((t) => t.cancel(s))))
            .then(r.lQ)
            .catch(r.lQ);
        }
        invalidateQueries(t, e = {}) {
          return n.jG.batch(() =>
            (this.#b.findAll(t).forEach((t) => {
              t.invalidate();
            }),
            t?.refetchType === "none")
              ? Promise.resolve()
              : this.refetchQueries({ ...t, type: t?.refetchType ?? t?.type ?? "active" }, e),
          );
        }
        refetchQueries(t, e = {}) {
          let s = { ...e, cancelRefetch: e.cancelRefetch ?? !0 };
          return Promise.all(
            n.jG.batch(() =>
              this.#b
                .findAll(t)
                .filter((t) => !t.isDisabled() && !t.isStatic())
                .map((t) => {
                  let e = t.fetch(void 0, s);
                  return (
                    s.throwOnError || (e = e.catch(r.lQ)),
                    "paused" === t.state.fetchStatus ? Promise.resolve() : e
                  );
                }),
            ),
          ).then(r.lQ);
        }
        fetchQuery(t) {
          let e = this.defaultQueryOptions(t);
          void 0 === e.retry && (e.retry = !1);
          let s = this.#b.build(this, e);
          return s.isStaleByTime((0, r.d2)(e.staleTime, s))
            ? s.fetch(e)
            : Promise.resolve(s.state.data);
        }
        prefetchQuery(t) {
          return this.fetchQuery(t).then(r.lQ).catch(r.lQ);
        }
        fetchInfiniteQuery(t) {
          return ((t.behavior = y(t.pages)), this.fetchQuery(t));
        }
        prefetchInfiniteQuery(t) {
          return this.fetchInfiniteQuery(t).then(r.lQ).catch(r.lQ);
        }
        ensureInfiniteQueryData(t) {
          return ((t.behavior = y(t.pages)), this.ensureQueryData(t));
        }
        resumePausedMutations() {
          return p.t.isOnline() ? this.#p.resumePausedMutations() : Promise.resolve();
        }
        getQueryCache() {
          return this.#b;
        }
        getMutationCache() {
          return this.#p;
        }
        getDefaultOptions() {
          return this.#h;
        }
        setDefaultOptions(t) {
          this.#h = t;
        }
        setQueryDefaults(t, e) {
          this.#g.set((0, r.EN)(t), { queryKey: t, defaultOptions: e });
        }
        getQueryDefaults(t) {
          let e = [...this.#g.values()],
            s = {};
          return (
            e.forEach((e) => {
              (0, r.Cp)(t, e.queryKey) && Object.assign(s, e.defaultOptions);
            }),
            s
          );
        }
        setMutationDefaults(t, e) {
          this.#w.set((0, r.EN)(t), { mutationKey: t, defaultOptions: e });
        }
        getMutationDefaults(t) {
          let e = [...this.#w.values()],
            s = {};
          return (
            e.forEach((e) => {
              (0, r.Cp)(t, e.mutationKey) && Object.assign(s, e.defaultOptions);
            }),
            s
          );
        }
        defaultQueryOptions(t) {
          if (t._defaulted) return t;
          let e = {
            ...this.#h.queries,
            ...this.getQueryDefaults(t.queryKey),
            ...t,
            _defaulted: !0,
          };
          return (
            e.queryHash || (e.queryHash = (0, r.F$)(e.queryKey, e)),
            void 0 === e.refetchOnReconnect && (e.refetchOnReconnect = "always" !== e.networkMode),
            void 0 === e.throwOnError && (e.throwOnError = !!e.suspense),
            !e.networkMode && e.persister && (e.networkMode = "offlineFirst"),
            e.queryFn === r.hT && (e.enabled = !1),
            e
          );
        }
        defaultMutationOptions(t) {
          return t?._defaulted
            ? t
            : {
                ...this.#h.mutations,
                ...(t?.mutationKey && this.getMutationDefaults(t.mutationKey)),
                ...t,
                _defaulted: !0,
              };
        }
        clear() {
          (this.#b.clear(), this.#p.clear());
        }
      };
    },
    7506: (t, e, s) => {
      s.d(e, { k: () => n });
      var r = s(7939),
        i = s(5638),
        n = class {
          #S;
          destroy() {
            this.clearGcTimeout();
          }
          scheduleGc() {
            (this.clearGcTimeout(),
              (0, i.gn)(this.gcTime) &&
                (this.#S = r.zs.setTimeout(() => {
                  this.optionalRemove();
                }, this.gcTime)));
          }
          updateGcTime(t) {
            this.gcTime = Math.max(this.gcTime || 0, t ?? (i.S$ ? 1 / 0 : 3e5));
          }
          clearGcTimeout() {
            this.#S && (r.zs.clearTimeout(this.#S), (this.#S = void 0));
          }
        };
    },
    2618: (t, e, s) => {
      s.d(e, { II: () => l, cc: () => h, v_: () => u });
      var r = s(8878),
        i = s(7125),
        n = s(4874),
        a = s(5638);
      function o(t) {
        return Math.min(1e3 * 2 ** t, 3e4);
      }
      function u(t) {
        return (t ?? "online") !== "online" || i.t.isOnline();
      }
      var h = class extends Error {
        constructor(t) {
          (super("CancelledError"), (this.revert = t?.revert), (this.silent = t?.silent));
        }
      };
      function l(t) {
        let e,
          s = !1,
          l = 0,
          c = (0, n.T)(),
          d = () => "pending" !== c.status,
          f = () => r.m.isFocused() && ("always" === t.networkMode || i.t.isOnline()) && t.canRun(),
          p = () => u(t.networkMode) && t.canRun(),
          y = (t) => {
            d() || (e?.(), c.resolve(t));
          },
          m = (t) => {
            d() || (e?.(), c.reject(t));
          },
          v = () =>
            new Promise((s) => {
              ((e = (t) => {
                (d() || f()) && s(t);
              }),
                t.onPause?.());
            }).then(() => {
              ((e = void 0), d() || t.onContinue?.());
            }),
          b = () => {
            let e;
            if (d()) return;
            let r = 0 === l ? t.initialPromise : void 0;
            try {
              e = r ?? t.fn();
            } catch (t) {
              e = Promise.reject(t);
            }
            Promise.resolve(e)
              .then(y)
              .catch((e) => {
                if (d()) return;
                let r = t.retry ?? (a.S$ ? 0 : 3),
                  i = t.retryDelay ?? o,
                  n = "function" == typeof i ? i(l, e) : i,
                  u =
                    !0 === r ||
                    ("number" == typeof r && l < r) ||
                    ("function" == typeof r && r(l, e));
                if (s || !u) {
                  m(e);
                  return;
                }
                (l++,
                  t.onFail?.(l, e),
                  (0, a.yy)(n)
                    .then(() => (f() ? void 0 : v()))
                    .then(() => {
                      s ? m(e) : b();
                    }));
              });
          };
        return {
          promise: c,
          status: () => c.status,
          cancel: (e) => {
            if (!d()) {
              let s = new h(e);
              (m(s), t.onCancel?.(s));
            }
          },
          continue: () => (e?.(), c),
          cancelRetry: () => {
            s = !0;
          },
          continueRetry: () => {
            s = !1;
          },
          canStart: p,
          start: () => (p() ? b() : v().then(b), c),
        };
      }
    },
    5844: (t, e, s) => {
      s.d(e, { Q: () => r });
      var r = class {
        constructor() {
          ((this.listeners = new Set()), (this.subscribe = this.subscribe.bind(this)));
        }
        subscribe(t) {
          return (
            this.listeners.add(t),
            this.onSubscribe(),
            () => {
              (this.listeners.delete(t), this.onUnsubscribe());
            }
          );
        }
        hasListeners() {
          return this.listeners.size > 0;
        }
        onSubscribe() {}
        onUnsubscribe() {}
      };
    },
    4874: (t, e, s) => {
      function r() {
        let t, e;
        let s = new Promise((s, r) => {
          ((t = s), (e = r));
        });
        function r(t) {
          (Object.assign(s, t), delete s.resolve, delete s.reject);
        }
        return (
          (s.status = "pending"),
          s.catch(() => {}),
          (s.resolve = (e) => {
            (r({ status: "fulfilled", value: e }), t(e));
          }),
          (s.reject = (t) => {
            (r({ status: "rejected", reason: t }), e(t));
          }),
          s
        );
      }
      s.d(e, { T: () => r });
    },
    7939: (t, e, s) => {
      s.d(e, { Zq: () => n, zs: () => i });
      var r = {
          setTimeout: (t, e) => setTimeout(t, e),
          clearTimeout: (t) => clearTimeout(t),
          setInterval: (t, e) => setInterval(t, e),
          clearInterval: (t) => clearInterval(t),
        },
        i = new (class {
          #Q = r;
          #E = !1;
          setTimeoutProvider(t) {
            this.#Q = t;
          }
          setTimeout(t, e) {
            return this.#Q.setTimeout(t, e);
          }
          clearTimeout(t) {
            this.#Q.clearTimeout(t);
          }
          setInterval(t, e) {
            return this.#Q.setInterval(t, e);
          }
          clearInterval(t) {
            this.#Q.clearInterval(t);
          }
        })();
      function n(t) {
        setTimeout(t, 0);
      }
    },
    5638: (t, e, s) => {
      s.d(e, {
        Cp: () => y,
        EN: () => p,
        Eh: () => l,
        F$: () => f,
        GU: () => q,
        MK: () => c,
        S$: () => i,
        ZM: () => E,
        ZZ: () => S,
        Zw: () => a,
        d2: () => h,
        f8: () => v,
        gn: () => o,
        hT: () => Q,
        j3: () => u,
        lQ: () => n,
        nJ: () => d,
        ox: () => T,
        pl: () => C,
        y9: () => O,
        yy: () => R,
      });
      var r = s(7939),
        i = "undefined" == typeof window || "Deno" in globalThis;
      function n() {}
      function a(t, e) {
        return "function" == typeof t ? t(e) : t;
      }
      function o(t) {
        return "number" == typeof t && t >= 0 && t !== 1 / 0;
      }
      function u(t, e) {
        return Math.max(t + (e || 0) - Date.now(), 0);
      }
      function h(t, e) {
        return "function" == typeof t ? t(e) : t;
      }
      function l(t, e) {
        return "function" == typeof t ? t(e) : t;
      }
      function c(t, e) {
        let { type: s = "all", exact: r, fetchStatus: i, predicate: n, queryKey: a, stale: o } = t;
        if (a) {
          if (r) {
            if (e.queryHash !== f(a, e.options)) return !1;
          } else if (!y(e.queryKey, a)) return !1;
        }
        if ("all" !== s) {
          let t = e.isActive();
          if (("active" === s && !t) || ("inactive" === s && t)) return !1;
        }
        return (
          ("boolean" != typeof o || e.isStale() === o) &&
          (!i || i === e.state.fetchStatus) &&
          (!n || !!n(e))
        );
      }
      function d(t, e) {
        let { exact: s, status: r, predicate: i, mutationKey: n } = t;
        if (n) {
          if (!e.options.mutationKey) return !1;
          if (s) {
            if (p(e.options.mutationKey) !== p(n)) return !1;
          } else if (!y(e.options.mutationKey, n)) return !1;
        }
        return (!r || e.state.status === r) && (!i || !!i(e));
      }
      function f(t, e) {
        return (e?.queryKeyHashFn || p)(t);
      }
      function p(t) {
        return JSON.stringify(t, (t, e) =>
          g(e)
            ? Object.keys(e)
                .sort()
                .reduce((t, s) => ((t[s] = e[s]), t), {})
            : e,
        );
      }
      function y(t, e) {
        return (
          t === e ||
          (typeof t == typeof e &&
            !!t &&
            !!e &&
            "object" == typeof t &&
            "object" == typeof e &&
            Object.keys(e).every((s) => y(t[s], e[s])))
        );
      }
      var m = Object.prototype.hasOwnProperty;
      function v(t, e) {
        if (!e || Object.keys(t).length !== Object.keys(e).length) return !1;
        for (let s in t) if (t[s] !== e[s]) return !1;
        return !0;
      }
      function b(t) {
        return Array.isArray(t) && t.length === Object.keys(t).length;
      }
      function g(t) {
        if (!w(t)) return !1;
        let e = t.constructor;
        if (void 0 === e) return !0;
        let s = e.prototype;
        return (
          !!(w(s) && s.hasOwnProperty("isPrototypeOf")) &&
          Object.getPrototypeOf(t) === Object.prototype
        );
      }
      function w(t) {
        return "[object Object]" === Object.prototype.toString.call(t);
      }
      function R(t) {
        return new Promise((e) => {
          r.zs.setTimeout(e, t);
        });
      }
      function C(t, e, s) {
        return "function" == typeof s.structuralSharing
          ? s.structuralSharing(t, e)
          : !1 !== s.structuralSharing
            ? (function t(e, s, r = 0) {
                if (e === s) return e;
                if (r > 500) return s;
                let i = b(e) && b(s);
                if (!i && !(g(e) && g(s))) return s;
                let n = (i ? e : Object.keys(e)).length,
                  a = i ? s : Object.keys(s),
                  o = a.length,
                  u = i ? Array(o) : {},
                  h = 0;
                for (let l = 0; l < o; l++) {
                  let o = i ? l : a[l],
                    c = e[o],
                    d = s[o];
                  if (c === d) {
                    ((u[o] = c), (i ? l < n : m.call(e, o)) && h++);
                    continue;
                  }
                  if (null === c || null === d || "object" != typeof c || "object" != typeof d) {
                    u[o] = d;
                    continue;
                  }
                  let f = t(c, d, r + 1);
                  ((u[o] = f), f === c && h++);
                }
                return n === o && h === n ? e : u;
              })(t, e)
            : e;
      }
      function O(t, e, s = 0) {
        let r = [...t, e];
        return s && r.length > s ? r.slice(1) : r;
      }
      function S(t, e, s = 0) {
        let r = [e, ...t];
        return s && r.length > s ? r.slice(0, -1) : r;
      }
      var Q = Symbol();
      function E(t, e) {
        return !t.queryFn && e?.initialPromise
          ? () => e.initialPromise
          : t.queryFn && t.queryFn !== Q
            ? t.queryFn
            : () => Promise.reject(Error(`Missing queryFn: '${t.queryHash}'`));
      }
      function q(t, e) {
        return "function" == typeof t ? t(...e) : !!t;
      }
      function T(t, e, s) {
        let r,
          i = !1;
        return (
          Object.defineProperty(t, "signal", {
            enumerable: !0,
            get: () => (
              (r ??= e()),
              i || ((i = !0), r.aborted ? s() : r.addEventListener("abort", s, { once: !0 })),
              r
            ),
          }),
          t
        );
      }
    },
    5549: (t, e, s) => {
      s.d(e, { Ht: () => o, jE: () => a });
      var r = s(2115),
        i = s(5155),
        n = r.createContext(void 0),
        a = (t) => {
          let e = r.useContext(n);
          if (t) return t;
          if (!e) throw Error("No QueryClient set, use QueryClientProvider to set one");
          return e;
        },
        o = (t) => {
          let { client: e, children: s } = t;
          return (
            r.useEffect(
              () => (
                e.mount(),
                () => {
                  e.unmount();
                }
              ),
              [e],
            ),
            (0, i.jsx)(n.Provider, { value: e, children: s })
          );
        };
    },
    4889: (t, e, s) => {
      s.d(e, { I: () => T });
      var r = s(8878),
        i = s(5563),
        n = s(9511),
        a = s(5844),
        o = s(4874),
        u = s(5638),
        h = s(7939),
        l = class extends a.Q {
          constructor(t, e) {
            (super(),
              (this.options = e),
              (this.#o = t),
              (this.#q = null),
              (this.#T = (0, o.T)()),
              this.bindMethods(),
              this.setOptions(e));
          }
          #o;
          #j = void 0;
          #P = void 0;
          #I = void 0;
          #A;
          #F;
          #T;
          #q;
          #x;
          #D;
          #k;
          #M;
          #U;
          #G;
          #$ = new Set();
          bindMethods() {
            this.refetch = this.refetch.bind(this);
          }
          onSubscribe() {
            1 === this.listeners.size &&
              (this.#j.addObserver(this),
              c(this.#j, this.options) ? this.#L() : this.updateResult(),
              this.#H());
          }
          onUnsubscribe() {
            this.hasListeners() || this.destroy();
          }
          shouldFetchOnReconnect() {
            return d(this.#j, this.options, this.options.refetchOnReconnect);
          }
          shouldFetchOnWindowFocus() {
            return d(this.#j, this.options, this.options.refetchOnWindowFocus);
          }
          destroy() {
            ((this.listeners = new Set()), this.#K(), this.#N(), this.#j.removeObserver(this));
          }
          setOptions(t) {
            let e = this.options,
              s = this.#j;
            if (
              ((this.options = this.#o.defaultQueryOptions(t)),
              void 0 !== this.options.enabled &&
                "boolean" != typeof this.options.enabled &&
                "function" != typeof this.options.enabled &&
                "boolean" != typeof (0, u.Eh)(this.options.enabled, this.#j))
            )
              throw Error("Expected enabled to be a boolean or a callback that returns a boolean");
            (this.#_(),
              this.#j.setOptions(this.options),
              e._defaulted &&
                !(0, u.f8)(this.options, e) &&
                this.#o
                  .getQueryCache()
                  .notify({ type: "observerOptionsUpdated", query: this.#j, observer: this }));
            let r = this.hasListeners();
            (r && f(this.#j, s, this.options, e) && this.#L(),
              this.updateResult(),
              r &&
                (this.#j !== s ||
                  (0, u.Eh)(this.options.enabled, this.#j) !== (0, u.Eh)(e.enabled, this.#j) ||
                  (0, u.d2)(this.options.staleTime, this.#j) !== (0, u.d2)(e.staleTime, this.#j)) &&
                this.#z());
            let i = this.#W();
            r &&
              (this.#j !== s ||
                (0, u.Eh)(this.options.enabled, this.#j) !== (0, u.Eh)(e.enabled, this.#j) ||
                i !== this.#G) &&
              this.#Z(i);
          }
          getOptimisticResult(t) {
            let e = this.#o.getQueryCache().build(this.#o, t),
              s = this.createResult(e, t);
            return (
              (0, u.f8)(this.getCurrentResult(), s) ||
                ((this.#I = s), (this.#F = this.options), (this.#A = this.#j.state)),
              s
            );
          }
          getCurrentResult() {
            return this.#I;
          }
          trackResult(t, e) {
            return new Proxy(t, {
              get: (t, s) => (
                this.trackProp(s),
                e?.(s),
                "promise" !== s ||
                  (this.trackProp("data"),
                  this.options.experimental_prefetchInRender ||
                    "pending" !== this.#T.status ||
                    this.#T.reject(
                      Error("experimental_prefetchInRender feature flag is not enabled"),
                    )),
                Reflect.get(t, s)
              ),
            });
          }
          trackProp(t) {
            this.#$.add(t);
          }
          getCurrentQuery() {
            return this.#j;
          }
          refetch({ ...t } = {}) {
            return this.fetch({ ...t });
          }
          fetchOptimistic(t) {
            let e = this.#o.defaultQueryOptions(t),
              s = this.#o.getQueryCache().build(this.#o, e);
            return s.fetch().then(() => this.createResult(s, e));
          }
          fetch(t) {
            return this.#L({ ...t, cancelRefetch: t.cancelRefetch ?? !0 }).then(
              () => (this.updateResult(), this.#I),
            );
          }
          #L(t) {
            this.#_();
            let e = this.#j.fetch(this.options, t);
            return (t?.throwOnError || (e = e.catch(u.lQ)), e);
          }
          #z() {
            this.#K();
            let t = (0, u.d2)(this.options.staleTime, this.#j);
            if (u.S$ || this.#I.isStale || !(0, u.gn)(t)) return;
            let e = (0, u.j3)(this.#I.dataUpdatedAt, t);
            this.#M = h.zs.setTimeout(() => {
              this.#I.isStale || this.updateResult();
            }, e + 1);
          }
          #W() {
            return (
              ("function" == typeof this.options.refetchInterval
                ? this.options.refetchInterval(this.#j)
                : this.options.refetchInterval) ?? !1
            );
          }
          #Z(t) {
            (this.#N(),
              (this.#G = t),
              !u.S$ &&
                !1 !== (0, u.Eh)(this.options.enabled, this.#j) &&
                (0, u.gn)(this.#G) &&
                0 !== this.#G &&
                (this.#U = h.zs.setInterval(() => {
                  (this.options.refetchIntervalInBackground || r.m.isFocused()) && this.#L();
                }, this.#G)));
          }
          #H() {
            (this.#z(), this.#Z(this.#W()));
          }
          #K() {
            this.#M && (h.zs.clearTimeout(this.#M), (this.#M = void 0));
          }
          #N() {
            this.#U && (h.zs.clearInterval(this.#U), (this.#U = void 0));
          }
          createResult(t, e) {
            let s;
            let r = this.#j,
              i = this.options,
              a = this.#I,
              h = this.#A,
              l = this.#F,
              d = t !== r ? t.state : this.#P,
              { state: y } = t,
              m = { ...y },
              v = !1;
            if (e._optimisticResults) {
              let s = this.hasListeners(),
                a = !s && c(t, e),
                o = s && f(t, r, e, i);
              ((a || o) && (m = { ...m, ...(0, n.k)(y.data, t.options) }),
                "isRestoring" === e._optimisticResults && (m.fetchStatus = "idle"));
            }
            let { error: b, errorUpdatedAt: g, status: w } = m;
            s = m.data;
            let R = !1;
            if (void 0 !== e.placeholderData && void 0 === s && "pending" === w) {
              let t;
              (a?.isPlaceholderData && e.placeholderData === l?.placeholderData
                ? ((t = a.data), (R = !0))
                : (t =
                    "function" == typeof e.placeholderData
                      ? e.placeholderData(this.#k?.state.data, this.#k)
                      : e.placeholderData),
                void 0 !== t && ((w = "success"), (s = (0, u.pl)(a?.data, t, e)), (v = !0)));
            }
            if (e.select && void 0 !== s && !R) {
              if (a && s === h?.data && e.select === this.#x) s = this.#D;
              else
                try {
                  ((this.#x = e.select),
                    (s = e.select(s)),
                    (s = (0, u.pl)(a?.data, s, e)),
                    (this.#D = s),
                    (this.#q = null));
                } catch (t) {
                  this.#q = t;
                }
            }
            this.#q && ((b = this.#q), (s = this.#D), (g = Date.now()), (w = "error"));
            let C = "fetching" === m.fetchStatus,
              O = "pending" === w,
              S = "error" === w,
              Q = O && C,
              E = void 0 !== s,
              q = {
                status: w,
                fetchStatus: m.fetchStatus,
                isPending: O,
                isSuccess: "success" === w,
                isError: S,
                isInitialLoading: Q,
                isLoading: Q,
                data: s,
                dataUpdatedAt: m.dataUpdatedAt,
                error: b,
                errorUpdatedAt: g,
                failureCount: m.fetchFailureCount,
                failureReason: m.fetchFailureReason,
                errorUpdateCount: m.errorUpdateCount,
                isFetched: m.dataUpdateCount > 0 || m.errorUpdateCount > 0,
                isFetchedAfterMount:
                  m.dataUpdateCount > d.dataUpdateCount || m.errorUpdateCount > d.errorUpdateCount,
                isFetching: C,
                isRefetching: C && !O,
                isLoadingError: S && !E,
                isPaused: "paused" === m.fetchStatus,
                isPlaceholderData: v,
                isRefetchError: S && E,
                isStale: p(t, e),
                refetch: this.refetch,
                promise: this.#T,
                isEnabled: !1 !== (0, u.Eh)(e.enabled, t),
              };
            if (this.options.experimental_prefetchInRender) {
              let e = void 0 !== q.data,
                s = "error" === q.status && !e,
                i = (t) => {
                  s ? t.reject(q.error) : e && t.resolve(q.data);
                },
                n = () => {
                  i((this.#T = q.promise = (0, o.T)()));
                },
                a = this.#T;
              switch (a.status) {
                case "pending":
                  t.queryHash === r.queryHash && i(a);
                  break;
                case "fulfilled":
                  (s || q.data !== a.value) && n();
                  break;
                case "rejected":
                  (s && q.error === a.reason) || n();
              }
            }
            return q;
          }
          updateResult() {
            let t = this.#I,
              e = this.createResult(this.#j, this.options);
            ((this.#A = this.#j.state),
              (this.#F = this.options),
              void 0 !== this.#A.data && (this.#k = this.#j),
              (0, u.f8)(e, t) ||
                ((this.#I = e),
                this.#B({
                  listeners: (() => {
                    if (!t) return !0;
                    let { notifyOnChangeProps: e } = this.options,
                      s = "function" == typeof e ? e() : e;
                    if ("all" === s || (!s && !this.#$.size)) return !0;
                    let r = new Set(s ?? this.#$);
                    return (
                      this.options.throwOnError && r.add("error"),
                      Object.keys(this.#I).some((e) => this.#I[e] !== t[e] && r.has(e))
                    );
                  })(),
                })));
          }
          #_() {
            let t = this.#o.getQueryCache().build(this.#o, this.options);
            if (t === this.#j) return;
            let e = this.#j;
            ((this.#j = t),
              (this.#P = t.state),
              this.hasListeners() && (e?.removeObserver(this), t.addObserver(this)));
          }
          onQueryUpdate() {
            (this.updateResult(), this.hasListeners() && this.#H());
          }
          #B(t) {
            i.jG.batch(() => {
              (t.listeners &&
                this.listeners.forEach((t) => {
                  t(this.#I);
                }),
                this.#o.getQueryCache().notify({ query: this.#j, type: "observerResultsUpdated" }));
            });
          }
        };
      function c(t, e) {
        return (
          (!1 !== (0, u.Eh)(e.enabled, t) &&
            void 0 === t.state.data &&
            !("error" === t.state.status && !1 === e.retryOnMount)) ||
          (void 0 !== t.state.data && d(t, e, e.refetchOnMount))
        );
      }
      function d(t, e, s) {
        if (!1 !== (0, u.Eh)(e.enabled, t) && "static" !== (0, u.d2)(e.staleTime, t)) {
          let r = "function" == typeof s ? s(t) : s;
          return "always" === r || (!1 !== r && p(t, e));
        }
        return !1;
      }
      function f(t, e, s, r) {
        return (
          (t !== e || !1 === (0, u.Eh)(r.enabled, t)) &&
          (!s.suspense || "error" !== t.state.status) &&
          p(t, s)
        );
      }
      function p(t, e) {
        return !1 !== (0, u.Eh)(e.enabled, t) && t.isStaleByTime((0, u.d2)(e.staleTime, t));
      }
      var y = s(2115),
        m = s(5549);
      s(5155);
      var v = y.createContext(
          (function () {
            let t = !1;
            return {
              clearReset: () => {
                t = !1;
              },
              reset: () => {
                t = !0;
              },
              isReset: () => t,
            };
          })(),
        ),
        b = () => y.useContext(v),
        g = (t, e, s) => {
          let r =
            (null == s ? void 0 : s.state.error) && "function" == typeof t.throwOnError
              ? (0, u.GU)(t.throwOnError, [s.state.error, s])
              : t.throwOnError;
          (t.suspense || t.experimental_prefetchInRender || r) &&
            !e.isReset() &&
            (t.retryOnMount = !1);
        },
        w = (t) => {
          y.useEffect(() => {
            t.clearReset();
          }, [t]);
        },
        R = (t) => {
          let { result: e, errorResetBoundary: s, throwOnError: r, query: i, suspense: n } = t;
          return (
            e.isError &&
            !s.isReset() &&
            !e.isFetching &&
            i &&
            ((n && void 0 === e.data) || (0, u.GU)(r, [e.error, i]))
          );
        },
        C = y.createContext(!1),
        O = () => y.useContext(C);
      C.Provider;
      var S = (t) => {
          if (t.suspense) {
            let e = (t) => ("static" === t ? t : Math.max(t ?? 1e3, 1e3)),
              s = t.staleTime;
            ((t.staleTime = "function" == typeof s ? (...t) => e(s(...t)) : e(s)),
              "number" == typeof t.gcTime && (t.gcTime = Math.max(t.gcTime, 1e3)));
          }
        },
        Q = (t, e) => t.isLoading && t.isFetching && !e,
        E = (t, e) => t?.suspense && e.isPending,
        q = (t, e, s) =>
          e.fetchOptimistic(t).catch(() => {
            s.clearReset();
          });
      function T(t, e) {
        return (function (t, e, s) {
          var r, n, a, o;
          let h = O(),
            l = b(),
            c = (0, m.jE)(s),
            d = c.defaultQueryOptions(t);
          null === (n = c.getDefaultOptions().queries) ||
            void 0 === n ||
            null === (r = n._experimental_beforeQuery) ||
            void 0 === r ||
            r.call(n, d);
          let f = c.getQueryCache().get(d.queryHash);
          ((d._optimisticResults = h ? "isRestoring" : "optimistic"), S(d), g(d, l, f), w(l));
          let p = !c.getQueryCache().get(d.queryHash),
            [v] = y.useState(() => new e(c, d)),
            C = v.getOptimisticResult(d),
            T = !h && !1 !== t.subscribed;
          if (
            (y.useSyncExternalStore(
              y.useCallback(
                (t) => {
                  let e = T ? v.subscribe(i.jG.batchCalls(t)) : u.lQ;
                  return (v.updateResult(), e);
                },
                [v, T],
              ),
              () => v.getCurrentResult(),
              () => v.getCurrentResult(),
            ),
            y.useEffect(() => {
              v.setOptions(d);
            }, [d, v]),
            E(d, C))
          )
            throw q(d, v, l);
          if (
            R({
              result: C,
              errorResetBoundary: l,
              throwOnError: d.throwOnError,
              query: f,
              suspense: d.suspense,
            })
          )
            throw C.error;
          if (
            (null === (o = c.getDefaultOptions().queries) ||
              void 0 === o ||
              null === (a = o._experimental_afterQuery) ||
              void 0 === a ||
              a.call(o, d, C),
            d.experimental_prefetchInRender && !u.S$ && Q(C, h))
          ) {
            let t = p ? q(d, v, l) : null == f ? void 0 : f.promise;
            null == t ||
              t.catch(u.lQ).finally(() => {
                v.updateResult();
              });
          }
          return d.notifyOnChangeProps ? C : v.trackResult(C);
        })(t, l, e);
      }
    },
    419: (t, e, s) => {
      s.d(e, { Ay: () => a });
      var r = s(2818);
      let i = /\{[^{}]+\}/g,
        n = () =>
          "object" == typeof r &&
          Number.parseInt(r?.versions?.node?.substring(0, 2)) >= 18 &&
          r.versions.undici;
      function a(t) {
        let {
          baseUrl: e = "",
          Request: s = globalThis.Request,
          fetch: r = globalThis.fetch,
          querySerializer: i,
          bodySerializer: a,
          pathSerializer: o,
          headers: u,
          requestInitExt: h,
          ...y
        } = { ...t };
        ((h = n() ? h : void 0), (e = p(e)));
        let m = [];
        async function v(t, n) {
          var v;
          let b, g, w, R, C;
          let {
              baseUrl: O,
              fetch: S = r,
              Request: Q = s,
              headers: E,
              params: q = {},
              parseAs: T = "json",
              querySerializer: j,
              bodySerializer: P = a ?? d,
              pathSerializer: I,
              body: A,
              middleware: F = [],
              ...x
            } = n || {},
            D = e;
          O && (D = p(O) ?? e);
          let k = "function" == typeof i ? i : l(i);
          j && (k = "function" == typeof j ? j : l({ ...("object" == typeof i ? i : {}), ...j }));
          let M = I || o || c,
            U = void 0 === A ? void 0 : P(A, f(u, E, q.header)),
            G = f(
              void 0 === U || U instanceof FormData ? {} : { "Content-Type": "application/json" },
              u,
              E,
              q.header,
            ),
            $ = [...m, ...F],
            L = { redirect: "follow", ...y, ...x, body: U, headers: G },
            H = new Q(
              ((v = { baseUrl: D, params: q, querySerializer: k, pathSerializer: M }),
              (R = `${v.baseUrl}${t}`),
              v.params?.path && (R = v.pathSerializer(R, v.params.path)),
              (C = v.querySerializer(v.params.query ?? {})).startsWith("?") && (C = C.substring(1)),
              C && (R += `?${C}`),
              R),
              L,
            );
          for (let t in x) t in H || (H[t] = x[t]);
          if ($.length) {
            for (let e of ((b = Math.random().toString(36).slice(2, 11)),
            (g = Object.freeze({
              baseUrl: D,
              fetch: S,
              parseAs: T,
              querySerializer: k,
              bodySerializer: P,
              pathSerializer: M,
            })),
            $))
              if (e && "object" == typeof e && "function" == typeof e.onRequest) {
                let s = await e.onRequest({
                  request: H,
                  schemaPath: t,
                  params: q,
                  options: g,
                  id: b,
                });
                if (s) {
                  if (s instanceof Q) H = s;
                  else if (s instanceof Response) {
                    w = s;
                    break;
                  } else
                    throw Error(
                      "onRequest: must return new Request() or Response() when modifying the request",
                    );
                }
              }
          }
          if (!w) {
            try {
              w = await S(H, h);
            } catch (s) {
              let e = s;
              if ($.length)
                for (let s = $.length - 1; s >= 0; s--) {
                  let r = $[s];
                  if (r && "object" == typeof r && "function" == typeof r.onError) {
                    let s = await r.onError({
                      request: H,
                      error: e,
                      schemaPath: t,
                      params: q,
                      options: g,
                      id: b,
                    });
                    if (s) {
                      if (s instanceof Response) {
                        ((e = void 0), (w = s));
                        break;
                      }
                      if (s instanceof Error) {
                        e = s;
                        continue;
                      }
                      throw Error("onError: must return new Response() or instance of Error");
                    }
                  }
                }
              if (e) throw e;
            }
            if ($.length)
              for (let e = $.length - 1; e >= 0; e--) {
                let s = $[e];
                if (s && "object" == typeof s && "function" == typeof s.onResponse) {
                  let e = await s.onResponse({
                    request: H,
                    response: w,
                    schemaPath: t,
                    params: q,
                    options: g,
                    id: b,
                  });
                  if (e) {
                    if (!(e instanceof Response))
                      throw Error(
                        "onResponse: must return new Response() when modifying the response",
                      );
                    w = e;
                  }
                }
              }
          }
          let K = w.headers.get("Content-Length");
          if (
            204 === w.status ||
            "HEAD" === H.method ||
            ("0" === K && !w.headers.get("Transfer-Encoding")?.includes("chunked"))
          )
            return w.ok ? { data: void 0, response: w } : { error: void 0, response: w };
          if (w.ok) {
            let t = async () => {
              if ("stream" === T) return w.body;
              if ("json" === T && !K) {
                let t = await w.text();
                return t ? JSON.parse(t) : void 0;
              }
              return await w[T]();
            };
            return { data: await t(), response: w };
          }
          let N = await w.text();
          try {
            N = JSON.parse(N);
          } catch {}
          return { error: N, response: w };
        }
        return {
          request: (t, e, s) => v(e, { ...s, method: t.toUpperCase() }),
          GET: (t, e) => v(t, { ...e, method: "GET" }),
          PUT: (t, e) => v(t, { ...e, method: "PUT" }),
          POST: (t, e) => v(t, { ...e, method: "POST" }),
          DELETE: (t, e) => v(t, { ...e, method: "DELETE" }),
          OPTIONS: (t, e) => v(t, { ...e, method: "OPTIONS" }),
          HEAD: (t, e) => v(t, { ...e, method: "HEAD" }),
          PATCH: (t, e) => v(t, { ...e, method: "PATCH" }),
          TRACE: (t, e) => v(t, { ...e, method: "TRACE" }),
          use(...t) {
            for (let e of t)
              if (e) {
                if (
                  "object" != typeof e ||
                  !("onRequest" in e || "onResponse" in e || "onError" in e)
                )
                  throw Error(
                    "Middleware must be an object with one of `onRequest()`, `onResponse() or `onError()`",
                  );
                m.push(e);
              }
          },
          eject(...t) {
            for (let e of t) {
              let t = m.indexOf(e);
              -1 !== t && m.splice(t, 1);
            }
          },
        };
      }
      function o(t, e, s) {
        if (null == e) return "";
        if ("object" == typeof e)
          throw Error(
            "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.",
          );
        return `${t}=${s?.allowReserved === !0 ? e : encodeURIComponent(e)}`;
      }
      function u(t, e, s) {
        if (!e || "object" != typeof e) return "";
        let r = [],
          i = { simple: ",", label: ".", matrix: ";" }[s.style] || "&";
        if ("deepObject" !== s.style && !1 === s.explode) {
          for (let t in e) r.push(t, !0 === s.allowReserved ? e[t] : encodeURIComponent(e[t]));
          let i = r.join(",");
          switch (s.style) {
            case "form":
              return `${t}=${i}`;
            case "label":
              return `.${i}`;
            case "matrix":
              return `;${t}=${i}`;
            default:
              return i;
          }
        }
        for (let i in e) {
          let n = "deepObject" === s.style ? `${t}[${i}]` : i;
          r.push(o(n, e[i], s));
        }
        let n = r.join(i);
        return "label" === s.style || "matrix" === s.style ? `${i}${n}` : n;
      }
      function h(t, e, s) {
        if (!Array.isArray(e)) return "";
        if (!1 === s.explode) {
          let r = { form: ",", spaceDelimited: "%20", pipeDelimited: "|" }[s.style] || ",",
            i = (!0 === s.allowReserved ? e : e.map((t) => encodeURIComponent(t))).join(r);
          switch (s.style) {
            case "simple":
              return i;
            case "label":
              return `.${i}`;
            case "matrix":
              return `;${t}=${i}`;
            default:
              return `${t}=${i}`;
          }
        }
        let r = { simple: ",", label: ".", matrix: ";" }[s.style] || "&",
          i = [];
        for (let r of e)
          "simple" === s.style || "label" === s.style
            ? i.push(!0 === s.allowReserved ? r : encodeURIComponent(r))
            : i.push(o(t, r, s));
        return "label" === s.style || "matrix" === s.style ? `${r}${i.join(r)}` : i.join(r);
      }
      function l(t) {
        return function (e) {
          let s = [];
          if (e && "object" == typeof e)
            for (let r in e) {
              let i = e[r];
              if (null != i) {
                if (Array.isArray(i)) {
                  if (0 === i.length) continue;
                  s.push(
                    h(r, i, {
                      style: "form",
                      explode: !0,
                      ...t?.array,
                      allowReserved: t?.allowReserved || !1,
                    }),
                  );
                  continue;
                }
                if ("object" == typeof i) {
                  s.push(
                    u(r, i, {
                      style: "deepObject",
                      explode: !0,
                      ...t?.object,
                      allowReserved: t?.allowReserved || !1,
                    }),
                  );
                  continue;
                }
                s.push(o(r, i, t));
              }
            }
          return s.join("&");
        };
      }
      function c(t, e) {
        let s = t;
        for (let r of t.match(i) ?? []) {
          let t = r.substring(1, r.length - 1),
            i = !1,
            n = "simple";
          if (
            (t.endsWith("*") && ((i = !0), (t = t.substring(0, t.length - 1))),
            t.startsWith(".")
              ? ((n = "label"), (t = t.substring(1)))
              : t.startsWith(";") && ((n = "matrix"), (t = t.substring(1))),
            !e || void 0 === e[t] || null === e[t])
          )
            continue;
          let a = e[t];
          if (Array.isArray(a)) {
            s = s.replace(r, h(t, a, { style: n, explode: i }));
            continue;
          }
          if ("object" == typeof a) {
            s = s.replace(r, u(t, a, { style: n, explode: i }));
            continue;
          }
          if ("matrix" === n) {
            s = s.replace(r, `;${o(t, a)}`);
            continue;
          }
          s = s.replace(r, "label" === n ? `.${encodeURIComponent(a)}` : encodeURIComponent(a));
        }
        return s;
      }
      function d(t, e) {
        return t instanceof FormData
          ? t
          : e &&
              "application/x-www-form-urlencoded" ===
                (e.get instanceof Function
                  ? (e.get("Content-Type") ?? e.get("content-type"))
                  : (e["Content-Type"] ?? e["content-type"]))
            ? new URLSearchParams(t).toString()
            : JSON.stringify(t);
      }
      function f(...t) {
        let e = new Headers();
        for (let s of t)
          if (s && "object" == typeof s)
            for (let [t, r] of s instanceof Headers ? s.entries() : Object.entries(s))
              if (null === r) e.delete(t);
              else if (Array.isArray(r)) for (let s of r) e.append(t, s);
              else void 0 !== r && e.set(t, r);
        return e;
      }
      function p(t) {
        return t.endsWith("/") ? t.substring(0, t.length - 1) : t;
      }
    },
  },
]);
