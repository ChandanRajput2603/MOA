import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { User, Session } from "./models.js";
import { config } from "./config.js";
export const hash = (v: string) => createHash("sha256").update(v).digest("hex");
export const asyncRoute =
  (fn: (req: any, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
export const safeUser = (u: any) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  avatarUrl: u.avatarUrl,
  theme: u.theme,
  preferences: u.preferences,
  createdAt: u.createdAt,
  lastLogin: u.lastLogin,
});
export function cookie(res: Response, token: string) {
  res.cookie("moa_refresh", token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 7 * 86400000,
  });
}
export async function issue(user: any, res: Response, userAgent: string = "") {
  const token = randomBytes(48).toString("hex");
  const session = await Session.create({
    userId: user._id,
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + 7 * 86400000),
    userAgent,
  });
  cookie(res, token);
  return {
    accessToken: jwt.sign(
      { sub: String(user._id), sid: String(session._id) },
      config.JWT_SECRET,
      { expiresIn: "15m", issuer: "moa", audience: "moa-web" },
    ),
    user: safeUser(user),
  };
}
export const requireAuth = asyncRoute(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: "moa",
      audience: "moa-web",
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;
    const [user, session] = await Promise.all([
      User.findById(decoded.sub),
      Session.findOne({
        _id: decoded.sid,
        userId: decoded.sub,
        expiresAt: { $gt: new Date() },
      }),
    ]);
    if (!user || !session)
      return res.status(401).json({ error: "Your session has expired." });
    req.user = user;
    req.sessionId = String(session._id);
    next();
  } catch {
    return res.status(401).json({ error: "Please sign in again." });
  }
});
export const staff = (req: any, res: Response, next: NextFunction) =>
  req.user.role === "user"
    ? res.status(403).json({ error: "Staff access required." })
    : next();
export const superAdmin = (req: any, res: Response, next: NextFunction) =>
  req.user.role !== "super_admin"
    ? res.status(403).json({ error: "Super administrator access required." })
    : next();
