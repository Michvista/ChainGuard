import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '$env/dynamic/private';
import { CustodyQueueEntrySchema } from './entities/custody-queue-entry';

/**
 * ChainGuard's core product talks to the deployed evidence API. A local
 * database is optional and only used for the offline custody queue.
 *
 * If DATABASE_URL is not set, the app keeps working; only the optional offline
 * queue endpoints are disabled.
 */
let dataSource: DataSource | null = null;

export function isDatabaseConfigured(): boolean {
	return Boolean(env.DATABASE_URL);
}

export function getDataSource(): DataSource {
	if (!env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not set');
	}

	if (!dataSource) {
		dataSource = new DataSource({
			type: 'postgres',
			url: env.DATABASE_URL,
			entities: [CustodyQueueEntrySchema],
			// Convenient for a hackathon prototype. Use migrations in production.
			synchronize: env.NODE_ENV !== 'production',
			logging: false
		});
	}

	return dataSource;
}

export async function getInitializedDataSource(): Promise<DataSource> {
	const ds = getDataSource();
	if (!ds.isInitialized) {
		await ds.initialize();
	}
	return ds;
}
