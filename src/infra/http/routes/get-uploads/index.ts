import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"
import { getUploads } from "@/app/functions/get-uploads"

import { unwrapEither } from "@/sharad/either"

export const getUploadsRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/uploads",
		{
			schema: {
				summary: "Get uploads",
				description: "Endpoint to get uploaded files",
				tags: ["Uploads"],
				querystring: z.object({
					searchQuery: z.string().optional(),
					sortBy: z.enum(["createdAt"]).optional(),
					sortDirection: z.enum(["asc", "desc"]).optional(),
					page: z.coerce.number().optional().default(1),
					pageSize: z.coerce.number().optional().default(20),
				}),
				response: {
					200: z.object({
						uploads: z.array(
							z.object({
								id: z.string(),
								name: z.string(),
								remoteKey: z.string(),
								remoteUrl: z.string(),
								createdAt: z.date(),
							})
						),
						total: z.number(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { page, pageSize, searchQuery, sortBy, sortDirection } =
				request.query

			const result = await getUploads({
				page,
				pageSize,
				searchQuery,
				sortBy,
				sortDirection,
			})

			const data = unwrapEither(result)

			reply.status(200).send({ uploads: data.uploads, total: data.total })
		}
	)
}
