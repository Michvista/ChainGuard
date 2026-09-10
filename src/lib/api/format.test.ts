import { describe, expect, it } from 'vitest';
import {
	actionLabel,
	formatBytes,
	humanizeIntegrityResult,
	isUnaltered,
	shortHash
} from './format';

describe('formatBytes', () => {
	it('formats byte counts', () => {
		expect(formatBytes(0)).toBe('0 B');
		expect(formatBytes(1023)).toBe('1023 B');
		expect(formatBytes(2048)).toBe('2 KB');
		expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
	});

	it('handles invalid input', () => {
		expect(formatBytes(-1)).toBe('—');
		expect(formatBytes(Number.NaN)).toBe('—');
	});
});

describe('shortHash', () => {
	it('truncates a long hash', () => {
		const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
		expect(shortHash(hash)).toBe('e3b0c44298fc…7852b855');
	});

	it('returns a placeholder for an empty value', () => {
		expect(shortHash('')).toBe('—');
	});
});

describe('actionLabel', () => {
	it('maps known custody actions', () => {
		expect(actionLabel('INTAKE')).toBe('Evidence intake');
		expect(actionLabel('VERIFY')).toBe('Verification');
		expect(actionLabel('TRANSFER')).toBe('Custody transfer');
	});

	it('humanizes unknown actions', () => {
		expect(actionLabel('OFFLINE_ACCESS')).toBe('Offline access');
		expect(actionLabel('weird_action')).toBe('Weird Action');
	});

	it('handles an empty action', () => {
		expect(actionLabel('')).toBe('Unknown action');
	});
});

describe('isUnaltered', () => {
	it('recognizes the UNALTERED status', () => {
		expect(isUnaltered('UNALTERED')).toBe(true);
		expect(isUnaltered('ALTERED')).toBe(false);
		expect(isUnaltered(null)).toBe(false);
	});
});

describe('humanizeIntegrityResult', () => {
	it('explains an unaltered result', () => {
		expect(humanizeIntegrityResult('UNALTERED').title).toBe('Integrity Verified');
	});

	it('explains a failed result without overclaiming', () => {
		const result = humanizeIntegrityResult('TAMPERED');
		expect(result.title).toBe('Integrity Check Failed');
	});

	it('handles no recorded verification', () => {
		expect(humanizeIntegrityResult(null).title).toBe('No verification recorded');
	});
});
