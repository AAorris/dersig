import {
	encode,
	decode,
	fingerprint,
	encodeArray,
	decodeArray,
} from "./buffer-encoding";

describe("buffer-encoding", () => {
	test("encode should convert buffer to base64url string", () => {
		const buffer = Buffer.from("hello world");
		const encoded = encode(buffer);
		expect(encoded).toBe("aGVsbG8gd29ybGQ");
	});

	test("decode should convert base64url string to buffer", () => {
		const encoded = "aGVsbG8gd29ybGQ";
		const buffer = decode(encoded);
		expect(buffer.toString()).toBe("hello world");
	});

	test("fingerprint should return correct fingerprint for buffer", () => {
		const buffer = Buffer.from("test buffer");
		const fp = fingerprint(buffer);
		expect(fp).toMatchInlineSnapshot(`"4b_55wKzCks"`);
	});
});

describe("array-encoding", () => {
	test("encodeArray should convert array to base64url string", () => {
		const array = new Uint8Array([1, 2, 3]);
		const encoded = encodeArray(array);
		expect(encoded).toBe("AQID");
	});

	test("decodeArray should convert base64url string to array", () => {
		const encoded = "AQID";
		const array = decodeArray(encoded);
		expect(array).toEqual(new Uint8Array([1, 2, 3]));
	});
});
