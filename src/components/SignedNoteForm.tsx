'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface SignedNoteFormProps {
  senderSigningKeys: { privateKey: string; publicKey: string };
  recipientEncryptionKeys: { privateKey: string; publicKey: string };
  defaultMessage: string;
  defaultTopic: string;
  processSignedNote: (formData: FormData) => Promise<SignedNoteResult>;
}

export function SignedNoteForm({
  senderSigningKeys,
  recipientEncryptionKeys,
  defaultMessage,
  defaultTopic,
  processSignedNote
}: SignedNoteFormProps) {
  const [result, setResult] = useState<SignedNoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await processSignedNote(formData);
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Message Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Signed Note</CardTitle>
          <CardDescription>
            Enter your message and topic to create a signed and encrypted note.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {/* Hidden inputs for keys */}
            <input type="hidden" name="senderSigningPrivateKey" value={senderSigningKeys.privateKey} />
            <input type="hidden" name="senderSigningPublicKey" value={senderSigningKeys.publicKey} />
            <input type="hidden" name="recipientEncryptionPrivateKey" value={recipientEncryptionKeys.privateKey} />
            <input type="hidden" name="recipientEncryptionPublicKey" value={recipientEncryptionKeys.publicKey} />

            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                defaultValue={defaultTopic}
                placeholder="Enter topic for key derivation"
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                defaultValue={defaultMessage}
                placeholder="Enter your secret message here..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign and Encrypt Message'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {result && !result.success && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{result.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result?.success && result.data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Validation Result
                <Badge variant={result.data.isValid ? "default" : "destructive"}>
                  {result.data.isValid ? "Valid" : "Invalid"}
                </Badge>
              </CardTitle>
              <CardDescription>
                The message was successfully {result.data.isValid ? 'signed, encrypted, and verified' : 'processed but validation failed'}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Original Message</Label>
                <Textarea
                  value={result.data.originalMessage}
                  readOnly
                  rows={Math.min(Math.max(2, Math.ceil(result.data.originalMessage.length / 80)), 10)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Decrypted Message</Label>
                <Textarea
                  value={result.data.decryptedMessage}
                  readOnly
                  rows={Math.min(Math.max(2, Math.ceil(result.data.decryptedMessage.length / 80)), 10)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Messages Match:</Label>
                <Badge variant={result.data.isValid ? "default" : "destructive"}>
                  {result.data.isValid ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Encrypted Message (ECIES Format)</CardTitle>
              <CardDescription>
                The complete signed and encrypted message in ECIES format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Stringified ECIES Message</Label>
                <Textarea
                  value={result.data.encryptedMessage}
                  readOnly
                  rows={Math.min(Math.max(6, Math.ceil(result.data.encryptedMessage.length / 80)), 15)}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Parsed Components</Label>
                  <div className="grid gap-2 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Ephemeral Public Key</Label>
                      <Input
                        value={result.data.parsedMessage.ephemeralPublicKey}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Signature</Label>
                      <Input
                        value={result.data.parsedMessage.signature}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">IV</Label>
                      <Input
                        value={result.data.parsedMessage.iv}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Auth Tag</Label>
                      <Input
                        value={result.data.parsedMessage.authTag}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Raw Ciphertext</Label>
                      <Textarea
                        value={result.data.parsedMessage.rawCiphertext}
                        readOnly
                        rows={Math.min(Math.max(2, Math.ceil(result.data.parsedMessage.rawCiphertext.length / 80)), 8)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
} 