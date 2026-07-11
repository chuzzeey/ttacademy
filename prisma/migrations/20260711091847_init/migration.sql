-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "employment_status" TEXT NOT NULL,
    "has_laptop" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'Not Paid',
    "reg_date" TEXT NOT NULL,
    "reg_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);
