import mongoose, { Schema } from "mongoose";
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: "user" },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    theme: { type: String, default: "system" },
    preferences: { type: Schema.Types.Mixed, default: {} },
    lastLogin: Date,
  },
  { timestamps: true },
);
export const User = mongoose.model("User", userSchema);
export const Content = mongoose.model(
  "Content",
  new Schema(
    {
      module: { type: String, required: true, index: true },
      data: { type: Schema.Types.Mixed, required: true },
      createdBy: Schema.Types.ObjectId,
    },
    { timestamps: true },
  ),
);
Content.schema.index({ module: 1, "data.status": 1, createdAt: -1 });
export const Session = mongoose.model(
  "Session",
  new Schema({
    userId: { type: Schema.Types.ObjectId, index: true },
    tokenHash: { type: String, unique: true },
    expiresAt: { type: Date, index: { expires: 0 } },
    userAgent: String,
    createdAt: { type: Date, default: Date.now },
  }),
);
export const Activity = mongoose.model(
  "Activity",
  new Schema(
    {
      userId: Schema.Types.ObjectId,
      userName: String,
      action: String,
      module: String,
      title: String,
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
    },
    { timestamps: true },
  ),
);
export const Notification = mongoose.model(
  "Notification",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, index: true },
      message: String,
      read: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
export const Media = mongoose.model(
  "Media",
  new Schema(
    {
      name: String,
      url: String,
      publicId: String,
      resourceType: String,
      mimeType: String,
      createdBy: Schema.Types.ObjectId,
    },
    { timestamps: true },
  ),
);
export const Registration = mongoose.model(
  "Registration",
  new Schema(
    {
      userId: Schema.Types.ObjectId,
      eventId: Schema.Types.ObjectId,
      name: String,
      phone: String,
      sport: String,
      district: String,
    },
    { timestamps: true },
  ),
);
Registration.schema.index({ userId: 1, eventId: 1 }, { unique: true });
export const Message = mongoose.model(
  "Message",
  new Schema(
    { name: String, email: String, message: String },
    { timestamps: true },
  ),
);
