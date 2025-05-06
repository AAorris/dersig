"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileCheck, Fingerprint, Info, Key, Lock, MessageSquare, RefreshCw, Unlock } from "lucide-react"
import { useState } from "react"

// Define types for the data passed from the server
type CryptoData = {
  identities: {
    server: {
      fingerprint: string
      publicKey: string
    }
    client: {
      fingerprint: string
      publicKey: string
    }
  }
  messages: {
    encrypted: string
    sharedSecretFingerprintServer: string
    sharedSecretFingerprintClient: string
    decryptedServer: string
    decryptedClient: string
  }
}

type HKDFVisualizationProps = {
  initialData: CryptoData
}

export default function HKDFVisualization({ initialData }: HKDFVisualizationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<CryptoData>(initialData)
  // Function to fetch new cryptographic data from the server
  const refreshCryptography = async () => {
    if (!location.search.includes("privateKey")) {
      window.location.reload()
    } else {
      location.href = "/hkdf";
    }
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Secure Key Derivation</h1>
          <p className="text-muted-foreground">Visualizing HKDF cryptography in a friendly way</p>

          <Button onClick={refreshCryptography} className="mt-4" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Generate New Key
              </>
            )}
          </Button>
        </div>

        {/* User Identities */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Server Identity */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Fingerprint className="mr-2 h-5 w-5 text-primary" />
                  Server Identity
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>The server's cryptographic identity with a unique fingerprint</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>Server's unique cryptographic fingerprint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="font-mono text-xs py-1 px-2">
                  {data.identities.server.fingerprint}
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">{data.identities.server.publicKey}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-2 mt-2">
                {/* full pubkey */}
                <p className="font-mono text-xs">{data.identities.server.publicKey}</p>
              </div>
            </CardContent>
          </Card>

          {/* Client Identity */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Fingerprint className="mr-2 h-5 w-5 text-primary" />
                  User Identity
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Generated cryptographic identity with a unique fingerprint</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>Generated cryptographic agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="font-mono text-xs py-1 px-2">
                  {data.identities.client.fingerprint}
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">{data.identities.client.publicKey}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-2 mt-2">
                {/* full pubkey */}
                <p className="font-mono text-xs">{data.identities.client.publicKey}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decrypted Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Decrypted Messages
              </CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p> <code className="font-mono text-xs">{data.messages.encrypted}</code> — Message decrypted by both parties using their shared secret</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Messages decrypted by both server and user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Server's copy */}
                <div className="p-3 bg-muted rounded-lg">
                  {/** decrypted message */}
                  <div className="flex items-center mb-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <Unlock className="mr-2 h-4 w-4 text-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs">Shared secret fingerprint: {data.messages.sharedSecretFingerprintServer}</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-sm font-medium">My Copy</span>
                  </div>
                  <p className="text-sm">{data.messages.decryptedServer}</p>
                </div>

                {/* Client's copy */}
                <div className="p-3 bg-muted rounded-lg">
                  {/** decrypted message */}
                  <div className="flex items-center mb-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <Unlock className="mr-2 h-4 w-4 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs">Shared secret fingerprint: {data.messages.sharedSecretFingerprintClient}</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-sm font-medium">Their Copy</span>
                  </div>
                  <p className="text-sm">{data.messages.decryptedClient}</p>
                </div>
              </div>

              {/* Encrypted message (hidden in tooltip) */}
              <div className="flex items-center justify-center mt-2">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Lock className="mr-1 h-3 w-3" />
                      <span>View encrypted message</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs max-w-xs break-all">{data.messages.encrypted}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
