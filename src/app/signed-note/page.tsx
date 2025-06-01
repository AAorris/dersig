import { createSigningKeyPair } from "@/lib/signing";
import { createEncryptionKeyPair } from "@/lib/encryption";
import { signNote, verifyNote } from "@/lib/signed-note";
import { encryptAndSign, verifyAndDecrypt } from "@/lib/signed-encryption";
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
    signedNote: string;
    isValid: boolean;
    signerPublicKey: string;
    recipientPublicKey?: string;
    message: string;
    isEncrypted?: boolean;
    encryptedMessage?: string;
  };
}

async function processSignedNote(formData: FormData): Promise<SignedNoteResult> {
  'use server';

  const message = formData.get('message') as string;
  const signerPrivateKey = formData.get('signerPrivateKey') as string;
  const signerPublicKey = formData.get('signerPublicKey') as string;
  const recipientPublicKey = formData.get('recipientPublicKey') as string;
  const enableEncryption = formData.get('enableEncryption') === 'on';
  const recipientEncryptionKey = formData.get('recipientEncryptionKey') as string;

  console.log('Form data received:', {
    message: `${message?.substring(0, 50)}...`,
    hasSignerPrivateKey: !!signerPrivateKey,
    hasSignerPublicKey: !!signerPublicKey,
    enableEncryption,
    hasRecipientEncryptionKey: !!recipientEncryptionKey
  });

  if (!message || !signerPrivateKey || !signerPublicKey) {
    return {
      success: false,
      error: 'Message and signing keys are required'
    };
  }

  if (enableEncryption && !recipientEncryptionKey) {
    return {
      success: false,
      error: 'Recipient encryption key is required when encryption is enabled'
    };
  }

  try {
    if (enableEncryption && recipientEncryptionKey) {
      console.log('Creating encrypted message...');
      // Create encrypted and signed message
      const encryptedMessage = encryptAndSign({
        message,
        senderPrivateSigningKey: signerPrivateKey,
        receiverPublicEncryptionKey: recipientEncryptionKey,
        topic: 'signed-note'
      });

      // For encrypted messages, we create a signed note that contains the encrypted content
      const signedNote = signNote({
        message: encryptedMessage,
        signerPrivateKey,
        recipientPublicKey,
        senderPublicKey: signerPublicKey,
      });

      // Verify the signed note
      const verification = verifyNote({
        signedNote,
        senderPublicKey: signerPublicKey,
      });

      console.log('Encrypted message created successfully');
      return {
        success: true,
        data: {
          originalMessage: message,
          signedNote,
          isValid: verification.isValid,
          signerPublicKey: verification.senderPublicKey,
          recipientPublicKey: verification.recipientPublicKey,
          message: verification.message,
          isEncrypted: true,
          encryptedMessage,
        }
      };
    }

    console.log('Creating regular signed note...');
    // Create the regular signed note
    const signedNote = signNote({
      message,
      signerPrivateKey,
      recipientPublicKey: recipientPublicKey || undefined,
      senderPublicKey: signerPublicKey,
    });

    // Verify the signed note to validate
    const verification = verifyNote({
      signedNote,
      senderPublicKey: signerPublicKey,
    });

    console.log('Regular signed note created successfully');
    return {
      success: true,
      data: {
        originalMessage: message,
        signedNote,
        isValid: verification.isValid,
        signerPublicKey: verification.senderPublicKey,
        recipientPublicKey: verification.recipientPublicKey,
        message: verification.message,
        isEncrypted: false,
      }
    };
  } catch (error) {
    console.error('Error processing signed note:', error);
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
  // Generate fresh signing key pair for demonstration
  const signerKeys = createSigningKeyPair();

  // Generate fresh encryption key pair for demonstration
  const encryptionKeys = createEncryptionKeyPair();

  // Get default values from search params or use defaults
  const defaultMessage = typeof searchParams.message === 'string'
    ? searchParams.message
    : 'This is my signed message.';

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Signed Note</h1>
        <p className="text-muted-foreground mb-4">
          Sign a text message with your digital signature. Like signing a letter, but cryptographically secure.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium mb-2">What is this?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Think of this like signing a paper document, but digital. When you sign a message:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Anyone can verify</strong> it really came from you</li>
            <li>• <strong>No one can fake</strong> your signature</li>
            <li>• <strong>Any changes</strong> to the message will break the signature</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Try it below - type a message, hit sign, and see how it works. You can also enable encryption to make the message readable only by the intended recipient.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <SignedNoteForm
          signerKeys={signerKeys}
          encryptionKeys={encryptionKeys}
          defaultMessage={defaultMessage}
          processSignedNote={processSignedNote}
        />

        <Card>
          <CardHeader>
            <CardTitle>How Digital Signatures Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">The Process</h4>
                <ol className="space-y-1 text-muted-foreground">
                  <li>1. <strong>You have a key pair</strong>: A private key (secret) and public key (shareable)</li>
                  <li>2. <strong>Signing</strong>: Your private key creates a unique signature for your message</li>
                  <li>3. <strong>Verifying</strong>: Anyone with your public key can prove you signed it</li>
                  <li>4. <strong>Tampering</strong>: Change even one letter and the signature breaks</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">Why This Matters</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Software updates (proving they are from the real company)</li>
                  <li>• Legal documents (digital contracts)</li>
                  <li>• Cryptocurrency (proving you own your coins)</li>
                  <li>• Email security (proving emails are not spoofed)</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium mb-2">The Format</h4>
              <p className="text-sm text-muted-foreground mb-2">Your signed message looks like this:</p>
              <pre className="text-xs bg-white border rounded p-2 font-mono">
                {`~~~
Your message goes here
~~~
your-public-key-here
signature-goes-here`}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">Simple, readable, and cryptographically secure.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 