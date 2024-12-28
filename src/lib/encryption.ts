export async function encryptData(data: string, encryptionKey: CryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);

  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    encryptionKey,
    encodedData
  );

  return {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
    iv,
  };
}

export async function decryptData(
  encryptedData: string,
  iv: Uint8Array,
  decryptionKey: CryptoKey
) {
  const decodedData = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0)
  );

  const decryptedData = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    decryptionKey,
    decodedData
  );

  return new TextDecoder().decode(decryptedData);
}
