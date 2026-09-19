ALTER TABLE "User" ADD COLUMN "professionalEmail" TEXT;
CREATE UNIQUE INDEX "User_professionalEmail_key" ON "User"("professionalEmail");
