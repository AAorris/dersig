import * as crypto from "node:crypto";
import { decode, fingerprint } from "@/lib/buffer-encoding";
import {
	exportSigningKeyPair,
	generateSigningKeyPair,
	importSigningKeyPair,
} from "./src/lib/signing";

const { privateKey, publicKey } = generateSigningKeyPair();

console.log(privateKey);
console.log(publicKey);
console.log(fingerprint(decode(publicKey)));

// nodejs version
{
	const key0 = crypto.generateKeyPairSync("ed25519");
	const pem = key0.privateKey.export({ format: "pem", type: "pkcs8" });
	const key1 = crypto
		.createPrivateKey(pem)
		.export({ format: "pem", type: "pkcs8" });
	console.log(pem);
	console.log(key1);
}

// import to and export from our signing-identity module
{
	console.log("-----");
	const key0 = crypto.generateKeyPairSync("ed25519");
	console.log(key0.publicKey.export({ format: "pem", type: "spki" }));
	const key1 = importSigningKeyPair(key0);
	console.log(key1.publicKey);
	const key2 = exportSigningKeyPair(key1);
	console.log(key2.publicKey);
}
