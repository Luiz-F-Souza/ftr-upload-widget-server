import { randomUUID } from "node:crypto"
import { basename, extname } from "node:path"
import { Readable } from "node:stream"
import { Upload } from "@aws-sdk/lib-storage"
import z from "zod"
import { env } from "@/env"
import { r2 } from "../client"

const schema = z.object({
	folder: z.enum(["images", "downloads"]),
	fileName: z.string(),
	contentType: z.string(),
	contentStream: z.instanceof(Readable),
})

type Props = z.input<typeof schema>

export async function uploadFileToStorage(props: Props) {
	const { contentStream, contentType, fileName, folder } = schema.parse(props)

	const sanitizedFileName = sanitizeFileName({ fileName })

	const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileName}`

	const upload = new Upload({
		client: r2,
		params: {
			Key: uniqueFileName,
			Bucket: env.CLOUDFLARE_BUCKET,
			Body: contentStream,
			ContentType: contentType,
		},
	})

	await upload.done()

	return {
		key: uniqueFileName,
		url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).toString(),
	}
}

type SanitizeProps = {
	fileName: string
}
const sanitizeFileName = ({ fileName }: SanitizeProps) => {
	const fileExtension = extname(fileName)
	const fileNameWithoutExtension = basename(fileName)

	const sanitazedFileName = fileNameWithoutExtension.replace(
		/[^a-zA-Z0-9]/g,
		""
	)
	const sanitizedFileNameWithExtension = sanitazedFileName.concat(fileExtension)

	return sanitizedFileNameWithExtension
}
