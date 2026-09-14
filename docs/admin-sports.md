# Sports management

Restart the server after pulling. Before listening, it imports the original 44 sports into MongoDB once: Gymnastics order 1, Football order 2. The app_migrations record prevents later startups from restoring deleted sports. Partial initial imports retry with deterministic IDs and insert-only updates.

Super administrators can open Admin > Sports to add, edit, delete, upload a photo and publish entries. Use the Order field: lower values appear first; ties sort by name. The first published sport is the homepage default. A new homepage visit loads the latest published list. Draft/archived entries stay hidden. Removing a sport does not delete any event or athlete records.

The homepage has no hardcoded fallback list: deleting all sports leaves an empty state. Errors show an unavailable message. Existing event and athlete matching uses the sport title. When renaming sports, update matching sport labels in event/athlete records if needed.

Validation: client/server builds and sports ordering, permission, schema and one-time migration tests. Migration tests use a mocked database; live MongoDB verification is still needed locally.
