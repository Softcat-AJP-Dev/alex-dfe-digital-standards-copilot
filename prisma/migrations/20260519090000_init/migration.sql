-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateTable
CREATE TABLE "app"."School" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "urn" TEXT,
    "phase" TEXT,
    "localAuthority" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByOid" TEXT,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."StandardCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."StandardCriterion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "categoryId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "guidance" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandardCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Assessment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "schoolId" UUID NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "assessorEmail" TEXT,
    "assessorOid" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."AssessmentResponse" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessmentId" UUID NOT NULL,
    "criterionId" UUID NOT NULL,
    "maturityLevel" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_urn_key" ON "app"."School"("urn");

-- CreateIndex
CREATE UNIQUE INDEX "StandardCategory_slug_key" ON "app"."StandardCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StandardCriterion_slug_key" ON "app"."StandardCriterion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResponse_assessmentId_criterionId_key" ON "app"."AssessmentResponse"("assessmentId", "criterionId");

-- AddForeignKey
ALTER TABLE "app"."StandardCriterion" ADD CONSTRAINT "StandardCriterion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "app"."StandardCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Assessment" ADD CONSTRAINT "Assessment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "app"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "app"."Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "app"."StandardCriterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
