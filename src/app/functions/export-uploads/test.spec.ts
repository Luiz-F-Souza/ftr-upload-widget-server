import { randomUUID } from "node:crypto"
import { describe, expect, it } from "vitest"
import { mockUploadFileToStorage } from "@/infra/storage/upload/test/mocked"
import { isRight, unwrapEither } from "@/sharad/either"
import { testFactoryMakeUpload } from "@/test/factories/make-upload"
import { exportUploads } from "."

mockUploadFileToStorage({ key: null, url: null })

describe("exportUploads", () => {
	it("should be able to export uploads", async () => {
		const namePattern = randomUUID()

		const upload1Promise = testFactoryMakeUpload({
			name: `${namePattern}-1.webp`,
		})
		const upload2Promise = testFactoryMakeUpload({
			name: `${namePattern}-2.webp`,
		})
		const upload3Promise = testFactoryMakeUpload({
			name: `${namePattern}-3.webp`,
		})
		const upload4Promise = testFactoryMakeUpload({
			name: `${namePattern}-4.webp`,
		})
		const upload5Promise = testFactoryMakeUpload({
			name: `${namePattern}-5.webp`,
		})

		await Promise.all([
			upload1Promise,
			upload2Promise,
			upload3Promise,
			upload4Promise,
			upload5Promise,
		])

		const sut = await exportUploads({
			searchQuery: namePattern,
		})

		expect(isRight(sut)).toBe(true)

		const { reportUrl } = unwrapEither(sut)

		expect(reportUrl).toBeTruthy()
	})
})
