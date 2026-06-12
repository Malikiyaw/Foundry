const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const ITERATIONS = 100000;
const HASH = 'SHA-256';

function buf2hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hex2buf(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

export async function hashPassphrase(passphrase: string, salt?: Uint8Array): Promise<{ hash: string; salt: string }> {
  const s = salt || crypto.getRandomValues(new Uint8Array(32));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: s, iterations: ITERATIONS, hash: HASH }, key, 256);
  return { hash: buf2hex(bits), salt: buf2hex(s) };
}

export async function encryptData(plaintext: string, passphrase: string, salt: string): Promise<{ ciphertext: string; iv: string }> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: hex2buf(salt), iterations: ITERATIONS, hash: HASH },
    keyMaterial, { name: ALGORITHM, length: KEY_LENGTH }, false, ['encrypt', 'decrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, new TextEncoder().encode(plaintext));
  return { ciphertext: buf2hex(encrypted), iv: buf2hex(iv) };
}

export async function decryptData(ciphertext: string, passphrase: string, salt: string, iv: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: hex2buf(salt), iterations: ITERATIONS, hash: HASH },
    keyMaterial, { name: ALGORITHM, length: KEY_LENGTH }, false, ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv: hex2buf(iv) }, key, hex2buf(ciphertext));
  return new TextDecoder().decode(decrypted);
}

export async function encryptApiKey(apiKey: string, passphrase: string): Promise<{ keyHint: string; encryptedKey: string; iv: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH },
    keyMaterial, { name: ALGORITHM, length: KEY_LENGTH }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, new TextEncoder().encode(apiKey));
  return {
    keyHint: apiKey.slice(-4),
    encryptedKey: salt + iv + new Uint8Array(encrypted),
    iv: '',
  };
}

export async function decryptApiKey(stored: { encryptedKey: string }, passphrase: string): Promise<string> {
  const raw = typeof stored.encryptedKey === 'string' ? hex2buf(stored.encryptedKey) : stored.encryptedKey;
  const salt = raw.slice(0, 32);
  const iv = raw.slice(32, 44);
  const data = raw.slice(44);
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH },
    keyMaterial, { name: ALGORITHM, length: KEY_LENGTH }, false, ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export async function deriveEncryptionKey(passphrase: string, salt: Uint8Array): Promise<{ key: CryptoKey; iv: Uint8Array }> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH },
    keyMaterial, { name: ALGORITHM, length: KEY_LENGTH }, false, ['encrypt', 'decrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return { key, iv };
}
