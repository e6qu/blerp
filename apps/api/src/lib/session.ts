import { redis, cache } from "./redis";
import { nanoid } from "nanoid";

export interface SessionData {
  id: string;
  userId: string;
  organizationId?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: number;
  lastActiveAt: number;
}

const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

export const sessionStore = {
  create: async (
    userId: string,
    metadata: { userAgent?: string; ipAddress?: string; organizationId?: string },
  ) => {
    const sessionId = `sess_${nanoid()}`;
    const session: SessionData = {
      id: sessionId,
      userId,
      organizationId: metadata.organizationId,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    await cache.set(`session:${sessionId}`, session, SESSION_TTL);
    // Also track user sessions
    await redis.sadd(`user_sessions:${userId}`, sessionId);

    return session;
  },

  get: async (sessionId: string): Promise<SessionData | null> => {
    return cache.get<SessionData>(`session:${sessionId}`);
  },

  updateActivity: async (sessionId: string) => {
    const session = await cache.get<SessionData>(`session:${sessionId}`);
    if (session) {
      session.lastActiveAt = Date.now();
      await cache.set(`session:${sessionId}`, session, SESSION_TTL);
    }
  },

  revoke: async (sessionId: string) => {
    const session = await cache.get<SessionData>(`session:${sessionId}`);
    if (session) {
      await cache.del(`session:${sessionId}`);
      await redis.srem(`user_sessions:${session.userId}`, sessionId);
    }
  },

  listForUser: async (userId: string): Promise<SessionData[]> => {
    const sessionIds = await redis.smembers(`user_sessions:${userId}`);
    const sessions = await Promise.all(
      sessionIds.map((id) => cache.get<SessionData>(`session:${id}`)),
    );
    return sessions.filter((s): s is SessionData => s !== null);
  },
};

export const cookies = {
  session: {
    name: "__blerp_session",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: SESSION_TTL * 1000,
      path: "/",
    },
  },
};
