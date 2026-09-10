// API response types, derived from the live OpenAPI spec and verified against
// the deployed backend at https://chainguard.up.railway.app.

export interface Evidence {
	_id: string;
	fileName: string;
	r2Key: string;
	mimeType: string;
	sizeBytes: number;
	originalHash: string;
	createdAt: string;
	__v?: number;
}

export interface EvidenceDetail extends Evidence {
	/** Latest hash recorded in the evidence chain for this item. */
	currentHash: string;
}

export interface MetadataRecord {
	_id?: string;
	evidenceId: string;
	raw?: unknown;
	make: string | null;
	cameraModel: string | null;
	software: string | null;
	dateTimeOriginal: string | null;
	gpsLatitude: number | null;
	gpsLongitude: number | null;
	c2paPresent: boolean;
	/** Heuristic flags such as `NO_EXIF_DATA`. Observations, not a verdict. */
	flags: string[];
	createdAt?: string;
	__v?: number;
}

export interface CustodyEntry {
	_id?: string;
	evidenceId: string;
	actor: string;
	action: string;
	resultingHash: string | null;
	offline: boolean;
	notes?: string | null;
	createdAt: string;
	__v?: number;
}

export type VerifyStatus = 'UNALTERED' | string;

export interface VerifyResult {
	status: VerifyStatus;
	recordedHash: string;
	computedHash: string;
	message?: string;
}

export interface ReportMetadataSummary {
	capturedOn: string | null;
	capturedAt: string | null;
	notes: string[];
}

export interface ReportCustodyEvent {
	when: string;
	who: string;
	what: string;
	offline: boolean;
}

export interface EvidenceReport {
	fileName: string;
	collectedAt: string;
	summary: string;
	lastVerifiedAt: string | null;
	metadataSummary: ReportMetadataSummary;
	custodyEvents: ReportCustodyEvent[];
}

export interface SyncCustodyEntry {
	evidenceId: string;
	actor: string;
	action: string;
	resultingHash?: string;
	occurredAt?: string;
	notes?: string;
}
