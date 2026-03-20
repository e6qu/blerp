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
}
