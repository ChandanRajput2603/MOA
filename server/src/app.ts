import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { z, ZodError } from "zod";
import path from "node:path";
import { config, projectRoot } from "./config.js";
import {
  User,
  Content,
  Session,
  Activity,
  Notification,
  Media,
  Registration,
  Message,
} from "./models.js";
import {
  asyncRoute,
  requireAuth,
  staff,
  superAdmin,
  issue,
  hash,
  safeUser,
} from "./auth.js";
import {
  schemas,
  moduleNames,
  canManage,
  roles,
  tally,
  type ModuleName,
  type Role,
} from "../../shared/modules.js";
export const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "https:", "data:"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "script-src": ["'self'"],
      },
    },
  }),
);
app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }), cookieParser());
app.use("/api", (req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.get("origin") &&
    req.get("origin") !== config.CLIENT_ORIGIN
  )
    return res.status(403).json({ error: "Origin not allowed." });
  next();
});
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60000,
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
const credentials = z.object({
  email: z
    .string()
    .email()
    .transform((s) => s.toLowerCase()),
  password: z.string().min(12).max(72),
});
const id = (value: string) => {
  if (!mongoose.isValidObjectId(value))
    throw Object.assign(new Error("Invalid identifier."), { status: 400 });
  return value;
};
const unpack = (doc: any) => ({
  ...doc.data,
  _id: String(doc._id),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
const published = () => ({
  "data.status": "published",
  $or: [
    { "data.publishDate": { $exists: false } },
    { "data.publishDate": "" },
    { "data.publishDate": { $lte: new Date().toISOString().slice(0, 10) } },
  ],
});
async function log(
  req: any,
  action: string,
  module: string,
  title: string,
  before?: any,
  after?: any,
) {
  await Promise.all([
    Activity.create({
      userId: req.user._id,
      userName: req.user.name,
      action,
      module,
      title,
      before,
      after,
    }),
    (module === "events"
      ? req.user.preferences?.eventUpdates
      : module === "news"
        ? req.user.preferences?.newsUpdates
        : req.user.preferences?.systemNotifications) !== false
      ? Notification.create({
          userId: req.user._id,
          message: `${title}: ${action}`,
        })
      : Promise.resolve(),
  ]);
}
app.get("/api/health", (_req, res) =>
  res.json({
    status:
      mongoose.connection.readyState === 1 ? "ok" : "database unavailable",
  }),
);
app.post(
  "/api/auth/signup",
  asyncRoute(async (req, res) => {
    const data = credentials
      .extend({ name: z.string().trim().min(2).max(100) })
      .parse(req.body);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 12),
      role: "user",
    });
    res.status(201).json(await issue(user, res, req.get("user-agent")));
  }),
);
app.post(
  "/api/auth/login",
  asyncRoute(async (req, res) => {
    const { email, password } = credentials.parse(req.body);
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: "Email or password is incorrect." });
    user.lastLogin = new Date();
    await user.save();
    res.json(await issue(user, res, req.get("user-agent")));
  }),
);
app.post(
  "/api/auth/refresh",
  asyncRoute(async (req, res) => {
    const token = req.cookies.moa_refresh;
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const session = await Session.findOneAndDelete({
      tokenHash: hash(token),
      expiresAt: { $gt: new Date() },
    });
    if (!session) return res.status(401).json({ error: "Session expired." });
    const user = await User.findById(session.userId);
    if (!user) return res.status(401).json({ error: "Account unavailable." });
    res.json(await issue(user, res, req.get("user-agent")));
  }),
);
app.post(
  "/api/auth/logout",
  asyncRoute(async (req, res) => {
    if (req.cookies.moa_refresh)
      await Session.deleteOne({ tokenHash: hash(req.cookies.moa_refresh) });
    res.clearCookie("moa_refresh", { path: "/api/auth" }).json({ ok: true });
  }),
);
app.get(
  "/api/me",
  requireAuth,
  asyncRoute(async (req, res) => res.json(safeUser(req.user))),
);
app.patch(
  "/api/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100).optional(),
        phone: z.string().max(30).optional(),
        avatarUrl: z
          .union([z.literal(""), z.string().url().startsWith("https://")])
          .optional(),
        theme: z.enum(["light", "dark", "system"]).optional(),
        preferences: z
          .object({
            eventUpdates: z.boolean().optional(),
            newsUpdates: z.boolean().optional(),
            systemNotifications: z.boolean().optional(),
            fontSize: z.enum(["normal", "large"]).optional(),
            reducedMotion: z.boolean().optional(),
            highContrast: z.boolean().optional(),
          })
          .optional(),
      })
      .strict()
      .parse(req.body);
    Object.assign(req.user, data);
    await req.user.save();
    res.json(safeUser(req.user));
  }),
);
app.post(
  "/api/me/password",
  requireAuth,
  asyncRoute(async (req, res) => {
    const { currentPassword, password } = z
      .object({
        currentPassword: z.string(),
        password: z.string().min(12).max(72),
      })
      .parse(req.body);
    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash)))
      return res.status(400).json({ error: "Current password is incorrect." });
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    await Session.deleteMany({ userId: user._id });
    await log(req, "Password changed", "security", "Account");
    res.clearCookie("moa_refresh", { path: "/api/auth" }).json({ ok: true });
  }),
);
app.get(
  "/api/me/sessions",
  requireAuth,
  asyncRoute(async (req, res) =>
    res.json(
      (
        await Session.find({
          userId: req.user._id,
          expiresAt: { $gt: new Date() },
        }).select("userAgent createdAt expiresAt")
      ).map((s) => ({
        ...s.toObject(),
        current: String(s._id) === req.sessionId,
      })),
    ),
  ),
);
app.delete(
  "/api/me/sessions",
  requireAuth,
  asyncRoute(async (req, res) => {
    await Session.deleteMany({ userId: req.user._id });
    res.clearCookie("moa_refresh", { path: "/api/auth" }).json({ ok: true });
  }),
);
app.get(
  "/api/public/:module",
  asyncRoute(async (req, res) => {
    const module = z.enum(moduleNames).parse(req.params.module);
    const docs = await Content.find({ module, ...published() })
      .sort({ "data.order": 1, createdAt: -1 })
      .limit(500);
    res.json(docs.map(unpack));
  }),
);
app.get(
  "/api/medals",
  asyncRoute(async (_req, res) =>
    res.json(
      tally(
        (await Content.find({ module: "results", ...published() })).map(unpack),
      ),
    ),
  ),
);
app.get(
  "/api/admin/content/:module",
  requireAuth,
  staff,
  asyncRoute(async (req, res) => {
    const module = z.enum(moduleNames).parse(req.params.module);
    res.json(
      (await Content.find({ module }).sort({ updatedAt: -1 }).limit(500)).map(
        unpack,
      ),
    );
  }),
);
app.post(
  "/api/admin/content/:module",
  requireAuth,
  staff,
  asyncRoute(async (req, res) => {
    const module = z.enum(moduleNames).parse(req.params.module);
    if (!canManage(req.user.role as Role, module))
      return res.status(403).json({ error: "You cannot edit this module." });
    const data = schemas[module].parse(req.body);
    const doc = await Content.create({ module, data, createdBy: req.user._id });
    await log(req, "Created", module, data.title, undefined, data);
    res.status(201).json(unpack(doc));
  }),
);
app.put(
  "/api/admin/content/:module/:id",
  requireAuth,
  staff,
  asyncRoute(async (req, res) => {
    const module = z.enum(moduleNames).parse(req.params.module);
    if (!canManage(req.user.role as Role, module))
      return res.status(403).json({ error: "You cannot edit this module." });
    const data = schemas[module].parse(req.body);
    const doc = await Content.findOne({ _id: id(req.params.id), module });
    if (!doc) return res.status(404).json({ error: "Record not found." });
    const before = doc.data;
    doc.data = data;
    await doc.save();
    await log(req, "Updated", module, data.title, before, data);
    res.json(unpack(doc));
  }),
);
app.delete(
  "/api/admin/content/:module/:id",
  requireAuth,
  staff,
  asyncRoute(async (req, res) => {
    const module = z.enum(moduleNames).parse(req.params.module);
    if (!canManage(req.user.role as Role, module))
      return res.status(403).json({ error: "You cannot edit this module." });
    const doc = await Content.findOneAndDelete({
      _id: id(req.params.id),
      module,
    });
    if (!doc) return res.status(404).json({ error: "Record not found." });
    await log(req, "Deleted", module, doc.data.title, doc.data);
    res.json({ ok: true });
  }),
);
app.get(
  "/api/admin/activity",
  requireAuth,
  staff,
  asyncRoute(async (req, res) => {
    const query =
      req.user.role === "super_admin" ? {} : { userId: req.user._id };
    res.json(await Activity.find(query).sort({ createdAt: -1 }).limit(100));
  }),
);
app.get(
  "/api/notifications",
  requireAuth,
  asyncRoute(async (req, res) =>
    res.json(
      await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(100),
    ),
  ),
);
app.patch(
  "/api/notifications",
  requireAuth,
  asyncRoute(async (req, res) => {
    await Notification.updateMany(
      { userId: req.user._id },
      { $set: { read: true } },
    );
    res.json({ ok: true });
  }),
);
app.delete(
  "/api/notifications/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    await Notification.deleteOne({
      _id: id(req.params.id),
      userId: req.user._id,
    });
    res.json({ ok: true });
  }),
);
app.get(
  "/api/admin/users",
  requireAuth,
  superAdmin,
  asyncRoute(async (_req, res) =>
    res.json((await User.find().limit(200)).map(safeUser)),
  ),
);
app.patch(
  "/api/admin/users/:id",
  requireAuth,
  superAdmin,
  asyncRoute(async (req, res) => {
    const { role } = z.object({ role: z.enum(roles) }).parse(req.body);
    if (req.params.id === String(req.user._id))
      return res
        .status(400)
        .json({ error: "You cannot change your own role." });
    const user = await User.findByIdAndUpdate(
      id(req.params.id),
      { $set: { role } },
      { new: true },
    );
    if (!user) return res.status(404).json({ error: "User not found." });
    await Session.deleteMany({ userId: user._id });
    await log(req, "Role changed", "users", user.name, undefined, { role });
    res.json(safeUser(user));
  }),
);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});
app.post(
  "/api/upload",
  requireAuth,
  upload.single("file"),
  asyncRoute(async (req, res) => {
    if (!process.env.CLOUDINARY_API_KEY)
      return res
        .status(503)
        .json({
          error: "File storage is not configured. Contact the administrator.",
        });
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Choose a file." });
    const b = file.buffer;
    const image =
      (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
      b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      (b.toString("ascii", 0, 4) === "RIFF" &&
        b.toString("ascii", 8, 12) === "WEBP");
    const pdf = b.toString("ascii", 0, 5) === "%PDF-";
    if (!image && !pdf)
      return res
        .status(400)
        .json({ error: "Upload a JPG, PNG, WebP or PDF file." });
    if (pdf && ["user", "viewer"].includes(req.user.role))
      return res
        .status(403)
        .json({ error: "Document upload requires an editor role." });
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "moa",
            resource_type: pdf ? "raw" : "image",
            ...(pdf ? { format: "pdf" } : {}),
          },
          (error, result) => (error ? reject(error) : resolve(result)),
        )
        .end(b);
    });
    const doc = await Media.create({
      name: file.originalname.slice(0, 180),
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      mimeType: pdf ? "application/pdf" : "image",
      createdBy: req.user._id,
    });
    res.status(201).json(doc);
  }),
);
app.get(
  "/api/admin/media",
  requireAuth,
  staff,
  asyncRoute(async (_req, res) =>
    res.json(await Media.find().sort({ createdAt: -1 }).limit(200)),
  ),
);
app.get(
  "/api/me/registrations",
  requireAuth,
  asyncRoute(async (req, res) =>
    res.json(
      await Registration.find({ userId: req.user._id }).sort({ createdAt: -1 }),
    ),
  ),
);
app.post(
  "/api/events/:id/register",
  requireAuth,
  asyncRoute(async (req, res) => {
    const event = await Content.findOne({
      _id: id(req.params.id),
      module: "events",
      ...published(),
    });
    if (
      !event ||
      event.data.eventStatus !== "Registration Open" ||
      (event.data.deadline &&
        event.data.deadline < new Date().toISOString().slice(0, 10))
    )
      return res.status(400).json({ error: "Registration is closed." });
    const data = z
      .object({
        name: z.string().min(2).max(100),
        phone: z.string().min(7).max(30),
        sport: z.string().max(100),
        district: z.string().min(2).max(100),
      })
      .parse(req.body);
    res
      .status(201)
      .json(
        await Registration.create({
          ...data,
          userId: req.user._id,
          eventId: event._id,
        }),
      );
  }),
);
app.post(
  "/api/contact",
  rateLimit({ windowMs: 3600000, limit: 5 }),
  asyncRoute(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100),
        email: z.string().email(),
        message: z.string().trim().min(10).max(3000),
      })
      .parse(req.body);
    await Message.create(data);
    res.status(201).json({ ok: true });
  }),
);
app.get(
  "/api/admin/messages",
  requireAuth,
  superAdmin,
  asyncRoute(async (_req, res) =>
    res.json(await Message.find().sort({ createdAt: -1 }).limit(100)),
  ),
);
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "Endpoint not found." }),
);
if (config.NODE_ENV === "production") {
  app.use(express.static(path.join(projectRoot, "client/dist")));
  app.get("*", (_req, res) =>
    res.sendFile(path.join(projectRoot, "client/dist/index.html")),
  );
}
app.use((error: any, _req: any, res: any, _next: any) => {
  if (error instanceof ZodError)
    return res
      .status(400)
      .json({
        error: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      });
  if (error.code === 11000)
    return res
      .status(409)
      .json({ error: "This account or registration already exists." });
  if (error instanceof multer.MulterError)
    return res.status(400).json({ error: "Upload limit is 10 MB." });
  console.error(error.message);
  res
    .status(error.status || 500)
    .json({
      error: error.status
        ? error.message
        : "Unable to complete the request. Please try again.",
    });
});
