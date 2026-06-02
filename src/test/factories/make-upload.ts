import { fakerPT_BR as faker } from "@faker-js/faker"
import type { InferInsertModel } from "drizzle-orm"
import { db } from "@/infra/db"
import { uploads } from "@/infra/db/schemas"

type Props = Partial<InferInsertModel<typeof uploads>>

const defaultFileName = faker.system.fileName()

export async function testFactoryMakeUpload(overrides?: Props) {
	const fileName = overrides?.name ? overrides.name : defaultFileName
	const result = await db
		.insert(uploads)
		.values({
			name: fileName,
			remoteKey: `images/${fileName}`,
			remoteUrl: faker.internet.url(),
			...overrides,
		})
		.returning()

	return result[0]
}
