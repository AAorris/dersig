const { generateBase64PrivateKey, deriveBase64PublicKey } = require("@/lib/dersig");

const pattern = /[a-zA-Z0-9]{43}/;

export function GET() {
  const deadline = Date.now() + 1000;
	// try a few times to get a key that matches [fF][a-zA-Z0-9]+
	let privateKey = generateBase64PrivateKey();
  while (!pattern.test(privateKey) && Date.now() < deadline) {
		privateKey = generateBase64PrivateKey();
	}
  console.log(deadline - Date.now());
  const publicKey = deriveBase64PublicKey(privateKey);
	return new Response(`private: ${privateKey}\npublic : ${publicKey}`, {
		"Content-Type": "text/plain+base64-last-32-bytes",
	});
}
