import { asc, count, desc, ilike } from "drizzle-orm"
import z from "zod"
import { db } from "@/infra/db"
import { uploads } from "@/infra/db/schemas"
import { type Either, makeRight } from "@/sharad/either"

type ResponseType = {
	uploads: {
		id: string
		name: string
		remoteKey: string
		remoteUrl: string
		createdAt: Date
	}[]
	total: number
}

const schema = z.object({
	searchQuery: z.string().optional(),
	sortBy: z.enum(["createdAt"]).optional(),
	sortDirection: z.enum(["asc", "desc"]).optional(),
	page: z.number().optional().default(1),
	pageSize: z.number().optional().default(20),
})

type Props = z.input<typeof schema>

export async function getUploads(
	props: Props
): Promise<Either<never, ResponseType>> {
	const { page, pageSize, searchQuery, sortDirection, sortBy } =
		schema.parse(props)

	const dataPromise = db
		.select({
			id: uploads.id,
			name: uploads.name,
			remoteKey: uploads.remoteKey,
			remoteUrl: uploads.remoteUrl,
			createdAt: uploads.createdAt,
		})
		.from(uploads)
		.where(searchQuery ? ilike(uploads.name, `%${searchQuery}%`) : undefined)
		.orderBy((fields) => {
			if (sortBy && sortDirection === "asc") {
				return asc(fields[sortBy])
			}

			if (sortBy && sortDirection === "desc") {
				return desc(fields[sortBy])
			}

			return desc(fields.id)
		})
		.offset((page - 1) * pageSize)
		.limit(pageSize)

	const totalPagesPromise = db
		.select({ total: count(uploads.id) })
		.from(uploads)
		.where(searchQuery ? ilike(uploads.name, `%${searchQuery}%`) : undefined)

	const [data, [{ total }]] = await Promise.all([
		dataPromise,
		totalPagesPromise,
	])

	return makeRight({ uploads: data, total })
}
