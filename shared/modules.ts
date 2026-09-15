import { z } from "zod";
export const roles = [
  "super_admin",
  "event_manager",
  "content_manager",
  "results_manager",
  "directory_manager",
  "viewer",
  "user",
] as const;
export const moduleNames = [
  "sports",
  "events",
  "news",
  "circulars",
  "results",
  "committee",
  "affiliated-members",
  "associate-members",
  "directory",
  "gallery",
  "athletes",
] as const;
export type ModuleName = (typeof moduleNames)[number];
export type Role = (typeof roles)[number];
export const permissions: Record<Role, readonly string[]> = {
  super_admin: moduleNames,
  event_manager: ["events"],
  content_manager: ["news", "circulars", "gallery"],
  results_manager: ["results"],
  directory_manager: [
    "committee",
    "affiliated-members",
    "associate-members",
    "directory",
    "athletes",
  ],
  viewer: [],
  user: [],
};
export function canManage(role: Role, module: string) {
  return permissions[role]?.includes(module) ?? false;
}
const text = z.string().trim().max(10000).default("");
const short = z.string().trim().max(240).default("");
const url = z
  .union([
    z.literal(""),
    z
      .string()
      .url()
      .refine((v) => v.startsWith("https://"), "Use an HTTPS URL"),
  ])
  .default("");
const date = z
  .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
  .default("");
const common = {
  title: z.string().trim().min(2).max(180),
  description: text,
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  imageUrl: url,
};
const associationMember = z.object({
  ...common,
  designation: short,
  organization: short,
  sport: short,
  district: short,
  email: z.union([z.literal(""), z.string().email()]).default(""),
  additionalEmails: short,
  phone: short,
  address: short,
  tenure: short,
  order: z.coerce.number().int().min(0).default(0),
});
export const schemas = {
  sports: z.object({ ...common, order: z.coerce.number().int().min(1).default(1) }),
  "affiliated-members": associationMember,
  "associate-members": associationMember,
  events: z
    .object({
      ...common,
      sport: short,
      venue: short,
      city: short,
      district: short,
      startDate: date,
      endDate: date,
      deadline: date,
      organizer: short,
      contact: short,
      registrationUrl: url,
      eventStatus: z
        .enum([
          "Upcoming",
          "Registration Open",
          "Ongoing",
          "Completed",
          "Cancelled",
        ])
        .default("Upcoming"),
    })
    .refine((v) => !v.endDate || !v.startDate || v.endDate >= v.startDate, {
      message: "End date must follow start date",
      path: ["endDate"],
    }),
  news: z.object({
    ...common,
    category: short,
    author: short,
    publishDate: date,
    tags: short,
  }),
  circulars: z.object({
    ...common,
    category: short,
    documentNumber: short,
    publishDate: date,
    fileUrl: url,
  }),
  results: z.object({
    ...common,
    tournament: z.string().trim().min(2).max(180),
    sport: short,
    district: short,
    athlete: z.string().trim().min(2).max(180),
    category: short,
    date: date,
    position: z.coerce.number().int().min(1).max(10000),
    medal: z.enum(["Gold", "Silver", "Bronze", "None"]),
    points: z.coerce.number().min(0).default(0),
  }),
  committee: z.object({
    ...common,
    designation: short,
    department: short,
    email: z.union([z.literal(""), z.string().email()]).default(""),
  additionalEmails: short,
    phone: short,
    address: short,
    tenure: short,
    category: short,
    order: z.coerce.number().int().min(0).default(0),
  }),
  directory: z.object({
    ...common,
    designation: short,
    organization: short,
    email: z.union([z.literal(""), z.string().email()]).default(""),
  additionalEmails: short,
    phone: short,
    address: short,
    category: short,
  }),
  gallery: z.object({ ...common, category: short, videoUrl: url }),
  athletes: z.object({
    ...common,
    sport: short,
    district: short,
    achievements: text,
    hallOfFame: z.boolean().default(false),
  }),
};
export const labels: Record<ModuleName, string> = {
  sports: "Sports",
  events: "Events & tournaments",
  news: "News & updates",
  circulars: "Bulletins & circulars",
  results: "Results",
  committee: "Executive Council",
  "affiliated-members": "Affiliated Members",
  "associate-members": "Associate Members",
  directory: "Directory",
  gallery: "Media gallery",
  athletes: "Athletes",
};
export const fields: Record<ModuleName, string[]> = {
  sports: ["order"],
  "affiliated-members": [
    "organization",
    "designation",
    "sport",
    "district",
    "email",
    "additionalEmails",
    "phone",
    "address",
    "tenure",
    "order",
  ],
  "associate-members": [
    "organization",
    "designation",
    "sport",
    "district",
    "email",
    "additionalEmails",
    "phone",
    "address",
    "tenure",
    "order",
  ],
  events: [
    "sport",
    "venue",
    "city",
    "district",
    "startDate",
    "endDate",
    "deadline",
    "organizer",
    "contact",
    "registrationUrl",
    "eventStatus",
  ],
  news: ["category", "author", "publishDate", "tags"],
  circulars: ["category", "documentNumber", "publishDate", "fileUrl"],
  results: [
    "tournament",
    "sport",
    "district",
    "athlete",
    "category",
    "date",
    "position",
    "medal",
    "points",
  ],
  committee: [
    "designation",
    "department",
    "email",
    "additionalEmails",
    "phone",
    "address",
    "tenure",
    "category",
    "order",
  ],
  directory: [
    "designation",
    "organization",
    "email",
    "additionalEmails",
    "phone",
    "address",
    "category",
  ],
  gallery: ["category", "videoUrl"],
  athletes: ["sport", "district", "achievements", "hallOfFame"],
};
export function tally(rows: any[]) {
  const map = new Map<string, any>();
  for (const r of rows) {
    const key = r.district || r.sport || "Unassigned";
    const v = map.get(key) || {
      name: key,
      Gold: 0,
      Silver: 0,
      Bronze: 0,
      total: 0,
    };
    if (["Gold", "Silver", "Bronze"].includes(r.medal)) {
      v[r.medal]++;
      v.total++;
    }
    map.set(key, v);
  }
  return [...map.values()].sort(
    (a, b) =>
      b.Gold - a.Gold ||
      b.Silver - a.Silver ||
      b.Bronze - a.Bronze ||
      a.name.localeCompare(b.name),
  );
}
