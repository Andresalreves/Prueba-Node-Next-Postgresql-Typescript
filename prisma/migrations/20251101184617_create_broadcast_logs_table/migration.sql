-- CreateTable
CREATE TABLE "BroadcastLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inboundMsg" TEXT NOT NULL,
    "aiGeneratedCopy" TEXT,
    "aiGeneratedImage" TEXT,
    "outboundStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BroadcastLog_pkey" PRIMARY KEY ("id")
);
