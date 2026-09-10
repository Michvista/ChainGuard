import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isDatabaseConfigured } from '$lib/server/db/data-source';
import {
	enqueueCustodyEntry,
	listPendingCustodyEntries,
	markCustodyEntriesSynced,
	type NewCustodyQueueEntry
} from '$lib/server/db/custody-queue.repository';

const NOT_CONFIGURED = {
	error: 'Local offline queue is not configured. Set DATABASE_URL to enable it.'
};

export const GET: RequestHandler = async () => {
	if (!isDatabaseConfigured()) {
		return json(NOT_CONFIGURED, { status: 503 });
	}
	const entries = await listPendingCustodyEntries();
	return json({ entries });
};

export const POST: RequestHandler = async ({ request }) => {
	if (!isDatabaseConfigured()) {
		return json(NOT_CONFIGURED, { status: 503 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const candidate = body as Partial<NewCustodyQueueEntry> | null;
	if (
		!candidate ||
		typeof candidate.evidenceId !== 'string' ||
		typeof candidate.actor !== 'string' ||
		typeof candidate.action !== 'string'
	) {
		return json(
			{ error: 'evidenceId, actor and action are required string fields' },
			{ status: 400 }
		);
	}

	const entry = await enqueueCustodyEntry({
		evidenceId: candidate.evidenceId,
		actor: candidate.actor,
		action: candidate.action,
		resultingHash: candidate.resultingHash ?? null,
		notes: candidate.notes ?? null
	});

	return json({ entry }, { status: 201 });
};

export const PATCH: RequestHandler = async ({ request }) => {
	if (!isDatabaseConfigured()) {
		return json(NOT_CONFIGURED, { status: 503 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const ids = (body as { ids?: unknown } | null)?.ids;
	if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'number')) {
		return json({ error: 'ids must be an array of numbers' }, { status: 400 });
	}

	await markCustodyEntriesSynced(ids);
	return json({ synced: ids.length });
};
