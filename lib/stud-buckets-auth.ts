import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { COURSE_INTEL_ACCESS_COOKIE, STUD_BUCKETS_ACCESS_COOKIE } from "./stud-buckets";

export { COURSE_INTEL_ACCESS_COOKIE, STUD_BUCKETS_ACCESS_COOKIE };

const COURSE_INTEL_CODE_SHA256 = "5ebdc7b074ec1caeffc7e4e590841dc7a39d26e74453a8529de168fcecff5eea";

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

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const first = Buffer.from(a);
  const second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
}

export function studBucketsAccessConfigured(): boolean {
  return Boolean(configuredCode());
}

export function courseIntelAccessConfigured(): boolean {
  return Boolean(COURSE_INTEL_CODE_SHA256);
}

export function verifyStudBucketsCode(candidate: unknown): boolean {
  const expected = configuredCode();
  if (!expected || typeof candidate !== "string") return false;

  const submitted = candidate.trim();
  return safeEqual(digest(submitted), digest(expected));
}

export function verifyCourseIntelCode(candidate: unknown): boolean {
  return typeof candidate === "string" && safeEqual(sha256(candidate.trim()), COURSE_INTEL_CODE_SHA256);
}

export function createStudBucketsSession(): string | null {
  const code = configuredCode();
  return code ? digest(`session:${code}`) : null;
}

export function verifyStudBucketsSession(candidate: string | undefined): boolean {
  const expected = createStudBucketsSession();
  return Boolean(candidate && expected && safeEqual(candidate, expected));
}

export function createCourseIntelSession(): string {
  return digest(`course-intel:${COURSE_INTEL_CODE_SHA256}`);
}

export function verifyCourseIntelSession(candidate: string | undefined): boolean {
  return Boolean(candidate && safeEqual(candidate, createCourseIntelSession()));
}
