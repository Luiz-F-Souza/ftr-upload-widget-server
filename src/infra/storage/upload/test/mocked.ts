import { randomUUID } from "node:crypto"
import { vi } from "vitest"

type Props = {
	key?: string | null
	url?: string | null
}

const storageMock = vi.hoisted(() => ({
	uploadFileToStorage: vi.fn(),
}))

vi.mock("@/infra/storage/upload/file-to-storage", () => {
	return {
		uploadFileToStorage: storageMock.uploadFileToStorage,
	}
})

export const mockUploadFileToStorage = ({ key, url }: Props = {}) => {
	storageMock.uploadFileToStorage.mockReset()
	storageMock.uploadFileToStorage.mockImplementation(() => {
		const random = randomUUID()
		return {
			key: key ?? `${random}.png`,
			url: url ?? `https://www.my-test/${random}.png`,
		}
	})

	return storageMock.uploadFileToStorage
}
