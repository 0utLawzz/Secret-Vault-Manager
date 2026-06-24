import { Router } from "express";

const router = Router();

// POST /auth/login
router.post("/auth/login", (req, res) => {
  const { password } = req.body as { password?: string };
  const vaultPassword = process.env.VAULT_PASSWORD;

  if (!vaultPassword) {
    // No password set — vault is open (dev mode)
    (req as any).session.authenticated = true;
    res.json({ ok: true, message: "No password configured — vault open" });
    return;
  }

  if (password === vaultPassword) {
    (req as any).session.authenticated = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: "Wrong password" });
  }
});

// POST /auth/logout
router.post("/auth/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /auth/me
router.get("/auth/me", (req, res) => {
  const session = (req as any).session;
  const vaultPassword = process.env.VAULT_PASSWORD;
  // If no password configured, always authenticated
  if (!vaultPassword) {
    res.json({ authenticated: true });
    return;
  }
  res.json({ authenticated: !!session?.authenticated });
});

export default router;
