CREATE TABLE "ScreeningFinding" (
    "id" TEXT NOT NULL,
    "screeningId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "severity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningFinding_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScreeningFinding_screeningId_code_key" ON "ScreeningFinding"("screeningId", "code");
CREATE INDEX "ScreeningFinding_code_idx" ON "ScreeningFinding"("code");

ALTER TABLE "ScreeningFinding"
ADD CONSTRAINT "ScreeningFinding_screeningId_fkey"
FOREIGN KEY ("screeningId") REFERENCES "Screening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
