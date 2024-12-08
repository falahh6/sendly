const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function main() {
  // Generate a UUID for the user
  const userId = uuidv4();

  // Create a User
  const user = await prisma.user.create({
    data: {
      id: userId, // Use the generated UUID
      name: "John Doe",
      email: "john.doe@example.com",
      password: "securepassword", // Make sure to hash passwords in production
      emailVerified: true,
      authToken: "exampleAuthToken123",
      verificationToken: "exampleVerificationToken123",
    },
  });

  console.log("User created:", user);

  // Create Google Integration
  const googleIntegration = await prisma.integration.create({
    data: {
      name: "Google",
      profile: {
        name: "John Doe",
        email: "john.doe@gmail.com",
        id: "google123",
      },
      accessToken: "googleAccessToken123",
      refreshToken: "googleRefreshToken123",
      provider: "Google",
      userId: user.id,
    },
  });

  console.log("Google Integration created:", googleIntegration);

  // Create Outlook Integration
  const outlookIntegration = await prisma.integration.create({
    data: {
      name: "Outlook",
      profile: {
        name: "John Doe",
        email: "john.doe@outlook.com",
        id: "outlook123",
      },
      accessToken: "outlookAccessToken123",
      refreshToken: "outlookRefreshToken123",
      provider: "Outlook",
      userId: user.id,
    },
  });

  console.log("Outlook Integration created:", outlookIntegration);
}

// Run the seeding script
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
