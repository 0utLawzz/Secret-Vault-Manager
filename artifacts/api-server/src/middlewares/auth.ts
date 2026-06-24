import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // If no VAULT_PASSWORD is configured, the vault is open
  if (!process.env.VAULT_PASSWORD) {
    next();
    return;
  }
  const session = (req as any).session;
  if (session?.authenticated) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}
