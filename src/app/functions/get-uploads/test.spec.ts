import { randomUUID } from "node:crypto"
import dayjs from "dayjs"
import { describe, expect, it } from "vitest"
import { isRight, unwrapEither } from "@/sharad/either"
import { testFactoryMakeUpload } from "@/test/factories/make-upload"
import { getUploads } from "."

describe("getUploads", () => {
	it("should be able to get the uploads", async () => {
		const namePattern = randomUUID()

		const upload1 = await testFactoryMakeUpload({
			name: `${namePattern}-1.webp`,
		})
		const upload2 = await testFactoryMakeUpload({
			name: `${namePattern}-2.webp`,
		})
		const upload3 = await testFactoryMakeUpload({
			name: `${namePattern}-3.webp`,
		})
		const upload4 = await testFactoryMakeUpload({
			name: `${namePattern}-4.webp`,
		})
		const upload5 = await testFactoryMakeUpload({
			name: `${namePattern}-5.webp`,
		})

		const sut = await getUploads({
			searchQuery: namePattern,
		})

		expect(isRight(sut)).toBe(true)
		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: upload5.id }),
			expect.objectContaining({ id: upload4.id }),
			expect.objectContaining({ id: upload3.id }),
			expect.objectContaining({ id: upload2.id }),
			expect.objectContaining({ id: upload1.id }),
		])
	})

	it("should be able to get paginated uploads", async () => {
		const namePattern = randomUUID()

		await testFactoryMakeUpload({
			name: `${namePattern}-1.webp`,
		})
		await testFactoryMakeUpload({
			name: `${namePattern}-2.webp`,
		})
		const upload3 = await testFactoryMakeUpload({
			name: `${namePattern}-3.webp`,
		})
		const upload4 = await testFactoryMakeUpload({
			name: `${namePattern}-4.webp`,
		})
		const upload5 = await testFactoryMakeUpload({
			name: `${namePattern}-5.webp`,
		})

		let sut = await getUploads({
			searchQuery: namePattern,
			page: 1,
			pageSize: 3,
		})

		expect(isRight(sut)).toBe(true)

		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: upload5.id }),
			expect.objectContaining({ id: upload4.id }),
			expect.objectContaining({ id: upload3.id }),
		])

		expect(unwrapEither(sut).uploads).toHaveLength(3)

		expect(unwrapEither(sut).total).toBe(5)
	})

	it("should be able to get sorted uploads", async () => {
		const namePattern = randomUUID()

		const upload1 = await testFactoryMakeUpload({
			name: `${namePattern}-1.webp`,
			createdAt: new Date(),
		})
		const upload2 = await testFactoryMakeUpload({
			name: `${namePattern}-2.webp`,
			createdAt: dayjs().subtract(1, "days").toDate(),
		})
		const upload3 = await testFactoryMakeUpload({
			name: `${namePattern}-3.webp`,
			createdAt: dayjs().subtract(2, "days").toDate(),
		})
		const upload4 = await testFactoryMakeUpload({
			name: `${namePattern}-4.webp`,
			createdAt: dayjs().subtract(3, "days").toDate(),
		})
		const upload5 = await testFactoryMakeUpload({
			name: `${namePattern}-5.webp`,
			createdAt: dayjs().subtract(4, "days").toDate(),
		})

		let sut = await getUploads({
			searchQuery: namePattern,
			sortBy: "createdAt",
			sortDirection: "desc",
		})

		expect(isRight(sut)).toBe(true)
		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: upload1.id }),
			expect.objectContaining({ id: upload2.id }),
			expect.objectContaining({ id: upload3.id }),
			expect.objectContaining({ id: upload4.id }),
			expect.objectContaining({ id: upload5.id }),
		])

		sut = await getUploads({
			searchQuery: namePattern,
			sortBy: "createdAt",
			sortDirection: "asc",
		})

		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: upload5.id }),
			expect.objectContaining({ id: upload4.id }),
			expect.objectContaining({ id: upload3.id }),
			expect.objectContaining({ id: upload2.id }),
			expect.objectContaining({ id: upload1.id }),
		])
	})
})
