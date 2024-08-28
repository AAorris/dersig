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
import walkthrough from "@/lib/walkthrough";

export const runtime = "edge";

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
								<Label htmlFor="verifierPublicKey">Public Key:</Label>
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
								<Label htmlFor="signature">Signature:</Label>
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

				<Card />

				<Card>
					<CardHeader>
						<CardTitle>Outcome</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mt-4 flex items-center">
							<span className="mr-2">Verification Result:</span>
							{data.verified ? (
								<CheckCircleIcon className="text-green-500 h-6 w-6" />
							) : (
								<XCircleIcon className="text-red-500 h-6 w-6" />
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="w-full max-w-4xl">
				<CardHeader>
					<CardTitle>Data Flow</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0 md:space-x-4">
						<div className="text-center w-1/3">
							<h3 className="text-lg font-semibold">Signer</h3>
							<p>Owns Private Key</p>
							<p>Generates Signatures</p>
						</div>
						<ArrowRightIcon className="h-8 w-8 text-primary" />
						<div className="text-center w-1/3">
							<h3 className="text-lg font-semibold">Verifier</h3>
							<p>Knows public Key</p>
							<p>Verifies Signature</p>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<p className="text-center mx-auto">
						(Message must be passed along with the signature or known ahead of
						time)
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
