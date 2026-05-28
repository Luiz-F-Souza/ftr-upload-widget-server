import { jsonSchemaTransform } from "fastify-type-provider-zod"

type Params = Parameters<typeof jsonSchemaTransform>[0]

export function transformSwaggerSchema(data: Params) {
	const { schema, url } = jsonSchemaTransform(data)

	if (schema.consumes?.includes("multipart/form-data")) {
		if (schema.body === undefined) {
			schema.body = {
				type: "object",
				properties: {},
				required: [],
			}
		}
		// @ts-ignore
		schema.body.properties.file = {
			type: "string",
			format: "binary",
		}
		// @ts-ignore
		schema.body.required.push("file")
	}

	return { schema, url }
}
