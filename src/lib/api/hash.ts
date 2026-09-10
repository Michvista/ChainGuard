/**
 * Client-side SHA-256 digest using the Web Crypto API.
 *
 * Used only by the local "Compare a file" tool so that an investigator can
 * compare a suspect file against a registered hash without uploading it.
 * This is a real cryptographic digest: the browser does not need a network
 * round-trip and the file never leaves the device.
 */

export async function sha256Hex(input: ArrayBuffer | Blob): Promise<string> {
	const data = input instanceof Blob ? await input.arrayBuffer() : input;
	const digest = await crypto.subtle.digest('SHA-256', data);
	return hexFromBytes(new Uint8Array(digest));
}

export function hexFromBytes(bytes: Uint8Array): string {
	let out = '';
	for (const b of bytes) {
		out += b.toString(16).padStart(2, '0');
	}
	return out;
}
