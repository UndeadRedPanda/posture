const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function decodeUint8ArrayToString(buffer: Uint8Array): string {
	return decoder.decode(buffer);
}

export function encodeStringToUint8Array(str: string): Uint8Array {
	return encoder.encode(str);
}