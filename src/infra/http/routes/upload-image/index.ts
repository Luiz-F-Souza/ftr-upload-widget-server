import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"
import { uploadImage } from "@/app/functions/upload-image"
import { isLeft, unwrapEither } from "@/sharad/either"

export const uploadImageRoute: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/uploads",
		{
			schema: {
				summary: "Upload an image",
				description: "Endpoint to upload an image file",
				tags: ["Uploads"],
				consumes: ["multipart/form-data"],

				response: {
					201: z.object({ url: z.string() }),
					400: z.object({ message: z.string(), issues: z.array(z.unknown()) }),
				},
			},
		},
		async (request, reply) => {
			const uploadedFile = await request.file({
				limits: {
					fileSize: 1024 * 1024 * 2, // 2MB
				},
			})

			if (!uploadedFile) {
				return reply
					.status(400)
					.send({ message: "No file uploaded", issues: [] })
			}
			// Study note:
			// We should avoid unnecessary huge variables in memmory, so we should use stream instead of buffer to handle file uploads.
			// uploadedFile.file is a Readable stream, which allows us to process the file in chunks without loading the entire file into memory at once as buffer would do.
			// Imagining 10k of users uploading 2MB files at the same time, if we use buffer, it would consume 20GB of memory, which is not efficient. Using stream allows us to handle such scenarios without running out of memory.

			const result = await uploadImage({
				fileName: uploadedFile.filename,
				contentType: uploadedFile.mimetype,
				contentStream: uploadedFile.file,
			})

			if (uploadedFile.file.truncated) {
				return reply
					.status(400)
					.send({
						message: "File size limit reached",
						issues: ["File is too big."],
					})
			}

			if (isLeft(result)) {
				const error = unwrapEither(result)
				return reply.status(400).send({ message: error.message, issues: [] })
			}

			const data = unwrapEither(result)

			reply.status(201).send({ url: data.url })
		}
	)
}
