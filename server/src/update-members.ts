import mongoose from "mongoose";
import {config} from "./config.js";
import {Content} from "./models.js";
import {members2025} from "./data/members-2025.js";
import {memberIdentity} from "./member-identity.js";
await mongoose.connect(config.MONGODB_URI);
try {
 const existing=await Content.find({module:{$in:["committee","affiliated-members"]}});
 const operations=[];
 const missing:string[]=[];
 for(const source of members2025) {
  const matches=existing.filter(r=>memberIdentity(r.module,r.data)===memberIdentity(source.module,source.data));
  if(matches.length>1) throw new Error("Multiple Council records match "+source.data.title+". Resolve duplicates first.");
  if(!matches.length) {missing.push(source.data.title);continue;}
  const patch:Record<string,unknown>={};
  if(source.module==="committee") patch["data.order"]=source.data.order;
  for(const field of ["email","additionalEmails","phone"] as const) {
   if(source.data[field]) patch["data."+field]=source.data[field];
  }
  if(Object.keys(patch).length) operations.push({updateOne:{filter:{_id:matches[0]._id,module:source.module},update:{$set:patch}}});
 }
 if(operations.length) await Content.bulkWrite(operations);
 console.log("PDF contacts and Council row order applied to "+operations.length+" matched members.");
 if(missing.length) console.log("Not found (no records created): "+missing.join(", "));
} finally {await mongoose.disconnect();}
