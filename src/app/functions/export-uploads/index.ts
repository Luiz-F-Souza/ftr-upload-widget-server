import { PassThrough, Transform } from "node:stream"
import { pipeline } from "node:stream/promises"
import { stringify } from "csv-stringify"
import { ilike } from "drizzle-orm"
import z from "zod"
import { db, pg } from "@/infra/db"
import { uploads } from "@/infra/db/schemas"
import { uploadFileToStorage } from "@/infra/storage/upload/file-to-storage"
import { type Either, makeRight } from "@/sharad/either"

type ResponseType = {
	reportUrl: string
}

const schema = z.object({
	searchQuery: z.string().optional(),
})

type Props = z.input<typeof schema>

// Made for hot endpoints where we can have a lot of data, like 100k of rows to write.
export async function exportUploads(
	props: Props
): Promise<Either<never, ResponseType>> {
	const { searchQuery } = schema.parse(props)

	const { sql, params } = db
		.select({
			id: uploads.id,
			name: uploads.name,
			remoteUrl: uploads.remoteUrl,
			createdAt: uploads.createdAt,
		})
		.from(uploads)
		.where(searchQuery ? ilike(uploads.name, `%${searchQuery}%`) : undefined)
		.toSQL()

	const cursor = pg.unsafe(sql, params as string[]).cursor(50)

	const csv = stringify({
		delimiter: ",",
		header: true,
		columns: [
			{ key: "id", header: "ID" },
			{ key: "name", header: "Name" },
			{ key: "remote_url", header: "Remote URL" },
			{ key: "created_at", header: "Created At" },
		],
	})

	const uploadToStorageStream = new PassThrough()

	const convertToCsvPipeline = pipeline(
		cursor,
		// Needed so we get 1 row per transform instead of a lot of data in same row when it comesto the csv stream writter.
		new Transform({
			// So we get the object instead of buffer
			objectMode: true,
			transform(chunks: unknown[], encoding, callback) {
				for (const row of chunks) {
					// this.push pushes to the output of the transform stream.
					this.push(row)
				}
				// Informs that we're done with our transform phase.
				callback()
			},
		}),
		csv,
		uploadToStorageStream
	)

	const uploadToStorage = uploadFileToStorage({
		contentType: "text/csv",
		folder: "downloads",
		fileName: `${new Date().toISOString()}-uploads.csv`,
		contentStream: uploadToStorageStream,
	})

	const [{ url }] = await Promise.all([uploadToStorage, convertToCsvPipeline])

	return makeRight({ reportUrl: url })
}
