import { createSigningKeyPair } from "@/lib/signing";
import { createEncryptionKeyPair } from "@/lib/encryption";
import { encryptAndSign, verifyAndDecrypt, parseEciesMessage } from "@/lib/signed-encryption";
import { parseEncryptedMessage } from "@/lib/encryption";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignedNoteForm } from "@/components/SignedNoteForm";

interface SignedNoteResult {
  success: boolean;
  error?: string;
  data?: {
    originalMessage: string;
    topic: string;
    encryptedMessage: string;
    decryptedMessage: string;
    isValid: boolean;
    senderSigningKeys: {
      privateKey: string;
      publicKey: string;
    };
    recipientEncryptionKeys: {
      privateKey: string;
      publicKey: string;
    };
    parsedMessage: {
      ephemeralPublicKey: string;
      ciphertext: string;
      signature: string;
      iv: string;
      rawCiphertext: string;
      authTag: string;
    };
  };
}

async function processSignedNote(formData: FormData): Promise<SignedNoteResult> {
  'use server';

  const message = formData.get('message') as string;
  const topic = formData.get('topic') as string;
  const senderSigningPrivateKey = formData.get('senderSigningPrivateKey') as string;
  const senderSigningPublicKey = formData.get('senderSigningPublicKey') as string;
  const recipientEncryptionPrivateKey = formData.get('recipientEncryptionPrivateKey') as string;
  const recipientEncryptionPublicKey = formData.get('recipientEncryptionPublicKey') as string;

  if (!message || !topic || !senderSigningPrivateKey || !senderSigningPublicKey ||
    !recipientEncryptionPrivateKey || !recipientEncryptionPublicKey) {
    return {
      success: false,
      error: 'All fields are required'
    };
  }

  try {
    // Create the signed encrypted message
    const encryptedMessage = encryptAndSign({
      message,
      senderPrivateSigningKey: senderSigningPrivateKey,
      receiverPublicEncryptionKey: recipientEncryptionPublicKey,
      topic,
    });

    // Verify and decrypt the message to validate
    const decryptedMessage = verifyAndDecrypt({
      message: encryptedMessage,
      topic,
      receiverPrivateEncryptionKey: recipientEncryptionPrivateKey,
      senderPublicSigningKey: senderSigningPublicKey,
    });

    const isValid = decryptedMessage === message;

    // Parse the encrypted message components
    const { ephemeralPublicKey, ciphertext, signature } = parseEciesMessage(encryptedMessage);
    const { iv, ciphertext: rawCiphertext, authTag } = parseEncryptedMessage(ciphertext);

    return {
      success: true,
      data: {
        originalMessage: message,
        topic,
        encryptedMessage,
        decryptedMessage,
        isValid,
        senderSigningKeys: {
          privateKey: senderSigningPrivateKey,
          publicKey: senderSigningPublicKey,
        },
        recipientEncryptionKeys: {
          privateKey: recipientEncryptionPrivateKey,
          publicKey: recipientEncryptionPublicKey,
        },
        parsedMessage: {
          ephemeralPublicKey,
          ciphertext,
          signature,
          iv,
          rawCiphertext,
          authTag,
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process signed note: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export default function SignedNotePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Generate fresh key pairs for demonstration
  const senderSigningKeys = createSigningKeyPair();
  const recipientEncryptionKeys = createEncryptionKeyPair();

  // Get default values from search params or use defaults
  const defaultMessage = typeof searchParams.message === 'string'
    ? searchParams.message
    : 'This is a secret message that will be signed and encrypted.';
  const defaultTopic = typeof searchParams.topic === 'string'
    ? searchParams.topic
    : 'signed-note';

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Signed Note</h1>
        <p className="text-muted-foreground">
          Create a cryptographically signed and encrypted message using Ed25519 signing keys and X25519 encryption keys.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Key Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Key Pairs</CardTitle>
            <CardDescription>
              Fresh key pairs generated for this session. In a real application, these would be persistent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Sender Signing Keys (Ed25519)</Label>
                <div className="space-y-2 mt-2">
                  <div>
                    <Label htmlFor="senderSigningPublicKey" className="text-xs text-muted-foreground">Public Key</Label>
                    <Input
                      id="senderSigningPublicKey"
                      name="senderSigningPublicKey"
                      value={senderSigningKeys.publicKey}
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderSigningPrivateKey" className="text-xs text-muted-foreground">Private Key</Label>
                    <Input
                      id="senderSigningPrivateKey"
                      name="senderSigningPrivateKey"
                      value={senderSigningKeys.privateKey}
                      readOnly
                      className="font-mono text-xs"
                      type="password"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Recipient Encryption Keys (X25519)</Label>
                <div className="space-y-2 mt-2">
                  <div>
                    <Label htmlFor="recipientEncryptionPublicKey" className="text-xs text-muted-foreground">Public Key</Label>
                    <Input
                      id="recipientEncryptionPublicKey"
                      name="recipientEncryptionPublicKey"
                      value={recipientEncryptionKeys.publicKey}
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientEncryptionPrivateKey" className="text-xs text-muted-foreground">Private Key</Label>
                    <Input
                      id="recipientEncryptionPrivateKey"
                      name="recipientEncryptionPrivateKey"
                      value={recipientEncryptionKeys.privateKey}
                      readOnly
                      className="font-mono text-xs"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Form with Results - Client Component */}
        <SignedNoteForm
          senderSigningKeys={senderSigningKeys}
          recipientEncryptionKeys={recipientEncryptionKeys}
          defaultMessage={defaultMessage}
          defaultTopic={defaultTopic}
          processSignedNote={processSignedNote}
        />

        {/* How it Works Section */}
        <Card>
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. <strong>Key Generation:</strong> Ed25519 keys for signing and X25519 keys for encryption are generated.</p>
            <p>2. <strong>Encryption:</strong> The message is encrypted using ECIES (Elliptic Curve Integrated Encryption Scheme).</p>
            <p>3. <strong>Signing:</strong> The encrypted message is signed with the sender's private signing key.</p>
            <p>4. <strong>Verification:</strong> The signature is verified and the message is decrypted to validate the process.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 