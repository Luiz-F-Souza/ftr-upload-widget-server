import { z } from "zod"

const envSchema = z.object({
	DATABASE_URL: z.url(),
	NODE_ENV: z.enum(["development", "test", "production"]),
	PORT: z.string().transform((value) => parseInt(value, 10)),
	CLOUDFLARE_ACCOUNT_ID: z.string(),
	CLOUDFLARE_ACCESS_KEY_ID: z.string(),
	CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
	CLOUDFLARE_BUCKET: z.string(),
	CLOUDFLARE_PUBLIC_URL: z.url(),
})

export const env = envSchema.parse(process.env)
