import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { COURSE_INTEL_ACCESS_COOKIE, STUD_BUCKETS_ACCESS_COOKIE } from "./stud-buckets";

export { COURSE_INTEL_ACCESS_COOKIE, STUD_BUCKETS_ACCESS_COOKIE };

// SHA-256 for the shared teammate access code. The plaintext password is never stored in the repository.
const TEAM_ACCESS_CODE_SHA256 = "5ebdc7b074ec1caeffc7e4e590841dc7a39d26e74453a8529de168fcecff5eea";

function sessionSecret(): string {
  return (
    process.env.STUD_BUCKETS_COOKIE_SECRET ??
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    TEAM_ACCESS_CODE_SHA256
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

function verifyTeamCode(candidate: unknown): boolean {
  return typeof candidate === "string" && safeEqual(sha256(candidate.trim()), TEAM_ACCESS_CODE_SHA256);
}

export function studBucketsAccessConfigured(): boolean {
  return true;
}

export function courseIntelAccessConfigured(): boolean {
  return true;
}

export function verifyStudBucketsCode(candidate: unknown): boolean {
  return verifyTeamCode(candidate);
}

export function verifyCourseIntelCode(candidate: unknown): boolean {
  return verifyTeamCode(candidate);
}

export function createStudBucketsSession(): string {
  return digest(`stud-buckets:${TEAM_ACCESS_CODE_SHA256}`);
}

export function verifyStudBucketsSession(candidate: string | undefined): boolean {
  return Boolean(candidate && safeEqual(candidate, createStudBucketsSession()));
}

export function createCourseIntelSession(): string {
  return digest(`course-intel:${TEAM_ACCESS_CODE_SHA256}`);
}

export function verifyCourseIntelSession(candidate: string | undefined): boolean {
  return Boolean(candidate && safeEqual(candidate, createCourseIntelSession()));
}
