import { test } from "node:test";
import assert from "node:assert/strict";
import { canManage, tally, schemas } from "../../shared/modules.js";
test("Role boundaries and validation reject unsafe content", () => {
  assert.equal(canManage("event_manager", "events"), true);
  assert.equal(canManage("event_manager", "results"), false);
  assert.equal(canManage("user", "events"), false);
  assert.equal(
    schemas.events.safeParse({
      title: "A valid event",
      startDate: "2026-10-20",
      endDate: "2026-10-10",
    }).success,
    false,
  );
  assert.equal(
    schemas.news.safeParse({ title: "News", imageUrl: "javascript:alert(1)" })
      .success,
    false,
  );
});
test("Medal rankings prioritize gold, then silver, then bronze", () => {
  const rows = tally([
    { district: "A", medal: "Silver" },
    { district: "B", medal: "Gold" },
    { district: "A", medal: "Bronze" },
    { district: "B", medal: "None" },
  ]);
  assert.equal(rows[0].name, "B");
  assert.equal(rows[0].total, 1);
  assert.equal(rows[1].total, 2);
});
