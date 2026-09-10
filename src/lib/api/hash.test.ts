import { describe, expect, it } from 'vitest';
import { sha256Hex } from './hash';

describe('sha256Hex', () => {
	it('matches the well-known SHA-256 of "abc"', async () => {
		const data = new TextEncoder().encode('abc').buffer as ArrayBuffer;
		const digest = await sha256Hex(data);
		expect(digest).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
	});

	it('produces a different digest for changed input', async () => {
		const a = await sha256Hex(new TextEncoder().encode('original').buffer as ArrayBuffer);
		const b = await sha256Hex(new TextEncoder().encode('original!').buffer as ArrayBuffer);
		expect(a).not.toBe(b);
	});
});
