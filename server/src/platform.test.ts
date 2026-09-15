import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { canManage, tally, schemas } from "../../shared/modules.js";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-secret-never-use-this-in-production";
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1/moa_test";
let mongo: MongoMemoryServer | undefined, app: any, User: any;
before(async () => {
  if (!process.env.TEST_MONGODB_URI) {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
  }
  await mongoose.connect(process.env.MONGODB_URI!);
  ({ app } = await import("./app.js"));
  ({ User } = await import("./models.js"));
  await mongoose.connection.dropDatabase();
});
after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
test("Signup cannot grant admin; guarded CRUD, publication, preferences, rotation and revocation work", async () => {
  const agent = request.agent(app);
  let r = await agent
    .post("/api/auth/signup")
    .send({
      name: "Test Member",
      email: "member@example.test",
      password: "Member-password-123",
      role: "super_admin",
    });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.role, "user");
  let token = r.body.accessToken;
  assert.equal(
    (
      await agent
        .get("/api/admin/content/events")
        .set("Authorization", "Bearer " + token)
    ).status,
    403,
  );
  await User.updateOne(
    { email: "member@example.test" },
    { $set: { role: "event_manager" } },
  );
  const body = {
    title: "Integration Test Event",
    sport: "Athletics",
    status: "draft",
    eventStatus: "Registration Open",
    startDate: "2027-01-01",
    endDate: "2027-01-02",
  };
  r = await agent
    .post("/api/admin/content/events")
    .set("Authorization", "Bearer " + token)
    .send(body);
  assert.equal(r.status, 201);
  const id = r.body._id;
  assert.equal((await request(app).get("/api/public/events")).body.length, 0);
  assert.equal(
    (
      await agent
        .post("/api/admin/content/results")
        .set("Authorization", "Bearer " + token)
        .send({})
    ).status,
    403,
  );
  r = await agent
    .put("/api/admin/content/events/" + id)
    .set("Authorization", "Bearer " + token)
    .send({ ...body, status: "published" });
  assert.equal(r.status, 200);
  assert.equal(
    (await request(app).get("/api/public/events")).body[0].title,
    body.title,
  );
  r = await agent
    .patch("/api/me")
    .set("Authorization", "Bearer " + token)
    .send({
      name: "Updated Name",
      theme: "dark",
      preferences: { reducedMotion: true },
    });
  assert.equal(r.body.name, "Updated Name");
  assert.equal(r.body.theme, "dark");
  assert.equal(
    (
      await agent
        .patch("/api/me")
        .set("Authorization", "Bearer " + token)
        .send({ role: "super_admin" })
    ).status,
    400,
  );
  assert.equal(
    (await request(app).delete("/api/admin/content/events/" + id)).status,
    401,
  );
  assert.equal(
    (
      await agent
        .post("/api/admin/content/events")
        .set("Origin", "https://evil.example")
        .set("Authorization", "Bearer " + token)
        .send(body)
    ).status,
    403,
  );
  r = await agent.post("/api/auth/refresh");
  assert.equal(r.status, 200);
  const oldToken = token;
  token = r.body.accessToken;
  assert.equal(
    (await agent.get("/api/me").set("Authorization", "Bearer " + oldToken))
      .status,
    401,
  );
  assert.equal(
    (await agent.get("/api/me").set("Authorization", "Bearer " + token)).status,
    200,
  );
  assert.equal(
    (
      await agent
        .delete("/api/admin/content/events/" + id)
        .set("Authorization", "Bearer " + token)
    ).status,
    200,
  );
  assert.equal((await request(app).get("/api/public/events")).body.length, 0);
  await agent.post("/api/auth/logout");
  assert.equal(
    (await agent.get("/api/me").set("Authorization", "Bearer " + token)).status,
    401,
  );
});
