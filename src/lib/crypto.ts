// Client-side Web Crypto helpers — true zero-knowledge.
const dec = new TextDecoder();

function strToBytes(s: string): Uint8Array {
  const out = new Uint8Array(new ArrayBuffer(s.length * 4));
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) out[n++] = c;
    else if (c < 0x800) { out[n++] = 0xc0 | (c >> 6); out[n++] = 0x80 | (c & 0x3f); }
    else { out[n++] = 0xe0 | (c >> 12); out[n++] = 0x80 | ((c >> 6) & 0x3f); out[n++] = 0x80 | (c & 0x3f); }
  }
  return out.slice(0, n);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function ab(u8: Uint8Array): ArrayBuffer {
  const a = new ArrayBuffer(u8.byteLength);
  new Uint8Array(a).set(u8);
  return a;
}

export async function generateAesKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function exportKeyB64(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return bytesToBase64(new Uint8Array(raw));
}

export async function importKeyB64(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", ab(base64ToBytes(b64)), { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}

export interface EncryptResult {
  ciphertext: Uint8Array;
  iv: string;
  keyB64: string;
}

export async function encryptBytes(data: Uint8Array): Promise<EncryptResult> {
  const key = await generateAesKey();
  const ivBytes = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ab(ivBytes) }, key, ab(data));
  return {
    ciphertext: new Uint8Array(cipher),
    iv: bytesToBase64(ivBytes),
    keyB64: await exportKeyB64(key),
  };
}

export async function encryptText(text: string) {
  return encryptBytes(strToBytes(text));
}

export async function decryptBytes(ciphertext: Uint8Array, ivB64: string, keyB64: string): Promise<Uint8Array> {
  const key = await importKeyB64(keyB64);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ab(base64ToBytes(ivB64)) },
    key,
    ab(ciphertext),
  );
  return new Uint8Array(plain);
}

export async function decryptToText(ciphertextB64: string, ivB64: string, keyB64: string) {
  return dec.decode(await decryptBytes(base64ToBytes(ciphertextB64), ivB64, keyB64));
}

export async function generateRsaKeyPair() {
  return crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function rsaEncryptText(text: string, publicKey: CryptoKey) {
  const cipher = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, ab(strToBytes(text)));
  return bytesToBase64(new Uint8Array(cipher));
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", ab(strToBytes(input)));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateApiKey(): { full: string; prefix: string } {
  const random = crypto.getRandomValues(new Uint8Array(24));
  const body = bytesToBase64(random).replace(/[+/=]/g, "").slice(0, 32);
  const full = `sv_live_${body}`;
  return { full, prefix: full.slice(0, 12) };
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
