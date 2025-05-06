const {
	generatePrivateKey,
	derivePublicKey,
	signMessage,
	verifySignature,
} = require("./dersig"); // Assume this is the file where the library functions are defined

function walkthrough(defaultMessage, defaultPrivateKey) {
	// try a few times to get a key that matches [fF][a-zA-Z0-9]+
	const privateKeyBase64 = defaultPrivateKey ?? generatePrivateKey();
	const publicKeyBase64 = derivePublicKey(privateKeyBase64);

	console.log("Private Key (Base64):", privateKeyBase64);

	// Derive base64-encoded public key from the private key
	// const publicKeyBase64 = derivePublicKey(privateKeyBase64);
	console.log("Public Key (Base64):", publicKeyBase64);

	// The message to sign
	const message = defaultMessage ?? process.env.SIGN_MESSAGE ?? "hello world";

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
