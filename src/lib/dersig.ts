import * as crypto from "node:crypto";

/**
 * Generates a base64-encoded Ed25519 private key.
 * @returns {string} Base64-encoded private key.
 */
function generateBase64PrivateKey(): string {
  const { privateKey } = crypto.generateKeyPairSync("ed25519");
  const privateKeyRaw = privateKey
    .export({ format: "der", type: "pkcs8" })
    .subarray(-32); // extract raw 32 bytes key
  return privateKeyRaw.toString("base64");
}

/**
 * Derives a base64-encoded Ed25519 public key from a base64-encoded private key.
 * @param {string} privateKeyBase64 - Base64-encoded private key.
 * @returns {string} Base64-encoded public key.
 */
function deriveBase64PublicKey(privateKeyBase64: string): string {
  const privateKeyRaw = Buffer.from(privateKeyBase64, "base64");
  const privateKeyFromRaw = crypto.createPrivateKey({
    key: Buffer.concat([
      Buffer.from("302e020100300506032b657004220420", "hex"), // PKCS8 header for Ed25519
      privateKeyRaw,
    ]),
    format: "der",
    type: "pkcs8",
  });
  const publicKey = crypto.createPublicKey(privateKeyFromRaw);
  const publicKeyRaw = publicKey
    .export({ format: "der", type: "spki" })
    .subarray(-32); // extract raw 32 bytes key
  return publicKeyRaw.toString("base64");
}

/**
 * Signs a message using a base64-encoded Ed25519 private key.
 * @param {string} privateKeyBase64 - Base64-encoded private key.
 * @param {string} message - The message to sign.
 * @returns {string} Base64-encoded signature.
 */
function signMessage(privateKeyBase64: string, message: string): string {
  const privateKeyRaw = Buffer.from(privateKeyBase64, "base64");
  const privateKeyFromRaw = crypto.createPrivateKey({
    key: Buffer.concat([
      Buffer.from("302e020100300506032b657004220420", "hex"), // PKCS8 header for Ed25519
      privateKeyRaw,
    ]),
    format: "der",
    type: "pkcs8",
  });
  const signature = crypto.sign(null, Buffer.from(message), privateKeyFromRaw);
  return signature.toString("base64");
}

/**
 * Verifies a signature using a base64-encoded Ed25519 public key.
 * @param {string} publicKeyBase64 - Base64-encoded public key.
 * @param {string} message - The original message that was signed.
 * @param {string} signatureBase64 - Base64-encoded signature.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
function verifySignature(
  publicKeyBase64: string,
  message: string,
  signatureBase64: string
): boolean {
  const publicKeyRaw = Buffer.from(publicKeyBase64, "base64");
  const publicKeyFromRaw = crypto.createPublicKey({
    key: Buffer.concat([
      Buffer.from("302a300506032b6570032100", "hex"), // SPKI header for Ed25519
      publicKeyRaw,
    ]),
    format: "der",
    type: "spki",
  });
  return crypto.verify(
    null,
    Buffer.from(message),
    publicKeyFromRaw,
    Buffer.from(signatureBase64, "base64")
  );
}

// Exporting the functions as a module
export {
  generateBase64PrivateKey,
  deriveBase64PublicKey,
  signMessage,
  verifySignature,
};
