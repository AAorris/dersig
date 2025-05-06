const { generatePrivateKey, derivePublicKey } = require("@/lib/dersig");
const crypto = require("node:crypto");

export function GET(request) {
	const rsa = new URL(request.url).searchParams.get("rsa");
	const privateKey = generatePrivateKey();
	const publicKey = derivePublicKey(privateKey);

	if (!rsa) {
		return new Response(
			`Ed25519 private: ${privateKey}\nEd25519 public: ${publicKey}`,
			{
				"Content-Type": "text/plain+base64-last-32-bytes",
			},
		);
	}

	// Generate RSA key pair
	const { publicKey: rsaPublicKey, privateKey: rsaPrivateKey } =
		crypto.generateKeyPairSync("rsa", {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: "spki",
				format: "pem",
			},
			privateKeyEncoding: {
				type: "pkcs8",
				format: "pem",
			},
		});

	return new Response(
		`Ed25519 private: ${privateKey}\nEd25519 public: ${publicKey}\n\nRSA private: ${rsaPrivateKey}\nRSA public: ${rsaPublicKey}\n\nhttps://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/`,
		{
			"Content-Type": "text/plain+base64-last-32-bytes",
		},
	);
}
