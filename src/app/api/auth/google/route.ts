import { google } from "googleapis";
import { NextResponse } from "next/server";

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CID,
  clientSecret: process.env.GOOGLE_CS,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

export async function GET() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
    prompt: "consent",
  });

  console.log("AUTH URL : ", authUrl);

  return NextResponse.redirect(authUrl);
}

// export async function POST(req) {
//   const { code } = await req.json();
//   const { tokens } = await oAuth2Client.getToken(code);
//   oAuth2Client.setCredentials(tokens);

//   const accessToken = tokens.access_token;

//   const transport = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       type: 'OAuth2',
//       user: process.env.GOOGLE_USER_EMAIL,
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       refreshToken: tokens.refresh_token,
//       accessToken,
//     },
//   });

//   const mailOptions = {
//     from: process.env.GOOGLE_USER_EMAIL,
//     to: 'recipient@example.com',
//     subject: 'Test Email from Next.js',
//     text: 'Hello from Gmail!',
//   };

//   await transport.sendMail(mailOptions);

//   return new Response('Email sent successfully!');
// }
