import { getInitializedDataSource } from './data-source';
import { CustodyQueueEntrySchema, type CustodyQueueEntry } from './entities/custody-queue-entry';

export type NewCustodyQueueEntry = Pick<CustodyQueueEntry, 'evidenceId' | 'actor' | 'action'> &
	Partial<Pick<CustodyQueueEntry, 'resultingHash' | 'occurredAt' | 'notes'>>;

export async function enqueueCustodyEntry(input: NewCustodyQueueEntry): Promise<CustodyQueueEntry> {
	const ds = await getInitializedDataSource();
	const repo = ds.getRepository<CustodyQueueEntry>(CustodyQueueEntrySchema);
	return repo.save(
		repo.create({
			...input,
			resultingHash: input.resultingHash ?? null,
			occurredAt: input.occurredAt ?? new Date(),
			notes: input.notes ?? null,
			synced: false
		})
	);
}

export async function listPendingCustodyEntries(): Promise<CustodyQueueEntry[]> {
	const ds = await getInitializedDataSource();
	const repo = ds.getRepository<CustodyQueueEntry>(CustodyQueueEntrySchema);
	return repo.find({ where: { synced: false }, order: { occurredAt: 'ASC' } });
}

export async function markCustodyEntriesSynced(ids: number[]): Promise<void> {
	if (ids.length === 0) return;
	const ds = await getInitializedDataSource();
	const repo = ds.getRepository<CustodyQueueEntry>(CustodyQueueEntrySchema);
	await repo.update(ids, { synced: true });
}
