import { xxh64 } from "@node-rs/xxhash";

export const encoding = "base64url" as const;

export const encode = (value: Buffer): string => value.toString(encoding);
export const encodeArray = (value: Uint8Array): string =>
	encode(Buffer.from(value));

export const decode = (value: string): Buffer => Buffer.from(value, encoding);
export const decodeArray = (value: string): Uint8Array =>
	new Uint8Array(decode(value));

export const fingerprint = (buffer: Buffer): string => {
	const hash = xxh64(new Uint8Array(buffer));
	return Buffer.from(hash.toString(16), "hex").toString("base64url");
};
