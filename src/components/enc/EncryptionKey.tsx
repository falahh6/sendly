"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

async function generateEncryptionKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

async function exportKey(key: CryptoKey) {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

async function encryptWithPublicKey(
  publicKeyString: string,
  data: string | undefined
) {
  const publicKeyBase64 = publicKeyString.includes("-----")
    ? publicKeyString
        .replace(/-----BEGIN PUBLIC KEY-----/, "")
        .replace(/-----END PUBLIC KEY-----/, "")
        .replace(/\n/g, "")
    : publicKeyString;

  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0)),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    new TextEncoder().encode(data)
  );

  return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
}

export default function Encryption({
  userAuthToken,
  encKey,
}: Readonly<{
  userAuthToken: string;
  encKey?: string;
}>) {
  let init = true;
  const [encryptLoading, setEncryptLoading] = useState(true);

  useEffect(() => {
    if (init) {
      handleEncryptionKeySetup(userAuthToken);
      init = false;
    }
  }, []);

  async function handleEncryptionKeySetup(authToken: string) {
    const encryptionKey = await generateEncryptionKey();
    const exportedKey = await exportKey(encryptionKey);

    if (encKey) {
      console.log("User-specific encryption key already exists.");
      setEncryptLoading(false);
      return;
    }

    const response = await fetch("/api/enc/public-key");
    const { publicKey } = await response.json();

    const encryptedUserKey = await encryptWithPublicKey(publicKey, exportedKey);

    await fetch("/api/enc/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authToken, encryptedUserKey }),
    }).finally(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setEncryptLoading(false);
    });

    console.log("User-specific encryption key setup complete.");
  }

  if (encryptLoading)
    return (
      <div className="backdrop-blur-sm h-screen fixed top-0 w-full z-10 overflow-y-hidden">
        <div className="h-[10vh] py-2 bg-gradient-to-b from-gray-400 to-transparent flex items-center justify-center">
          <p className="text-sm font-semibold">
            <Loader className="animate-spin inline" /> Your encryption keys are
            being set up securely...
          </p>
        </div>
      </div>
    );
}
