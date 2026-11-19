export function toSkillList(skills: string[] | string | null): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return skills
    .replace(/[{}[\]"']/g, "") // strip { } [ ] and quotes
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill !== "");
}