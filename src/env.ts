import { z } from "zod"

const envSchema = z.object({
	DATABASE_URL: z.url(),
	NODE_ENV: z.enum(["development", "test", "production"]),
	PORT: z.string().transform(value => parseInt(value, 10)),
})

export const env = envSchema.parse(process.env)
