import { fastifyCors } from "@fastify/cors"
import fastifyMultipart from "@fastify/multipart"
import fastifySwagger from "@fastify/swagger"
import { fastifySwaggerUi } from "@fastify/swagger-ui"
import { fastify } from "fastify"
import {
	hasZodFastifySchemaValidationErrors,
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod"
import { uploadImageRoute } from "./routes/upload-image"

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, _request, reply) => {
	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply
			.status(400)
			.send({ message: "Bad Request", issues: error.validation })
	}
	console.error("Send to observability tools:", error)
	// Never send the raw error back to client as it can expose sensitive information. Always send a generic message.
	reply.status(500).send({ message: "Internal Server Error" })
})

server.register(fastifyMultipart)
server.register(fastifySwagger, {
	openapi: { info: { title: "Upload Widget API", version: "1.0.0" } },
	transform: jsonSchemaTransform,
})
server.register(fastifySwaggerUi, {
	routePrefix: "/admin/docs",
})

server.register(fastifyCors, {
	origin: "*",
})

server.register(uploadImageRoute)

server.listen({ port: 3333 }).then(() => {
	console.log("Server is running on http://localhost:3333")
})
