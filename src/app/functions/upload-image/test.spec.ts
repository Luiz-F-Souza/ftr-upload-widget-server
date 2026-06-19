import { randomUUID } from "node:crypto"
import { Readable } from "node:stream"
import { eq } from "drizzle-orm"
import { describe, expect, it } from "vitest"
import { db } from "@/infra/db"
import { uploads } from "@/infra/db/schemas"
import { mockUploadFileToStorage } from "@/infra/storage/upload/test/mocked"
import { isLeft, isRight, unwrapEither } from "@/sharad/either"
import { InvalidFileFormat } from "../errors/invalid-file-format"
import { uploadImage } from "."

mockUploadFileToStorage({ key: null, url: null })

describe("upload image", () => {
	it("should be able to upload an image", async () => {
		const fileName = `${randomUUID()}.png`

		const sut = await uploadImage({
			fileName,
			contentType: "image/png",
			contentStream: Readable.from([]),
		})

		expect(isRight(sut)).toBe(true)

		const result = await db
			.select()
			.from(uploads)
			.where(eq(uploads.name, fileName))

		expect(result).toHaveLength(1)
	})

	it("should NOT be able to upload an invalid file", async () => {
		const fileName = `${randomUUID()}.pdf`

		const sut = await uploadImage({
			fileName,
			contentType: "document/ppdfng",
			contentStream: Readable.from([]),
		})

		expect(isLeft(sut)).toBe(true)
		expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat)
	})
})
