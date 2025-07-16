import * as admin from "firebase-admin";

let serverApp: admin.app.App;

if (admin.apps.length === 0) {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_PROJECT_ID environment variable is required");
  }
  if (process.env.FIREBASE_PRIVATE_KEY)
    serverApp = admin.initializeApp({
      projectId: projectId,
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
} else {
  serverApp = admin.app();
}

export { serverApp };
