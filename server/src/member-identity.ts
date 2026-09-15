export function memberIdentity(module: string, data: {title?: string; organization?: string}) {
 const normalize = (value = "") => value.toLowerCase().replace(/^(?:(?:mr|ms|mrs|shri|adv|dr|prof)\.?\s*)+/i, "").replace(/[^a-z0-9]/g, "");
 return module + ":" + normalize(data.title) + (module === "affiliated-members" ? ":" + normalize(data.organization) : "");
}
