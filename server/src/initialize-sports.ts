import mongoose from "mongoose";
import { createHash } from "node:crypto";
import { Content } from "./models.js";
import { initialSports } from "../../shared/sports.js";

// One-time migration: a completed migration never recreates deleted sports.
export async function initializeSports() {
  const migrations = mongoose.connection.collection<{_id: string; completedAt: Date}>("app_migrations");
  const key = "initial-sports-v1";
  if (await migrations.findOne({_id: key})) return;
  await Content.bulkWrite(initialSports.map((title, index) => ({updateOne: {
    filter: {_id: new mongoose.Types.ObjectId(createHash("sha256").update(key + ":" + title).digest("hex").slice(0,24))},
    update: {$setOnInsert: {module: "sports", data: {title, description: "", imageUrl: "", status: "published", order: index + 1}}},
    upsert: true
  }})));
  await migrations.updateOne({_id: key}, {$setOnInsert: {completedAt: new Date()}}, {upsert: true});
}
