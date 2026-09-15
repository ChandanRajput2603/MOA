import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { User, Content } from "./models.js";
import { schemas, type ModuleName } from "../../shared/modules.js";
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12)
  throw new Error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in .env.",
  );
await mongoose.connect(config.MONGODB_URI);
if (!(await User.exists({ email: ADMIN_EMAIL.toLowerCase() }))) {
  await User.create({
    name: ADMIN_NAME || "MOA Administrator",
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: "super_admin",
  });
  console.log("Administrator created.");
}
if (process.argv.includes("--demo") && !(await Content.exists({}))) {
  const samples: Partial<Record<ModuleName, any[]>> = {
    events: [
      {
        title: "Sample • State Athletics Championship",
        sport: "Athletics",
        venue: "Balewadi Stadium",
        city: "Pune",
        district: "Pune",
        startDate: "2026-11-14",
        endDate: "2026-11-16",
        deadline: "2026-11-01",
        eventStatus: "Registration Open",
        description:
          "Demonstration event only. Replace with an approved association competition before publication.",
      },
      {
        title: "Sample • Inter-District Swimming Meet",
        sport: "Swimming",
        venue: "Venue to be confirmed",
        city: "Mumbai",
        startDate: "2026-12-05",
        endDate: "2026-12-06",
        eventStatus: "Upcoming",
      },
      {
        title: "Sample • Maharashtra Badminton Open",
        sport: "Badminton",
        city: "Nagpur",
        startDate: "2027-01-10",
        endDate: "2027-01-12",
        eventStatus: "Upcoming",
      },
    ],
    news: [
      {
        title: "Sample • Preparing for the next sporting season",
        category: "MOA News",
        author: "Editorial team",
        description:
          "This is sample content to demonstrate the news publishing workflow. Add approved association news through the admin dashboard.",
        publishDate: "2026-09-01",
      },
      {
        title: "Sample • Supporting the next generation",
        category: "Athletes",
        description:
          "Sample article. Replace this text with approved athlete development news.",
      },
    ],
    results: [
      {
        title: "Sample • 100m final",
        tournament: "Sample State Games",
        sport: "Athletics",
        athlete: "Sample Athlete A",
        district: "Pune",
        position: 1,
        medal: "Gold",
        date: "2026-08-20",
      },
      {
        title: "Sample • 100m final",
        tournament: "Sample State Games",
        sport: "Athletics",
        athlete: "Sample Athlete B",
        district: "Mumbai",
        position: 2,
        medal: "Silver",
        date: "2026-08-20",
      },
      {
        title: "Sample • 100m final",
        tournament: "Sample State Games",
        sport: "Athletics",
        athlete: "Sample Athlete C",
        district: "Nagpur",
        position: 3,
        medal: "Bronze",
        date: "2026-08-20",
      },
    ],
  };
  for (const [module, rows] of Object.entries(samples))
    for (const row of rows!)
      await Content.create({
        module,
        data: schemas[module as ModuleName].parse({
          ...row,
          status: "published",
        }),
      });
  console.log(
    "Clearly labeled demonstration content added. No real official profiles or contact details were invented.",
  );
}
await mongoose.disconnect();
