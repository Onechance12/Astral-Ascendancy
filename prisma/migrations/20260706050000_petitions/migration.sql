-- Phase 6: durable command petitions generated from real player state.
CREATE TABLE "Petition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'neutral',
    "status" TEXT NOT NULL DEFAULT 'open',
    "actionType" TEXT NOT NULL,
    "actionPayloadJson" TEXT NOT NULL DEFAULT '{}',
    "priority" INTEGER NOT NULL DEFAULT 50,
    "generatedKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Petition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Petition_userId_generatedKey_key" ON "Petition"("userId", "generatedKey");
CREATE INDEX "Petition_userId_status_priority_idx" ON "Petition"("userId", "status", "priority");
CREATE INDEX "Petition_userId_sourceType_sourceId_idx" ON "Petition"("userId", "sourceType", "sourceId");

ALTER TABLE "Petition" ADD CONSTRAINT "Petition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
