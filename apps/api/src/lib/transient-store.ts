export class TransientStore<T> {
  private store = new Map<string, { data: T; expiresAt: number }>();

  constructor(private defaultTtlMs: number) {}

  set(key: string, data: T, ttlMs?: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * BUG-134 (codex r27): atomic check-and-consume. Returns the entry
   * and removes it in one step, so two concurrent callers can't both
   * see the same entry — exactly one of them gets a non-undefined
   * value, and the other gets undefined.
   *
   * Node's event loop guarantees this is race-free in-process because
   * Map.get + Map.delete here run synchronously between any awaits.
   * Across processes (Redis swap-in later) this would map to a single
   * `GETDEL` / `EVAL`.
   */
  pop(key: string): T | undefined {
    const value = this.get(key);
    if (value !== undefined) this.store.delete(key);
    return value;
  }
}
