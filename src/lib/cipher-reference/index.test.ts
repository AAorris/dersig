import * as crypto from "node:crypto";

describe.skip("aes-256-gcm", () => {
	test("encrypt and decrypt", () => {
		const algorithm = "aes-256-gcm";
		const key = crypto.randomBytes(32);
		const iv = crypto.randomBytes(12);
		const message = "Hello, this is a test message!";
		const cipher = crypto.createCipheriv(
			algorithm,
			new Uint8Array(key),
			new Uint8Array(iv),
			{
				authTagLength: 16,
			},
		);

		let encrypted = cipher.update(message, "utf8", "hex");
		encrypted += cipher.final("hex");
	});
});

describe.skip("chacha-poly1305", () => {
	test("encrypt and decrypt", () => {
		const algorithm = "chacha20-poly1305";
		const key = crypto.randomBytes(32);
		const iv = crypto.randomBytes(12);
		const message = "Hello, this is a test message!";
		const cipher = crypto.createCipheriv(
			algorithm,
			new Uint8Array(key),
			new Uint8Array(iv),
			{
				authTagLength: 16,
			},
		);

		let encrypted = cipher.update(message, "utf8", "hex");
		encrypted += cipher.final("hex");
		const authTag = cipher.getAuthTag().toString("hex");

		const decipher = crypto.createDecipheriv(algorithm, key, iv, {
			authTagLength: 16,
		});
		decipher.setAuthTag(new Uint8Array(Buffer.from(authTag, "hex")));

		let decrypted = decipher.update(encrypted, "hex", "utf8");
		decrypted += decipher.final("utf8");

		expect(decrypted).toBe(message);
	});
});
