-- CreateTable
CREATE TABLE "public"."materials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "public"."Category" NOT NULL,
    "description" TEXT,
    "author_id" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."materials" ADD CONSTRAINT "materials_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
