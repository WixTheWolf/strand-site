import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { STUD_BUCKETS_ACCESS_COOKIE } from "./stud-buckets";

export { STUD_BUCKETS_ACCESS_COOKIE };

function configuredCode(): string | null {
  return process.env.STUD_BUCKETS_ACCESS_CODE ?? process.env.STRAND_SCORING_ADMIN_PIN ?? null;
}

function sessionSecret(): string {
  return (
    process.env.STUD_BUCKETS_COOKIE_SECRET ??
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    configuredCode() ??
    "stud-buckets-not-configured"
  );
}

function digest(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const first = Buffer.from(a);
  const second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
}

export function studBucketsAccessConfigured(): boolean {
  return Boolean(configuredCode());
}

export function verifyStudBucketsCode(candidate: unknown): boolean {
  const expected = configuredCode();
  if (!expected || typeof candidate !== "string") return false;
  return safeEqual(digest(candidate.trim()), digest(expected));
}

export function createStudBucketsSession(): string | null {
  const code = configuredCode();
  return code ? digest(`session:${code}`) : null;
}

export function verifyStudBucketsSession(candidate: string | undefined): boolean {
  const expected = createStudBucketsSession();
  return Boolean(candidate && expected && safeEqual(candidate, expected));
}
