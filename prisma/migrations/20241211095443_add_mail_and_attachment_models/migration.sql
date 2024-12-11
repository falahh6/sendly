-- CreateTable
CREATE TABLE "mails" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT[],
    "cc" TEXT[],
    "bcc" TEXT[],
    "date" TIMESTAMP(3),
    "subject" TEXT NOT NULL,
    "messageId" TEXT,
    "replyTo" TEXT,
    "snippet" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "plainTextMessage" TEXT,
    "htmlMessage" TEXT,
    "labelIds" TEXT[],
    "priorityGrade" TEXT NOT NULL,
    "categorization" JSONB,
    "sentimentScore" DOUBLE PRECISION,
    "privacyCompliant" BOOLEAN,
    "category" TEXT,
    "integrationId" INTEGER NOT NULL,

    CONSTRAINT "mails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" TEXT,
    "mailId" TEXT NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "mails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
