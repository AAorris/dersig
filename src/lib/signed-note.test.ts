import { signNote, verifyNote, parseSignedNote } from "./signed-note";
import { createSigningKeyPair, signerFromString } from "./signing";

describe("signNote", () => {
	test("example", () => {
		const signerIdentity = signerFromString(
			"LOVE_2200=kkxpsw0LOVE5gtgCr3qddMzKeNLqf44R8yDblzjKi00,-aok7WiCah8EQ1EOTWmshwfygGnE4UliDpmJww5hczc",
		);
		const recipientIdentity = signerFromString(
			"CARE_2239=PPEvh-WlWwameE5E5qnU_FX9-vxAFjapvUR67VeCARE,mtD5-mSDtjr_1Nek8GgDgyyDaAQqxDuW9v2tFswVlIo",
		);
		const message = "Hello";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		expect(signedNote).toMatchInlineSnapshot(`
"PPEvh-WlWwameE5E5qnU_FX9-vxAFjapvUR67VeCARE
~~~
Hello
~~~
kkxpsw0LOVE5gtgCr3qddMzKeNLqf44R8yDblzjKi00
4O8jNyM8P1mAFkskr8ON1GFgSxca06ljEj6DaDxRqdQe5mFCyGUbqG_voHKM9UZbvlIbzdxC6tITLZiblEnSAw"
`);
	});
});

describe("signNote and verifyNote", () => {
	test("should sign and verify a simple note correctly", () => {
		const signerIdentity = createSigningKeyPair();
		const recipientIdentity = createSigningKeyPair();
		const message = "Hello, this is a signed note!";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const result = verifyNote({
			signedNote,
			senderPublicKey: signerIdentity.publicKey,
		});

		expect(result.isValid).toBe(true);
		expect(result.recipientPublicKey).toBe(recipientIdentity.publicKey);
		expect(result.senderPublicKey).toBe(signerIdentity.publicKey);
		expect(result.message).toBe(message);
	});

	test("should sign and verify a note without recipient", () => {
		const signerIdentity = createSigningKeyPair();
		const message = "This is a public statement!";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const result = verifyNote({
			signedNote,
			senderPublicKey: signerIdentity.publicKey,
		});

		expect(result.isValid).toBe(true);
		expect(result.recipientPublicKey).toBeUndefined();
		expect(result.senderPublicKey).toBe(signerIdentity.publicKey);
		expect(result.message).toBe(message);
	});

	test("should sanitize boundary sequences in the message", () => {
		const signerIdentity = createSigningKeyPair();
		const recipientIdentity = createSigningKeyPair();
		const message =
			"This message contains ~~~ boundary sequences ~~~ that should be sanitized";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const result = verifyNote({
			signedNote,
			senderPublicKey: signerIdentity.publicKey,
		});

		expect(result.isValid).toBe(true);
		expect(result.recipientPublicKey).toBe(recipientIdentity.publicKey);
		expect(result.senderPublicKey).toBe(signerIdentity.publicKey);
		expect(result.message).toBe(
			"This message contains --- boundary sequences --- that should be sanitized",
		);
	});

	test("should handle multiline messages", () => {
		const signerIdentity = createSigningKeyPair();
		const recipientIdentity = createSigningKeyPair();
		const message = `This is a multiline message
with several lines
and some special characters: !@#$%^&*()
and even some ~~~ boundaries ~~~ to test sanitization`;

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const result = verifyNote({
			signedNote,
			senderPublicKey: signerIdentity.publicKey,
		});

		expect(result.isValid).toBe(true);
		expect(result.recipientPublicKey).toBe(recipientIdentity.publicKey);
		expect(result.senderPublicKey).toBe(signerIdentity.publicKey);
		expect(result.message).toContain("--- boundaries ---");
		expect(result.message).not.toContain("~~~");
	});

	test("should fail verification with wrong public key", () => {
		const signerIdentity = createSigningKeyPair();
		const wrongIdentity = createSigningKeyPair();
		const recipientIdentity = createSigningKeyPair();
		const message = "Hello, this is a signed note!";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const result = verifyNote({
			signedNote,
			senderPublicKey: wrongIdentity.publicKey,
		});

		expect(result.isValid).toBe(false);
	});

	test("should fail verification with tampered message", () => {
		const signerIdentity = createSigningKeyPair();
		const recipientIdentity = createSigningKeyPair();
		const message = "Hello, this is a signed note!";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		// Tamper with the signed note by changing a character in the message
		const tamperedNote = signedNote.replace("Hello", "Hallo");

		const result = verifyNote({
			signedNote: tamperedNote,
			senderPublicKey: signerIdentity.publicKey,
		});

		expect(result.isValid).toBe(false);
	});

	test("should handle empty messages", () => {
		const signerIdentity = createSigningKeyPair();
		const recipientIdentity = createSigningKeyPair();
		const message = "";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const result = verifyNote({
			signedNote,
			senderPublicKey: signerIdentity.publicKey,
		});

		expect(result.isValid).toBe(true);
		expect(result.recipientPublicKey).toBe(recipientIdentity.publicKey);
		expect(result.senderPublicKey).toBe(signerIdentity.publicKey);
		expect(result.message).toBe("");
	});

	test("should handle UTF-8 characters", () => {
		const signerIdentity = createSigningKeyPair();
		const recipientIdentity = createSigningKeyPair();
		const message = "Hello 世界! 🌍 Café naïve résumé";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const result = verifyNote({
			signedNote,
			senderPublicKey: signerIdentity.publicKey,
		});

		expect(result.isValid).toBe(true);
		expect(result.recipientPublicKey).toBe(recipientIdentity.publicKey);
		expect(result.senderPublicKey).toBe(signerIdentity.publicKey);
		expect(result.message).toBe(message);
	});
});

describe("parseSignedNote", () => {
	test("should parse a valid signed note with recipient", () => {
		const signerIdentity = createSigningKeyPair();
		const recipientIdentity = createSigningKeyPair();
		const message = "Test message";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			recipientPublicKey: recipientIdentity.publicKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const parsed = parseSignedNote(signedNote);

		expect(parsed.recipientPublicKey).toBe(recipientIdentity.publicKey);
		expect(parsed.senderPublicKey).toBe(signerIdentity.publicKey);
		expect(parsed.message).toBe(message);
		expect(parsed.signature).toBeDefined();
		expect(parsed.signature.length).toBe(86);
	});

	test("should parse a valid signed note without recipient", () => {
		const signerIdentity = createSigningKeyPair();
		const message = "Public statement";

		const signedNote = signNote({
			message,
			signerPrivateKey: signerIdentity.privateKey,
			senderPublicKey: signerIdentity.publicKey,
		});

		const parsed = parseSignedNote(signedNote);

		expect(parsed.recipientPublicKey).toBeUndefined();
		expect(parsed.senderPublicKey).toBe(signerIdentity.publicKey);
		expect(parsed.message).toBe(message);
		expect(parsed.signature).toBeDefined();
		expect(parsed.signature.length).toBe(86);
	});

	test("should throw error for invalid format", () => {
		const invalidNote = "invalid format without proper boundaries";

		expect(() => parseSignedNote(invalidNote)).toThrow(
			"Invalid signed note format",
		);
	});

	test("should throw error for malformed boundaries", () => {
		const malformedNote = ":recipient\n~~~\nmessage\nsender\nsignature";

		expect(() => parseSignedNote(malformedNote)).toThrow(
			"Invalid signed note format",
		);
	});
});
