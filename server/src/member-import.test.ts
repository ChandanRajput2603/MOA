import {test} from "node:test";
import assert from "node:assert/strict";
import {members2025} from "./data/members-2025.js";
import {schemas} from "../../shared/modules.js";
import {memberIdentity} from "./member-identity.js";
test("source members have complete valid designations and no duplicates",()=>{
 assert.equal(members2025.filter(r=>r.module==="committee").length,28);
 assert.equal(members2025.filter(r=>r.module==="affiliated-members").length,94);
 for(const r of members2025) {assert.ok(r.data.designation);schemas[r.module].parse(r.data);}
 assert.equal(new Set(members2025.map(r=>memberIdentity(r.module,r.data))).size,122);
 assert.equal(members2025.find(r=>r.data.title==="Mr. Sanjay Shete" && r.module==="committee")?.data.designation,"Secretary General");
 assert.equal(members2025.find(r=>r.data.title==="Mr. Sandeep Yashwant Ombase")?.data.designation,"Acting President");
});
test("existing president is matched despite different honorific",()=>{
 assert.equal(memberIdentity("committee",{title:"Shri. Murlidhar Mohol"}),memberIdentity("committee",{title:"Mr. Murlidhar Mohol"}));
 assert.notEqual(memberIdentity("affiliated-members",{title:"Mr. Example Name",organization:"One Association"}),memberIdentity("affiliated-members",{title:"Mr. Example Name",organization:"Two Association"}));
});
test("PDF row order and wrapped contact details survive schema parsing",()=>{
 const council=members2025.filter(r=>r.module==="committee");
 assert.deepEqual(council.slice(0,5).map(r=>r.data.title),["Mr. Murlidhar Mohol","Mr. Sanjay Shete","Mr. Arun Lakhani","Mr. Sandeep Joshi","Mr. Shailesh Tilak"]);
 assert.deepEqual(council.map(r=>r.data.order),Array.from({length:28},(_,i)=>i+1));
 for(const r of members2025) {
  const parsed=schemas[r.module].parse(r.data);
  assert.equal(parsed.phone,r.data.phone);
  assert.equal(parsed.additionalEmails,r.data.additionalEmails);
  for(const email of r.data.additionalEmails.split("; ").filter(Boolean)) {
   schemas[r.module].parse({...r.data,email});
  }
 }
 const hockey=members2025.find(r=>r.data.title==="Mr. Manish S Anand")!;
 assert.equal(hockey.data.email,"manishsanand@gmail.com");
 assert.equal(hockey.data.additionalEmails,"hockeymaharashtra@hockeyindia.org; bmanojoo7@gmail.com");
});
