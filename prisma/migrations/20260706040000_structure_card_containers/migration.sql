-- CreateTable
CREATE TABLE "StructureInstance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "slot" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "integrity" INTEGER NOT NULL DEFAULT 100,
    "maxIntegrity" INTEGER NOT NULL DEFAULT 100,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "sourceCardDefId" TEXT,
    "sourceCardInstanceId" TEXT,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StructureInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StructureInstance_planetId_type_key" ON "StructureInstance"("planetId", "type");

-- CreateIndex
CREATE INDEX "StructureInstance_userId_status_idx" ON "StructureInstance"("userId", "status");

-- CreateIndex
CREATE INDEX "StructureInstance_userId_planetId_idx" ON "StructureInstance"("userId", "planetId");

-- AddForeignKey
ALTER TABLE "StructureInstance" ADD CONSTRAINT "StructureInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureInstance" ADD CONSTRAINT "StructureInstance_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
