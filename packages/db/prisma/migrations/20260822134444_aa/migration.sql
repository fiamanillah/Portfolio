-- CreateEnum
CREATE TYPE "SkillStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED');

-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "ordinal" TEXT DEFAULT '01',
    "suffix" TEXT DEFAULT 'ST',
    "icon" TEXT,
    "color" TEXT DEFAULT 'blue',
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "SkillStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "leftLabel" TEXT,
    "rightLabel" TEXT,
    "level" INTEGER NOT NULL DEFAULT 5,
    "icon" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "SkillStatus" NOT NULL DEFAULT 'PUBLISHED',
    "categoryId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleCalendarAccount" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleCalendarAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAvailability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "bufferTime" INTEGER NOT NULL DEFAULT 15,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestNotes" TEXT,
    "meetingType" TEXT NOT NULL DEFAULT '1-on-1 Consultation',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "googleEventId" TEXT,
    "googleMeetLink" TEXT,
    "cancellationToken" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_slug_key" ON "SkillCategory"("slug");

-- CreateIndex
CREATE INDEX "SkillCategory_slug_idx" ON "SkillCategory"("slug");

-- CreateIndex
CREATE INDEX "SkillCategory_status_order_idx" ON "SkillCategory"("status", "order");

-- CreateIndex
CREATE INDEX "Skill_categoryId_idx" ON "Skill"("categoryId");

-- CreateIndex
CREATE INDEX "Skill_status_order_idx" ON "Skill"("status", "order");

-- CreateIndex
CREATE INDEX "Skill_featured_idx" ON "Skill"("featured");

-- CreateIndex
CREATE INDEX "Skill_createdAt_idx" ON "Skill"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarAccount_userId_key" ON "GoogleCalendarAccount"("userId");

-- CreateIndex
CREATE INDEX "GoogleCalendarAccount_userId_idx" ON "GoogleCalendarAccount"("userId");

-- CreateIndex
CREATE INDEX "BookingAvailability_dayOfWeek_isActive_idx" ON "BookingAvailability"("dayOfWeek", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BookingAvailability_dayOfWeek_key" ON "BookingAvailability"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_googleEventId_key" ON "Booking"("googleEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_cancellationToken_key" ON "Booking"("cancellationToken");

-- CreateIndex
CREATE INDEX "Booking_startTime_endTime_idx" ON "Booking"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "Booking_guestEmail_idx" ON "Booking"("guestEmail");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_cancellationToken_idx" ON "Booking"("cancellationToken");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendarAccount" ADD CONSTRAINT "GoogleCalendarAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
