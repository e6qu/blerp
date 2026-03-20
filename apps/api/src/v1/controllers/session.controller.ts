import { Request, Response } from "express";
import { sessionStore, SessionData } from "../../lib/session";
import { UnauthorizedError, NotFoundError } from "../../lib/errors";
import { redis, isRedisAvailable } from "../../lib/redis";

function mapSession(s: SessionData) {
  return {
    id: s.id,
    user_id: s.userId,
    organization_id: s.organizationId,
    status: "active" as const,
    ip_address: s.ipAddress,
    user_agent: s.userAgent,
    latest_activity: s.lastActiveAt ? new Date(s.lastActiveAt).toISOString() : undefined,
    created_at: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
  };
}

export async function listSessions(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError();
  }

  const sessions = await sessionStore.listForUser(userId);
  res.json({ data: sessions.map(mapSession) });
}

export async function revokeSession(req: Request, res: Response) {
  const sessionId = (req.params.session_id || req.params.id) as string;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  const session = await sessionStore.get(sessionId);
  if (!session || session.userId !== userId) {
    throw new NotFoundError("Session");
  }

  await sessionStore.revoke(sessionId);
  res.status(204).send();
}

export async function revokeAllSessions(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError();
  }

  const currentSessionId = req.headers["x-session-id"] as string | undefined;

  if (!isRedisAvailable()) {
    res.json({ revoked_count: 0 });
    return;
  }

  const sessionIds = await redis.smembers(`user_sessions:${userId}`);
  let revokedCount = 0;
  for (const sessionId of sessionIds) {
    if (sessionId === currentSessionId) continue;
    await sessionStore.revoke(sessionId);
    revokedCount++;
  }

  res.json({ revoked_count: revokedCount });
}
