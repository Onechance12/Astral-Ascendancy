-- CreateTable
CREATE TABLE "Headquarters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "homeworldName" TEXT NOT NULL,
    "homeworldType" TEXT NOT NULL,
    "doctrine" TEXT NOT NULL DEFAULT 'balanced',
    "capitalLevel" INTEGER NOT NULL DEFAULT 1,
    "commandLevel" INTEGER NOT NULL DEFAULT 1,
    "infirmaryLevel" INTEGER NOT NULL DEFAULT 0,
    "trainingLevel" INTEGER NOT NULL DEFAULT 0,
    "researchLevel" INTEGER NOT NULL DEFAULT 0,
    "engineeringLevel" INTEGER NOT NULL DEFAULT 0,
    "hangarLevel" INTEGER NOT NULL DEFAULT 0,
    "securityLevel" INTEGER NOT NULL DEFAULT 1,
    "morale" INTEGER NOT NULL DEFAULT 50,
    "stability" INTEGER NOT NULL DEFAULT 50,
    "alertLevel" TEXT NOT NULL DEFAULT 'calm',
    "activeProjectKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Headquarters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Headquarters_userId_key" ON "Headquarters"("userId");

-- CreateIndex
CREATE INDEX "Headquarters_userId_homeworldType_idx" ON "Headquarters"("userId", "homeworldType");

-- CreateIndex
CREATE INDEX "Headquarters_userId_doctrine_idx" ON "Headquarters"("userId", "doctrine");

-- AddForeignKey
ALTER TABLE "Headquarters" ADD CONSTRAINT "Headquarters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
