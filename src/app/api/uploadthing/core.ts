import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";

const f = createUploadthing();

export const ourFileRouter = {
  emailAttachments: f(["text", "image", "pdf"])
    .middleware(async () => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.email) throw new Error("Unauthorized");

      return { userId: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`File uploaded by ${metadata.userId}:`, file.ufsUrl);
      return { fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
