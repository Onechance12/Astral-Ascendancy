-- Phase 1: living card asset foundation.
-- UserCard remains the collection-count summary; CardInstance tracks exact owned copies.
CREATE TABLE "CardInstance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'drop',
    "displayName" TEXT,
    "title" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL DEFAULT 'collection',
    "status" TEXT NOT NULL DEFAULT 'available',
    "condition" TEXT NOT NULL DEFAULT 'healthy',
    "currentAssignmentId" TEXT,
    "deckId" TEXT,
    "planetId" TEXT,
    "structureKey" TEXT,
    "shipId" TEXT,
    "equippedToInstanceId" TEXT,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastStateChangeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CardInstance_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Assignment" ADD COLUMN "cardInstanceId" TEXT;
ALTER TABLE "Planet" ADD COLUMN "crewCardInstanceId" TEXT;

CREATE INDEX "CardInstance_userId_defId_idx" ON "CardInstance"("userId", "defId");
CREATE INDEX "CardInstance_userId_status_location_idx" ON "CardInstance"("userId", "status", "location");
CREATE INDEX "CardInstance_userId_condition_idx" ON "CardInstance"("userId", "condition");
CREATE INDEX "CardInstance_userId_currentAssignmentId_idx" ON "CardInstance"("userId", "currentAssignmentId");
CREATE INDEX "CardInstance_userId_deckId_idx" ON "CardInstance"("userId", "deckId");
CREATE INDEX "CardInstance_userId_planetId_idx" ON "CardInstance"("userId", "planetId");
CREATE INDEX "Assignment_userId_cardInstanceId_status_idx" ON "Assignment"("userId", "cardInstanceId", "status");
CREATE INDEX "Planet_userId_crewCardInstanceId_idx" ON "Planet"("userId", "crewCardInstanceId");

ALTER TABLE "CardInstance" ADD CONSTRAINT "CardInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
