-- CreateIndex
CREATE INDEX "qr_codes_userId_status_idx" ON "qr_codes"("userId", "status");

-- CreateIndex
CREATE INDEX "qr_codes_createdAt_idx" ON "qr_codes"("createdAt");

-- CreateIndex
CREATE INDEX "scans_country_idx" ON "scans"("country");
