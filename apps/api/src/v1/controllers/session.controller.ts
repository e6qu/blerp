import { Request, Response } from "express";
import { sessionStore } from "../../lib/session";

export async function listSessions(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const sessions = await sessionStore.listForUser(userId);
    res.json({ data: sessions });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function revokeSession(req: Request, res: Response) {
  const sessionId = (req.params.session_id || req.params.id) as string;
  const userId = req.user?.id;

  try {
    const session = await sessionStore.get(sessionId);
    if (!session || session.userId !== userId) {
      res.status(404).json({ error: { message: "Session not found" } });
      return;
    }

    await sessionStore.revoke(sessionId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
