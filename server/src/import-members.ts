import mongoose from "mongoose";
import { createHash } from "node:crypto";
import { config } from "./config.js";
import { Content } from "./models.js";
import { schemas } from "../../shared/modules.js";
import { members2025 } from "./data/members-2025.js";
import { memberIdentity } from "./member-identity.js";

const records = members2025.map(r => ({module:r.module, data:schemas[r.module].parse(r.data)}));
const keys = records.map(r => memberIdentity(r.module,r.data));
if(new Set(keys).size !== keys.length) throw new Error("Duplicate identities in source data.");
await mongoose.connect(config.MONGODB_URI);
try {
 const ledger = mongoose.connection.collection<{_id:string; completedAt:Date}>("member_imports");
 const existing = await Content.find({module:{$in:["committee","affiliated-members"]}});
 const plan = [];
 for(const record of records) {
  const key = "members-2025-v1:" + memberIdentity(record.module,record.data);
  if(await ledger.findOne({_id:key})) continue;
  const matches = existing.filter(row => memberIdentity(row.module,row.data)===memberIdentity(record.module,record.data));
  if(matches.length>1) throw new Error("Multiple existing records match " + record.data.title + ". Resolve duplicates before importing.");
  plan.push({record,key,match:matches[0]});
 }
 let added=0, updated=0;
 for(const {record,key,match} of plan) {
  if(match) {
   const patch:Record<string,unknown> = {
    "data.designation": record.data.designation, "data.tenure": record.data.tenure, "data.order": record.data.order
   };
   if("organization" in record.data) patch["data.organization"]=record.data.organization;
   if("department" in record.data) patch["data.department"]=record.data.department;
   // Preserve the existing photo, name, contact details, description and publication status.
   await Content.updateOne({_id:match._id},{$set:patch});
   updated++;
  } else {
   const _id=new mongoose.Types.ObjectId(createHash("sha256").update(key).digest("hex").slice(0,24));
   await Content.updateOne({_id},{$setOnInsert:{module:record.module,data:record.data}},{upsert:true});
   added++;
  }
  await ledger.updateOne({_id:key},{$setOnInsert:{completedAt:new Date()}},{upsert:true});
 }
 console.log("Member import complete: " + added + " added, " + updated + " matched records updated, " + (records.length-plan.length) + " already imported.");
 console.log("9 unnamed positions were not imported. See docs/member-import-2025.md.");
} finally { await mongoose.disconnect(); }
