/**
 * Password Hashing & Verification Utilities
 * 
 * Uses Web Crypto API (PBKDF2 with SHA-256 and 100,000 iterations).
 * Completely client-side and browser-native.
 */

// Helper to convert Uint8Array / ArrayBuffer to hex string
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Helper to convert hex string to Uint8Array
function hexToBuffer(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0) {
    return new Uint8Array(0);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Hash a plaintext password with a random 16-byte salt using PBKDF2 (SHA-256, 100,000 iterations).
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} Format: `${saltHex}:${hashHex}`
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  // Generate 16 random bytes for salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256 // 256 bits = 32 bytes
  );

  const saltHex = bufferToHex(salt);
  const hashHex = bufferToHex(derivedBits);

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a plaintext password against a stored `${saltHex}:${hashHex}` string.
 * Uses constant-time byte-by-byte comparison to prevent timing attacks.
 * @param {string} password - The plaintext password to check.
 * @param {string} storedHash - The stored string in format `${saltHex}:${hashHex}`.
 * @returns {Promise<boolean>} True if password matches, false otherwise.
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string') {
    return false;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const [saltHex, expectedHashHex] = parts;
  const salt = hexToBuffer(saltHex);
  const expectedHashBytes = hexToBuffer(expectedHashHex);

  if (salt.length !== 16 || expectedHashBytes.length === 0) {
    return false;
  }

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  const derivedBytes = new Uint8Array(derivedBits);

  if (derivedBytes.length !== expectedHashBytes.length) {
    return false;
  }

  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < derivedBytes.length; i++) {
    diff |= derivedBytes[i] ^ expectedHashBytes[i];
  }

  return diff === 0;
}
