import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export function getPrisma() {
  if (!globalForPrisma.beyondframesPrisma) {
    globalForPrisma.beyondframesPrisma = new PrismaClient();
  }

  return globalForPrisma.beyondframesPrisma;
}
