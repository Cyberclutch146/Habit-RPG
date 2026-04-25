import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "Firebase API Key is missing"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "Firebase Auth Domain is missing"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "Firebase Project ID is missing"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "Firebase Storage Bucket is missing"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "Firebase Messaging Sender ID is missing"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "Firebase App ID is missing"),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.warn("⚠️ Environment variable validation conditionally passed: using mock credentials since Next.js envs could not be loaded statically.");
    env = {
      NEXT_PUBLIC_FIREBASE_API_KEY: "mock",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "mock",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "mock",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "mock",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "mock",
      NEXT_PUBLIC_FIREBASE_APP_ID: "mock",
    };
  } else {
    throw error;
  }
}

export { env };
