import { z } from 'zod';

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, "Firebase API Key is missing"),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, "Firebase Auth Domain is missing"),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, "Firebase Project ID is missing"),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, "Firebase Storage Bucket is missing"),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "Firebase Messaging Sender ID is missing"),
  VITE_FIREBASE_APP_ID: z.string().min(1, "Firebase App ID is missing"),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse({
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment variable validation failed:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    // In a browser environment, throw to activate Error Boundary early
    throw new Error("Missing required Firebase environment variables. Check console for details.");
  }
  throw error;
}

export { env };
