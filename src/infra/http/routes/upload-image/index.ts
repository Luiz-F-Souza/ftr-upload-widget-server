import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"

export const uploadImageRoute: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/uploads",
		{
			schema: {
				summary: "Upload an image",
				description: "Endpoint to upload an image file",
				tags: ["Uploads"],
				body: z.object({ name: z.string(), file: z.instanceof(File) }),
				response: {
					201: z.object({ uploadId: z.string() }),
					400: z.object({ message: z.string(), issues: z.array(z.unknown()) }),
				},
			},
		},
		async (request, reply) => {
			reply.status(201).send({ uploadId: "12345" })
		}
	)
}
