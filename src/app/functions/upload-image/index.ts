import { Readable } from "node:stream"
import z from "zod"
import { db } from "@/infra/db"
import { uploads } from "@/infra/db/schemas"

const schema = z.object({
	fileName: z.string(),
	contentType: z.string(),
	contentStream: z.instanceof(Readable),
})

type Props = z.input<typeof schema>

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]

export async function uploadImage(props: Props) {
	const { contentStream, contentType, fileName } = schema.parse(props)

	if (!allowedMimeTypes.includes(contentType)) {
		throw new Error("Invalid file type")
	}

	await db.insert(uploads).values({
		name: fileName,
		remoteKey: "",
    remoteUrl: "",
	})
}
