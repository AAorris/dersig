const {
  generateBase64PrivateKey,
  deriveBase64PublicKey,
  signMessage,
  verifySignature
} = require('./dersig'); // Assume this is the file where the library functions are defined

const pattern = /[a-zA-Z0-9]{43}/;

function walkthrough(defaultMessage, defaultPrivateKey) {
  const deadline = Date.now() + 1000;
	// try a few times to get a key that matches [fF][a-zA-Z0-9]+
	let privateKeyBase64 = defaultPrivateKey ?? generateBase64PrivateKey();
  while (!pattern.test(privateKeyBase64) && Date.now() < deadline && !defaultPrivateKey) {
		privateKeyBase64 = generateBase64PrivateKey();
	}

  console.log("Private Key (Base64):", privateKeyBase64);

  // Derive base64-encoded public key from the private key
  const publicKeyBase64 = deriveBase64PublicKey(privateKeyBase64);
  console.log("Public Key (Base64):", publicKeyBase64);

  // The message to sign
  const message = defaultMessage ?? "hello world";

  // Sign the message using the base64-encoded private key
  const signatureBase64 = signMessage(privateKeyBase64, message);
  console.log("Signature (Base64):", signatureBase64);

  // Verify the signature using the base64-encoded public key
  const isVerified = verifySignature(publicKeyBase64, message, signatureBase64);
  console.log("Signature Verified:", isVerified);

  // Return the results
  return {
      sig: signatureBase64,
      verified: isVerified,
      pub: publicKeyBase64,
      priv: privateKeyBase64,
      message,
  };
}

// Export the walkthrough function if needed
module.exports = walkthrough;

// If running the walkthrough directly
if (require.main === module) {
  walkthrough();
}
