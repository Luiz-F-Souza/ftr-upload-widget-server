import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"
import { exportUploads } from "@/app/functions/export-uploads"
import { unwrapEither } from "@/sharad/either"

export const exportUploadsRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/uploads/exports",
		{
			schema: {
				summary: "Export uploads",
				description: "Endpoint to export uploaded files",
				tags: ["Uploads"],
				querystring: z.object({
					searchQuery: z.string().optional(),
				}),
				response: {
					200: z.object({
						reportUrl: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { searchQuery } = request.query

			const result = await exportUploads({
				searchQuery,
			})

			const data = unwrapEither(result)

			reply.status(200).send({ reportUrl: data.reportUrl })
		}
	)
}
