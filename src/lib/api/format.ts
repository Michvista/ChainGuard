export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return '—';
	if (bytes < 1024) return `${bytes} B`;
	const units = ['KB', 'MB', 'GB', 'TB'];
	let value = bytes;
	let unit = 'B';
	for (const u of units) {
		value /= 1024;
		unit = u;
		if (value < 1024) break;
	}
	const rendered = value >= 100 ? Math.round(value) : Number(value.toFixed(1));
	return `${rendered} ${unit}`;
}

export function formatDateTime(iso: string | null | undefined): string {
	if (!iso) return '—';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatDateOnly(iso: string | null | undefined): string {
	if (!iso) return '—';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function shortId(id: string | undefined): string {
	if (!id) return '—';
	return id.length > 10 ? `${id.slice(0, 10)}…` : id;
}

export function shortHash(hash: string | null | undefined, head = 12, tail = 8): string {
	if (!hash) return '—';
	if (hash.length <= head + tail + 1) return hash;
	return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

const ACTION_LABELS: Record<string, string> = {
	INTAKE: 'Evidence intake',
	VERIFY: 'Verification',
	ACCESS: 'Access',
	TRANSFER: 'Custody transfer',
	EXPORT: 'Export',
	OFFLINE_ACCESS: 'Offline access',
	OFFLINE: 'Offline entry'
};

export function actionLabel(action: string): string {
	if (ACTION_LABELS[action]) return ACTION_LABELS[action];
	if (!action) return 'Unknown action';
	return action
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function kindLabel(mimeType: string | null | undefined): string {
	if (!mimeType) return 'File';
	const map: Record<string, string> = {
		'image/jpeg': 'Image',
		'image/png': 'Image',
		'image/webp': 'Image',
		'image/gif': 'Image',
		'image/heic': 'Image',
		'video/mp4': 'Video',
		'video/webm': 'Video',
		'video/quicktime': 'Video',
		'audio/wav': 'Audio',
		'audio/mpeg': 'Audio',
		'audio/ogg': 'Audio',
		'text/plain': 'Text',
		'text/csv': 'Spreadsheet',
		'application/pdf': 'Document'
	};
	if (map[mimeType]) return map[mimeType];
	return mimeType.split('/')[0] || 'File';
}

export function isUnaltered(status: string | null | undefined): boolean {
	return status === 'UNALTERED';
}

export function humanizeIntegrityResult(status: string | null | undefined): {
	title: string;
	detail: string;
} {
	if (!status) {
		return {
			title: 'No verification recorded',
			detail: 'This evidence has not been verified yet.'
		};
	}
	if (status === 'UNALTERED') {
		return {
			title: 'Integrity Verified',
			detail: 'The current file matches the hash recorded in the evidence chain.'
		};
	}
	return {
		title: 'Integrity Check Failed',
		detail: 'The current file does not match the hash recorded in the evidence chain.'
	};
}
