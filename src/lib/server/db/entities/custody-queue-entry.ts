import { EntitySchema } from 'typeorm';

/**
 * A custody entry that was recorded locally (for example, in the field with no
 * network connection) and is waiting to be pushed to the ChainGuard evidence
 * API via `POST /custody/sync`.
 *
 * This is deliberately a local queue, not a copy of the authoritative custody
 * trail. The remote API remains the source of truth.
 */
export interface CustodyQueueEntry {
	id: number;
	evidenceId: string;
	actor: string;
	action: string;
	resultingHash: string | null;
	occurredAt: Date;
	notes: string | null;
	synced: boolean;
	createdAt: Date;
}

export const CustodyQueueEntrySchema = new EntitySchema<CustodyQueueEntry>({
	name: 'CustodyQueueEntry',
	tableName: 'custody_queue_entry',
	columns: {
		id: { type: 'int', primary: true, generated: true },
		evidenceId: { type: 'text' },
		actor: { type: 'text' },
		action: { type: 'text' },
		resultingHash: { type: 'text', nullable: true },
		occurredAt: { type: 'timestamptz' },
		notes: { type: 'text', nullable: true },
		synced: { type: 'boolean', default: false },
		createdAt: { type: 'timestamptz', createDate: true }
	}
});
