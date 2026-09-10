import { env } from '$env/dynamic/public';
import type {
	Evidence,
	EvidenceDetail,
	EvidenceReport,
	CustodyEntry,
	MetadataRecord,
	SyncCustodyEntry,
	VerifyResult
} from './types';

/**
 * Centralized client for the ChainGuard evidence API.
 *
 * The backend is the source of truth. Response shapes were verified against
 * the live deployment; the client still normalizes defensively and never
 * assumes a 2xx response implies a well-formed body.
 */

const DEFAULT_BASE_URL = 'https://chainguard.up.railway.app';

function baseUrl(): string {
	const raw = env.PUBLIC_CHAINGUARD_API_BASE_URL || DEFAULT_BASE_URL;
	return raw.replace(/\/+$/, '');
}

export class ApiError extends Error {
	status: number;
	body: unknown;

	constructor(message: string, status: number, body?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	let response: Response;
	try {
		response = await fetch(`${baseUrl()}${path}`, init);
	} catch {
		throw new ApiError(
			'Network error: could not reach the ChainGuard evidence API. Check your connection or the API base URL.',
			0
		);
	}

	const text = await response.text();
	let body: unknown = null;
	if (text) {
		try {
			body = JSON.parse(text);
		} catch {
			body = text;
		}
	}

	if (!response.ok) {
		const message = extractErrorMessage(body, response.status);
		throw new ApiError(message, response.status, body);
	}

	return body as T;
}

function extractErrorMessage(body: unknown, status: number): string {
	if (body && typeof body === 'object') {
		const record = body as Record<string, unknown>;
		if (typeof record.error === 'string') return record.error;
		if (typeof record.message === 'string') return record.message;
	}
	if (status === 400) return 'The request was rejected (400 Bad Request).';
	if (status === 404) return 'The requested evidence was not found (404).';
	if (status === 502) return 'The ChainGuard API did not respond (502). It may be restarting.';
	if (status >= 500) return `The ChainGuard API returned an error (${status}).`;
	return `Request failed with status ${status}.`;
}

export const api = {
	async listEvidence(): Promise<Evidence[]> {
		const data = await request<{ evidence?: Evidence[] }>('/evidence');
		return Array.isArray(data?.evidence) ? data.evidence : [];
	},

	async getEvidence(id: string): Promise<EvidenceDetail> {
		const data = await request<{ evidence?: Evidence; currentHash?: string }>(
			`/evidence/${encodeURIComponent(id)}`
		);
		if (!data?.evidence) {
			throw new ApiError('The API response did not include an evidence record.', 502, data);
		}
		return { ...data.evidence, currentHash: data.currentHash ?? data.evidence.originalHash };
	},

	async createEvidence(
		file: File,
		actor: string
	): Promise<{ evidence: Evidence; metadata: MetadataRecord }> {
		const form = new FormData();
		form.append('file', file);
		form.append('actor', actor);
		return request<{ evidence: Evidence; metadata: MetadataRecord }>('/evidence', {
			method: 'POST',
			body: form
		});
	},

	async verifyEvidence(id: string, actor: string): Promise<VerifyResult> {
		return request<VerifyResult>(`/evidence/${encodeURIComponent(id)}/verify`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ actor })
		});
	},

	async getCustody(id: string): Promise<CustodyEntry[]> {
		const data = await request<{ custodyTrail?: CustodyEntry[] }>(
			`/evidence/${encodeURIComponent(id)}/custody`
		);
		return Array.isArray(data?.custodyTrail) ? data.custodyTrail : [];
	},

	async getMetadata(id: string): Promise<MetadataRecord> {
		const data = await request<{ metadata?: MetadataRecord }>(
			`/evidence/${encodeURIComponent(id)}/metadata`
		);
		if (!data?.metadata) {
			throw new ApiError('The API response did not include a metadata record.', 502, data);
		}
		return data.metadata;
	},

	async getReport(id: string): Promise<EvidenceReport> {
		return request<EvidenceReport>(`/evidence/${encodeURIComponent(id)}/report`);
	},

	async syncCustody(entries: SyncCustodyEntry[]): Promise<unknown> {
		return request(`/custody/sync`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ entries })
		});
	}
};
