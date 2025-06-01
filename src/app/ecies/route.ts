import { createSigningKeyPair } from "@/lib/signing";
import {
	createEncryptionKeyPair,
	parseEncryptedMessage,
} from "@/lib/encryption";
import {
	encryptAndSign,
	verifyAndDecrypt,
	parseEciesMessage,
} from "@/lib/signed-encryption";
import { type NextRequest, NextResponse } from "next/server";
import { formatPrettyPublicKey } from "@/lib/utils";

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const message =
		searchParams.get("message") ?? "Encrypt and sign this message";
	const topic = searchParams.get("topic") ?? "ecies";
	const { publicKey, privateKey } = createSigningKeyPair();
	const { publicKey: encryptionPublicKey, privateKey: encryptionPrivateKey } =
		createEncryptionKeyPair();
	const encryptedMessage = encryptAndSign({
		message,
		senderPrivateSigningKey: privateKey,
		receiverPublicEncryptionKey: encryptionPublicKey,
		topic,
	});
	const { ephemeralPublicKey, ciphertext, signature } =
		parseEciesMessage(encryptedMessage);
	const {
		iv,
		ciphertext: rawCiphertext,
		authTag,
	} = parseEncryptedMessage(ciphertext);
	const decryptedMessage = verifyAndDecrypt({
		message: encryptedMessage,
		topic,
		receiverPrivateEncryptionKey: encryptionPrivateKey,
		senderPublicSigningKey: publicKey,
	});
	const prettyPublicKey = formatPrettyPublicKey(publicKey).join("");
	const prettyEphemeralPublicKey =
		formatPrettyPublicKey(ephemeralPublicKey).join("");
	const [_, ...secondLineOnwards] = encryptedMessage.split("\n");

	return new Response(
		`${prettyPublicKey}\n${prettyEphemeralPublicKey}\n${secondLineOnwards}\n\n${JSON.stringify(
			{
				ephemeralPublicKey,
				signature,
				iv,
				rawCiphertext,
				authTag,
				decryptedMessage,
				senderPublicSigningKey: publicKey,
			},
			null,
			2,
		)}`,
	);
}
