import { test } from "node:test";
import assert from "node:assert/strict";
import {
  moduleNames,
  schemas,
  canManage,
  labels,
} from "../../shared/modules.js";

test("Existing council records remain compatible without migration", () => {
  const existing = {
    title: "Existing member",
    designation: "President",
    category: "",
    status: "published",
    order: 1,
  };
  assert.equal(schemas.committee.parse(existing).designation, "President");
  assert.equal(labels.committee, "Executive Council");
  assert.ok(moduleNames.includes("committee"));
});
test("Both membership directories enforce editorial roles and profile validation", () => {
  for (const module of ["affiliated-members", "associate-members"] as const) {
    assert.ok(moduleNames.includes(module));
    assert.ok(canManage("super_admin", module));
    assert.ok(canManage("directory_manager", module));
    for (const role of [
      "user",
      "viewer",
      "content_manager",
      "event_manager",
      "results_manager",
    ] as const)
      assert.equal(canManage(role, module), false);
    assert.equal(
      schemas[module].parse({ title: "Test Association" }).status,
      "draft",
    );
    assert.equal(
      schemas[module].safeParse({ title: "Test Association", email: "invalid" })
        .success,
      false,
    );
    assert.equal(
      schemas[module].safeParse({
        title: "Test Association",
        imageUrl: "javascript:alert(1)",
      }).success,
      false,
    );
    assert.equal(
      schemas[module].parse({
        title: "Test Association",
        organization: "District association",
        imageUrl: "https://example.org/photo.webp",
        status: "published",
      }).organization,
      "District association",
    );
  }
});
