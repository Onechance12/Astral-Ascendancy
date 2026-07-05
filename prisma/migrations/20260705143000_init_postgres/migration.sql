-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commander" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "influence" INTEGER NOT NULL DEFAULT 0,
    "shards" INTEGER NOT NULL DEFAULT 0,
    "seasonXp" INTEGER NOT NULL DEFAULT 0,
    "seasonTier" INTEGER NOT NULL DEFAULT 0,
    "collectionLevel" INTEGER NOT NULL DEFAULT 0,
    "pityCounter" INTEGER NOT NULL DEFAULT 0,
    "premiumPass" BOOLEAN NOT NULL DEFAULT false,
    "plasma" INTEGER NOT NULL DEFAULT 0,
    "biomass" INTEGER NOT NULL DEFAULT 0,
    "crystals" INTEGER NOT NULL DEFAULT 0,
    "tritium" INTEGER NOT NULL DEFAULT 0,
    "quantumCores" INTEGER NOT NULL DEFAULT 0,
    "lastHarvest" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeDeckId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commander_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commanderName" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "enemyName" TEXT NOT NULL,
    "enemyFactionId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "turns" INTEGER NOT NULL,
    "playerHpLeft" INTEGER NOT NULL,
    "enemyHpLeft" INTEGER NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'conquest',
    "difficulty" TEXT NOT NULL DEFAULT 'normal',
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dropCardDefId" TEXT,
    "shardsEarned" INTEGER NOT NULL DEFAULT 0,
    "seasonXpEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MatchRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "cardDefIds" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "format" TEXT NOT NULL DEFAULT 'standard',
    "powerScore" INTEGER NOT NULL DEFAULT 0,
    "powerTier" TEXT NOT NULL DEFAULT 'starter',
    "powerVersion" TEXT NOT NULL DEFAULT 'pvp-v1',
    "pvpLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "assetType" TEXT NOT NULL,
    "cardDefId" TEXT,
    "deckId" TEXT,
    "planetId" TEXT,
    "description" TEXT,
    "rewardsJson" TEXT NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completesAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckLicense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "deckTier" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 1,
    "unlockedAt" TIMESTAMP(3),
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeckLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastClaimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardInbox" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rewardJson" TEXT NOT NULL DEFAULT '{}',
    "revealType" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'ready',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "RewardInbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpRank" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "season" TEXT NOT NULL DEFAULT 'alpha',
    "queueType" TEXT NOT NULL DEFAULT 'ranked',
    "tier" TEXT NOT NULL,
    "rankName" TEXT NOT NULL DEFAULT 'Bronze Orbit',
    "division" INTEGER NOT NULL DEFAULT 5,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "peakRating" INTEGER NOT NULL DEFAULT 1000,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PvpRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpQueueEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "powerScore" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "matchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "matchedAt" TIMESTAMP(3),

    CONSTRAINT "PvpQueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpMatch" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL DEFAULT 'alpha',
    "queueType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "playerAId" TEXT NOT NULL,
    "playerBId" TEXT NOT NULL,
    "playerADeckId" TEXT NOT NULL,
    "playerBDeckId" TEXT NOT NULL,
    "playerAPower" INTEGER NOT NULL,
    "playerBPower" INTEGER NOT NULL,
    "playerARatingBefore" INTEGER NOT NULL DEFAULT 1000,
    "playerBRatingBefore" INTEGER NOT NULL DEFAULT 1000,
    "playerARatingAfter" INTEGER,
    "playerBRatingAfter" INTEGER,
    "winnerUserId" TEXT,
    "resultReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "PvpMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PvpMatchInvite" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "deckId" TEXT,
    "ruleSet" TEXT NOT NULL DEFAULT 'tier_cap',
    "tierCap" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "PvpMatchInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tribe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "emblemGlyph" TEXT NOT NULL DEFAULT '✦',
    "factionBanner" TEXT,
    "privacy" TEXT NOT NULL DEFAULT 'invite',
    "founderId" TEXT NOT NULL,
    "memberLimit" INTEGER NOT NULL DEFAULT 50,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "influence" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tribe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TribeMember" (
    "id" TEXT NOT NULL,
    "tribeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "contribution" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TribeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TribeMission" (
    "id" TEXT NOT NULL,
    "tribeId" TEXT NOT NULL,
    "season" TEXT NOT NULL DEFAULT 'alpha',
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "reward" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "TribeMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL DEFAULT 'drop',
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rewardShards" INTEGER NOT NULL DEFAULT 0,
    "rewardCardDefId" TEXT,
    "rewardPackRarity" TEXT,
    "factionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "outro" TEXT NOT NULL,
    "enemyName" TEXT NOT NULL,
    "enemyFactionId" TEXT NOT NULL,
    "enemyDeckIds" TEXT NOT NULL,
    "enemyHp" INTEGER NOT NULL DEFAULT 12,
    "rewardCardDefIds" TEXT NOT NULL,
    "rewardShards" INTEGER NOT NULL DEFAULT 0,
    "rewardQuestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CampaignProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lore" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "factionId" TEXT,
    "rewardCardDefIds" TEXT NOT NULL,
    "rewardShards" INTEGER NOT NULL DEFAULT 0,
    "rewardCommanderTitle" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planetType" TEXT NOT NULL,
    "sector" TEXT NOT NULL DEFAULT 'home',
    "slot" INTEGER NOT NULL,
    "structureType" TEXT,
    "structureLevel" INTEGER NOT NULL DEFAULT 0,
    "lastCollect" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceCardDefId" TEXT,
    "crewCardDefId" TEXT,
    "crewAssignedAt" TIMESTAMP(3),

    CONSTRAINT "Planet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "devCardDefId" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevelopmentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureDef" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "glyph" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseRate" INTEGER NOT NULL,
    "baseCostShards" INTEGER NOT NULL,
    "baseCostResource" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StructureDef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Commander_userId_key" ON "Commander"("userId");

-- CreateIndex
CREATE INDEX "Deck_userId_idx" ON "Deck"("userId");

-- CreateIndex
CREATE INDEX "Deck_userId_powerTier_idx" ON "Deck"("userId", "powerTier");

-- CreateIndex
CREATE INDEX "Assignment_userId_status_completesAt_idx" ON "Assignment"("userId", "status", "completesAt");

-- CreateIndex
CREATE INDEX "Assignment_userId_deckId_status_idx" ON "Assignment"("userId", "deckId", "status");

-- CreateIndex
CREATE INDEX "Assignment_userId_cardDefId_status_idx" ON "Assignment"("userId", "cardDefId", "status");

-- CreateIndex
CREATE INDEX "Assignment_userId_planetId_status_idx" ON "Assignment"("userId", "planetId", "status");

-- CreateIndex
CREATE INDEX "DeckLicense_userId_deckTier_idx" ON "DeckLicense"("userId", "deckTier");

-- CreateIndex
CREATE UNIQUE INDEX "DeckLicense_userId_licenseId_key" ON "DeckLicense"("userId", "licenseId");

-- CreateIndex
CREATE UNIQUE INDEX "LoginStreak_userId_key" ON "LoginStreak"("userId");

-- CreateIndex
CREATE INDEX "RewardInbox_userId_status_createdAt_idx" ON "RewardInbox"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "RewardInbox_userId_sourceType_sourceId_idx" ON "RewardInbox"("userId", "sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardInbox_userId_sourceType_sourceId_key" ON "RewardInbox"("userId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "PvpRank_tier_rating_idx" ON "PvpRank"("tier", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "PvpRank_userId_season_queueType_tier_key" ON "PvpRank"("userId", "season", "queueType", "tier");

-- CreateIndex
CREATE INDEX "PvpQueueEntry_queueType_tier_status_rating_idx" ON "PvpQueueEntry"("queueType", "tier", "status", "rating");

-- CreateIndex
CREATE INDEX "PvpQueueEntry_userId_status_idx" ON "PvpQueueEntry"("userId", "status");

-- CreateIndex
CREATE INDEX "PvpMatch_queueType_tier_status_idx" ON "PvpMatch"("queueType", "tier", "status");

-- CreateIndex
CREATE INDEX "PvpMatch_playerAId_createdAt_idx" ON "PvpMatch"("playerAId", "createdAt");

-- CreateIndex
CREATE INDEX "PvpMatch_playerBId_createdAt_idx" ON "PvpMatch"("playerBId", "createdAt");

-- CreateIndex
CREATE INDEX "PvpMatchInvite_recipientId_status_idx" ON "PvpMatchInvite"("recipientId", "status");

-- CreateIndex
CREATE INDEX "PvpMatchInvite_senderId_status_idx" ON "PvpMatchInvite"("senderId", "status");

-- CreateIndex
CREATE INDEX "Friend_addresseeId_status_idx" ON "Friend"("addresseeId", "status");

-- CreateIndex
CREATE INDEX "Friend_requesterId_status_idx" ON "Friend"("requesterId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_requesterId_addresseeId_key" ON "Friend"("requesterId", "addresseeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tribe_slug_key" ON "Tribe"("slug");

-- CreateIndex
CREATE INDEX "Tribe_founderId_idx" ON "Tribe"("founderId");

-- CreateIndex
CREATE INDEX "TribeMember_userId_idx" ON "TribeMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TribeMember_tribeId_userId_key" ON "TribeMember"("tribeId", "userId");

-- CreateIndex
CREATE INDEX "TribeMission_tribeId_active_idx" ON "TribeMission"("tribeId", "active");

-- CreateIndex
CREATE INDEX "UserCard_userId_idx" ON "UserCard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_userId_defId_key" ON "UserCard"("userId", "defId");

-- CreateIndex
CREATE INDEX "UserQuest_userId_idx" ON "UserQuest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuest_userId_questId_assignedAt_key" ON "UserQuest"("userId", "questId", "assignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_factionId_chapter_key" ON "Campaign"("factionId", "chapter");

-- CreateIndex
CREATE INDEX "CampaignProgress_userId_idx" ON "CampaignProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignProgress_userId_campaignId_key" ON "CampaignProgress"("userId", "campaignId");

-- CreateIndex
CREATE INDEX "OperationProgress_userId_idx" ON "OperationProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationProgress_userId_operationId_key" ON "OperationProgress"("userId", "operationId");

-- CreateIndex
CREATE INDEX "Planet_userId_idx" ON "Planet"("userId");

-- CreateIndex
CREATE INDEX "DevelopmentProgress_userId_idx" ON "DevelopmentProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentProgress_userId_devCardDefId_key" ON "DevelopmentProgress"("userId", "devCardDefId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureDef_type_key" ON "StructureDef"("type");

-- AddForeignKey
ALTER TABLE "Commander" ADD CONSTRAINT "Commander_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRecord" ADD CONSTRAINT "MatchRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckLicense" ADD CONSTRAINT "DeckLicense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginStreak" ADD CONSTRAINT "LoginStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardInbox" ADD CONSTRAINT "RewardInbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpRank" ADD CONSTRAINT "PvpRank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpQueueEntry" ADD CONSTRAINT "PvpQueueEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpMatch" ADD CONSTRAINT "PvpMatch_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpMatch" ADD CONSTRAINT "PvpMatch_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpMatchInvite" ADD CONSTRAINT "PvpMatchInvite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PvpMatchInvite" ADD CONSTRAINT "PvpMatchInvite_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tribe" ADD CONSTRAINT "Tribe_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TribeMember" ADD CONSTRAINT "TribeMember_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "Tribe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TribeMember" ADD CONSTRAINT "TribeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TribeMission" ADD CONSTRAINT "TribeMission_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "Tribe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProgress" ADD CONSTRAINT "CampaignProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProgress" ADD CONSTRAINT "CampaignProgress_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationProgress" ADD CONSTRAINT "OperationProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationProgress" ADD CONSTRAINT "OperationProgress_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentProgress" ADD CONSTRAINT "DevelopmentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
