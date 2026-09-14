import { test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { Content } from "./models.js";
import { initializeSports } from "./initialize-sports.js";
import { initialSports, sortSports } from "../../shared/sports.js";
import { schemas, canManage } from "../../shared/modules.js";

test("sports ordering and admin validation", () => {
 assert.deepEqual(initialSports.slice(0,2), ["Gymnastics","Football"]);
 assert.equal(new Set(initialSports).size,44);
 assert.equal(sortSports([{title:"Football",order:2},{title:"Gymnastics",order:1}])[0].title,"Gymnastics");
 assert.equal(sortSports([{title:"Football",order:2}])[0].title,"Football");
 assert.deepEqual(sortSports([]),[]);
 assert.equal(schemas.sports.safeParse({title:"Swimming",order:0}).success,false);
 assert.equal(schemas.sports.safeParse({title:"Swimming",order:3,status:"published"}).success,true);
 assert.equal(canManage("super_admin","sports"),true);
 assert.equal(canManage("user","sports"),false);
 assert.equal(canManage("viewer","sports"),false);
});
test("sports migration runs once and does not resurrect deletions", async () => {
 const originalCollection=mongoose.connection.collection;
 const originalBulk=Content.bulkWrite;
 let completed=false;let batches=0;
 try {
  (mongoose.connection as any).collection=()=>({findOne:async()=>completed?{_id:"initial-sports-v1"}:null,updateOne:async()=>{completed=true;}});
  (Content as any).bulkWrite=async(ops:any[])=>{batches++;assert.equal(ops.length,44);assert.equal(ops[0].updateOne.update.$setOnInsert.data.title,"Gymnastics");assert.equal(ops[1].updateOne.update.$setOnInsert.data.order,2);};
  await initializeSports();
  await initializeSports();
  assert.equal(batches,1);
 } finally { mongoose.connection.collection=originalCollection;Content.bulkWrite=originalBulk; }
});
