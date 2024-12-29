import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().positive()),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>; 