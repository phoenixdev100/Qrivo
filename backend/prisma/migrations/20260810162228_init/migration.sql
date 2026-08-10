-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "QRType" AS ENUM ('URL', 'TEXT', 'EMAIL', 'PHONE', 'WIFI', 'WHATSAPP', 'CONTACT', 'LOCATION', 'EVENT');

-- CreateEnum
CREATE TYPE "QRStatus" AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED', 'DELETED');

-- CreateEnum
CREATE TYPE "WifiEncryption" AS ENUM ('WPA', 'WEP', 'NOPASS');

-- CreateEnum
CREATE TYPE "PatternStyle" AS ENUM ('SQUARE', 'DOTS', 'ROUNDED');

-- CreateEnum
CREATE TYPE "EyeStyle" AS ENUM ('SQUARE', 'CIRCLE', 'ROUNDED');

-- CreateEnum
CREATE TYPE "ErrorCorrection" AS ENUM ('L', 'M', 'Q', 'H');

-- CreateEnum
CREATE TYPE "FrameStyle" AS ENUM ('NONE', 'SIMPLE', 'ROUNDED', 'BANNER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "QRType" NOT NULL,
    "status" "QRStatus" NOT NULL DEFAULT 'ACTIVE',
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_contents" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "url" TEXT,
    "text" TEXT,
    "email" TEXT,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "phone" TEXT,
    "wifiSsid" TEXT,
    "wifiPassword" TEXT,
    "wifiEncryption" "WifiEncryption",
    "wifiHidden" BOOLEAN DEFAULT false,
    "waNumber" TEXT,
    "waMessage" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "organization" TEXT,
    "jobTitle" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactUrl" TEXT,
    "contactAddress" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "eventTitle" TEXT,
    "eventDescription" TEXT,
    "eventLocation" TEXT,
    "eventStart" TIMESTAMP(3),
    "eventEnd" TIMESTAMP(3),

    CONSTRAINT "qr_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_customizations" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "foregroundColor" TEXT NOT NULL DEFAULT '#0F172A',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "patternStyle" "PatternStyle" NOT NULL DEFAULT 'SQUARE',
    "eyeStyle" "EyeStyle" NOT NULL DEFAULT 'SQUARE',
    "size" INTEGER NOT NULL DEFAULT 512,
    "margin" INTEGER NOT NULL DEFAULT 2,
    "errorCorrection" "ErrorCorrection" NOT NULL DEFAULT 'M',
    "frameStyle" "FrameStyle" NOT NULL DEFAULT 'NONE',
    "frameText" TEXT,

    CONSTRAINT "qr_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceType" TEXT,
    "browser" TEXT,
    "operatingSystem" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "visitorHash" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "folders_userId_idx" ON "folders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_code_key" ON "qr_codes"("code");

-- CreateIndex
CREATE INDEX "qr_codes_userId_idx" ON "qr_codes"("userId");

-- CreateIndex
CREATE INDEX "qr_codes_folderId_idx" ON "qr_codes"("folderId");

-- CreateIndex
CREATE INDEX "qr_codes_code_idx" ON "qr_codes"("code");

-- CreateIndex
CREATE INDEX "qr_codes_status_idx" ON "qr_codes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "qr_contents_qrCodeId_key" ON "qr_contents"("qrCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_customizations_qrCodeId_key" ON "qr_customizations"("qrCodeId");

-- CreateIndex
CREATE INDEX "scans_qrCodeId_idx" ON "scans"("qrCodeId");

-- CreateIndex
CREATE INDEX "scans_scannedAt_idx" ON "scans"("scannedAt");

-- CreateIndex
CREATE INDEX "scans_qrCodeId_scannedAt_idx" ON "scans"("qrCodeId", "scannedAt");

-- CreateIndex
CREATE INDEX "scans_visitorHash_idx" ON "scans"("visitorHash");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_contents" ADD CONSTRAINT "qr_contents_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_customizations" ADD CONSTRAINT "qr_customizations_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
