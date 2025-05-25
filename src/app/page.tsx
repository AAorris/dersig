import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from "lucide-react";
// import walkthrough from "@/lib/walkthrough";

export default async function CryptoOperations({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const privateKey =
		typeof searchParams.privateKey === "string"
			? searchParams.privateKey
			: undefined;
	const message =
		typeof searchParams.message === "string"
			? searchParams.message
			: "Hello, World!";

	const data = await walkthrough(message, privateKey);

	return (
		<div className="flex flex-col items-center space-y-4 p-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
				<Card className="col-span-1 md:col-span-2">
					<CardHeader>
						<CardTitle className="font-mono">Dersig</CardTitle>
						<CardDescription>
							<span className="block">
								Derive a public key to sign and verify messages — Trimmed
								ed25519{" "}
								<a href="/key" className="underline underline-offset-2">
									key
								</a>{" "}
								as base64 — Please generate real keys yourself by reviewing the
								source code.
							</span>
						</CardDescription>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Signer</CardTitle>
					</CardHeader>
					<CardContent>
						<form action="/" method="get" className="space-y-4">
							<div>
								<Label htmlFor="privateKey">Private Key:</Label>
								<Input
									id="privateKey"
									name="privateKey"
									defaultValue={data.priv}
									className="font-mono text-xs"
								/>
							</div>
							<div>
								<Label htmlFor="publicKey">Public Key:</Label>
								<Input
									id="publicKey"
									value={data.pub}
									readOnly
									className="font-mono text-xs text-gray-500"
								/>
							</div>
							<div>
								<Label htmlFor="message">Message:</Label>
								<Input
									id="message"
									name="message"
									defaultValue={message}
									className="font-mono text-xs"
								/>
							</div>
							<Button type="submit">Send Message</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Verifier</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<Label htmlFor="verifierPublicKey">Signer public Key:</Label>
								<Input
									id="verifierPublicKey"
									value={data.pub}
									readOnly
									className="font-mono text-xs text-gray-500"
								/>
							</div>
							<div>
								<Label htmlFor="verifierMessage">Message:</Label>
								<Input
									id="verifierMessage"
									value={message}
									readOnly
									className="font-mono text-xs text-gray-500"
								/>
							</div>
							<div>
								<span className="flex items-center justify-between pb-2">
									<Label htmlFor="signature">Signature:</Label>
									{data.verified ? (
										<CheckCircleIcon className="text-green-500 h-6 w-6" />
									) : (
										<XCircleIcon className="text-red-500 h-6 w-6" />
									)}
								</span>
								<Textarea
									id="signature"
									value={data.sig}
									readOnly
									className="font-mono text-xs text-gray-500"
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{searchParams.privateKey ? <Card className="w-full max-w-4xl">
				<CardHeader>
					<CardTitle>Hash Key Derivation</CardTitle>
				</CardHeader>
				<CardContent>
					<p>
						Derive a shared secret between the server and this private key:
						<a className="ml-1 underline underline-offset-2" href={`/hkdf?privateKey=${searchParams.privateKey}`}>
							HKDF
						</a>
					</p>
				</CardContent>
			</Card> : null}
		</div>
	);
}
