import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type TopicKind = "start" | "link" | "create" | "track" | "optimize";

export type Topic = {
  slug: string;
  service: string;
  title: string;
  summary: string;
  kind: TopicKind;
  order: number;
  illustration: string;
  body: string;
  minutes: number;
};

export const KIND_LABEL: Record<TopicKind, string> = {
  start: "الأساسيات والمفاهيم",
  link: "الربط والإعداد",
  create: "إنشاء الحملات والإعلانات",
  track: "التتبع والقياس",
  optimize: "التحسين والتقارير",
};
export const KIND_ORDER: TopicKind[] = ["start", "link", "create", "track", "optimize"];

const ROOT = path.join(process.cwd(), "content");
const cacheMap = new Map<string, Topic[]>();

export function topicsOf(service: string): Topic[] {
  if (!/^[a-z0-9-]+$/.test(service)) return [];
  const hit = cacheMap.get(service);
  if (hit && process.env.NODE_ENV === "production") return hit;
  const dir = path.join(ROOT, service);
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const topics = files
    .map((file): Topic => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const kind = KIND_ORDER.includes(data.kind) ? (data.kind as TopicKind) : "start";
      const words = content.split(/\s+/).length;
      return {
        slug: file.replace(/\.md$/, ""),
        service,
        title: String(data.title ?? file),
        summary: String(data.summary ?? ""),
        kind,
        order: Number(data.order ?? parseInt(file, 10)) || 0,
        illustration: String(data.illustration ?? "none"),
        body: content.trim(),
        minutes: Math.max(2, Math.round(words / 180)),
      };
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  cacheMap.set(service, topics);
  return topics;
}

export function topicOf(service: string, slug: string): Topic | undefined {
  return topicsOf(service).find((t) => t.slug === slug);
}
