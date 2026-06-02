import { Readable } from "node:stream"
import z from "zod"
import { db } from "@/infra/db"
import { uploads } from "@/infra/db/schemas"
import { uploadFileToStorage } from "@/infra/storage/upload/file-to-storage"
import { type Either, makeLeft, makeRight } from "@/sharad/either"
import { InvalidFileFormat } from "../errors/invalid-file-format"

const schema = z.object({
	fileName: z.string(),
	contentType: z.string(),
	contentStream: z.instanceof(Readable),
})

type Props = z.input<typeof schema>

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]

export async function uploadImage(
	props: Props
): Promise<Either<InvalidFileFormat, { url: string }>> {
	const { contentStream, contentType, fileName } = schema.parse(props)

	if (!allowedMimeTypes.includes(contentType)) {
		return makeLeft(new InvalidFileFormat())
	}

	const { key, url } = await uploadFileToStorage({
		folder: "images",
		contentStream,
		contentType,
		fileName,
	})

	await db.insert(uploads).values({
		name: fileName,
		remoteKey: key,
		remoteUrl: url,
	})

	return makeRight({ url })
}
