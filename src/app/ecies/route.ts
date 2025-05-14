import { encryptAndSign, verifyAndDecrypt } from "@/lib/ecies";
import { createIdentity } from "@/lib/dersig";
import { computeSecretWithIdentity, encrypt } from "@/lib/encryption";

export async function GET(request: Request) {
	// We'll fabricate the input data
	// const { message, senderKeys, recipientIdentity, topic } = await request.json();
	const message = "Hello, world!";
	const senderIdentity = createIdentity();
	const recipientIdentity = createIdentity();
	const topic = "test";
	const encryptedMessage = encryptAndSign(
		message,
		senderIdentity,
		recipientIdentity,
		topic,
	);

	const plainEncryptedMessage = encrypt(
		computeSecretWithIdentity(senderIdentity, recipientIdentity, topic),
		message,
	);
	const decryptedMessage = verifyAndDecrypt(
		encryptedMessage,
		recipientIdentity,
		senderIdentity,
		topic,
	);

	return new Response(
		JSON.stringify(
			{
				encryptedMessage,
				plainEncryptedMessage,
				decryptedMessage,
				vars: {
					senderIdentity,
					recipientIdentity,
					topic,
					message,
				},
			},
			null,
			2,
		),
	);
}
