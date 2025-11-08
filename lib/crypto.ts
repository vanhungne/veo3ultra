// lib/crypto.ts - RSA Signing & Verification
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// RSA Private Key (same as Python app)
const PRIVATE_KEY_PEM = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA8Sp6u0xiwQDdWlinmmbSxvrjxmyYsIQf3IZjUg6BVrMTQTeY
8dOlVmc+ro1d9/fOVt+TAklJv8WbQrjrU1pLACeWwPJoOXatzqDwZqXYzQmPnxOn
tOoeaDTh5IADUUK1q+rfeVNNByA6Hdg5+SQIoU3LR/TT+GpSiKiYaCPBkGTd3Bax
5lGs4eEsL+2wgbLvfOif9qEp0HbxYE9teB45JyblSHCAaQD30YOzZm5hMkbOW8oG
nGyZZe6KVT3AYo8xugORVu6YTfRrOty8FjDd73pNTslBT25P725s/bPP305rp81+
NIpXmuPzK4gZn8MVUt+A1KgwBGRhd/JHrDbjDQIDAQABAoIBADsgOonb/uQptZs2
XBUHO4rsLNbTfhXctsEGs6gFBWG/sqtNGbLEPGd0FZKO9yhZuV1kH/MyC6I4LMoN
cyhy3StzCUtRwwq/lXowy++mnoIaY3tRQs8gjQboXC980RNlowu8oEBrE1n5ZTY2
8nOqCXGelIWWOTfQvV5i00bI6WZgUofTBxGwvVc4yrAbQuOe2oYA2BVvYWllOye1
CEjR+7wJ8fsZE55a30ZjVIrD6xDXvL5SUW4OjKPQYl7UXdUtaQWQuaXp96WHW8LQ
6+tKxCms780gfcSYsXDaXDDAkhYZcnO31DwxFt8aOrJDgM02NJ3Kd3K3uPBHMjPC
5e/R2OMCgYEA/LzBK4jr8osf76/940qbug8LVPUWzj19ZPOt/znVPMajkyNAvlDe
kqtE3YmNRMF4pV/otiBzn0K2eCFLiqpAbF9mlJs7mi7K87Cc6UDDRjvudrt9+ZMr
3ErPKzcdcOyOodLQD6NdBcmjrrP+L7SnTPqttynDINa45HXxELeK+j8CgYEA9Ed7
2Euy+DLTBMzkk7k/6igxRfeA3T0aUEFSgfp4jWONoxVG2WvEA+Q79/clKacZcveD
eWjcjMTnj0/K+QgB8JqYaT/JwG4XyPAWuKD7fZzCwkSdAlSuYTtjpMvTOo4X4UQ4
YEBMC4LL4bUr6MaZM0LyYSM5cd21hLAoDDRh17MCgYAFeOTJ14YcU0zWuL3LjRMA
HVFGfqQGxSgQ5oHO8+adEUP7bJj7Re77x/+OuGq5oWLGWeRFBUDbousmgLoM/5Cz
iAFFmHLa7MZyLlHHbyKLQ8LvCTI6FCiv9WK08dWOW2DfOhxNKmFaPbpwju8jA0tY
DFl0jM/vxxZrw+37Sa4VqwKBgQCDOKcxcLCqHXs3t+0N4dSQr5iQcj0aG4m4FO8C
fY8mvJTIR1Sw1PAN+xuvv2aKMoY8OPO6U3cuc1PEq2NoVUHdgt5eo3J4WWuTeE1s
TqXqOzxv6TXCm8S03JdRXmCQsuXnD6ONKNzwzglBrPXybES9wbe8MJTaMvQgXBSX
QchRewKBgQC9K4JR+7fUWGrEdWQnAb8IfnYxF5mdofRSqmBlhCkdrJQzU8RSrB/Y
SgOLp2qeCLo7B3e6JXJJrhMekTowOTNrvEgvEb6G8+RjR2A/7EgOdiK0+771uaho
ER4z0a8pXrIqt4Be/kf4wf7L4wShcBhK6dlH+WvdDQtDPkDYmvnkVw==
-----END RSA PRIVATE KEY-----`;

// RSA Public Key (for verification)
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8Sp6u0xiwQDdWlinmmbS
xvrjxmyYsIQf3IZjUg6BVrMTQTeY8dOlVmc+ro1d9/fOVt+TAklJv8WbQrjrU1pL
ACeWwPJoOXatzqDwZqXYzQmPnxOntOoeaDTh5IADUUK1q+rfeVNNByA6Hdg5+SQI
oU3LR/TT+GpSiKiYaCPBkGTd3Bax5lGs4eEsL+2wgbLvfOif9qEp0HbxYE9teB45
JyblSHCAaQD30YOzZm5hMkbOW8oGnGyZZe6KVT3AYo8xugORVu6YTfRrOty8FjDd
73pNTslBT25P725s/bPP305rp81+NIpXmuPzK4gZn8MVUt+A1KgwBGRhd/JHrDbj
DQIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Sign a license token (same format as Python)
 * Format: DID|OWNER|YYYY-MM-DD|BASE64_SIGNATURE
 */
export function signLicense(deviceId: string, owner: string, expiryDate: string): string {
  try {
    // Clean owner (remove pipes to avoid conflicts)
    const cleanOwner = owner.replace(/\|/g, ' ').trim();
    const message = `${deviceId}|${cleanOwner}|${expiryDate}`;
    
    // Load private key - Node.js should auto-detect format
    let privateKey: crypto.KeyObject;
    try {
      // Try as-is first (Node.js should auto-detect PKCS1 or PKCS8)
      privateKey = crypto.createPrivateKey(PRIVATE_KEY_PEM);
    } catch (e1) {
      try {
        // Try explicitly as PKCS1
        privateKey = crypto.createPrivateKey({
          key: PRIVATE_KEY_PEM,
          format: 'pem',
          type: 'pkcs1',
        });
      } catch (e2) {
        // Last try: as PKCS8
        privateKey = crypto.createPrivateKey({
          key: PRIVATE_KEY_PEM,
          format: 'pem',
          type: 'pkcs8',
        });
      }
    }
    
    // Sign with SHA256 (same as Python: PKCS1v15 + SHA256)
    const sign = crypto.createSign('SHA256');
    sign.update(message, 'utf8');
    sign.end();
    
    const signature = sign.sign(privateKey);
    const signatureBase64 = signature.toString('base64');
    
    return `${message}|${signatureBase64}`;
  } catch (error) {
    console.error('Error signing license:', error);
    console.error('DeviceId:', deviceId);
    console.error('Owner:', owner);
    console.error('ExpiryDate:', expiryDate);
    throw new Error(`Failed to sign license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify a license token
 */
export function verifyLicense(token: string): {
  valid: boolean;
  deviceId?: string;
  owner?: string;
  expiryDate?: string;
  error?: string;
} {
  try {
    const parts = token.split('|');
    if (parts.length !== 4) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [deviceId, owner, expiryDate, signatureBase64] = parts;
    const message = `${deviceId}|${owner}|${expiryDate}`;
    
    const verify = crypto.createVerify('SHA256');
    verify.update(message);
    verify.end();
    
    const signature = Buffer.from(signatureBase64, 'base64');
    const isValid = verify.verify(PUBLIC_KEY_PEM, signature);
    
    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // Check expiry
    const expiry = new Date(expiryDate);
    const now = new Date();
    
    if (expiry < now) {
      return { valid: false, error: 'License expired', deviceId, owner, expiryDate };
    }
    
    return { valid: true, deviceId, owner, expiryDate };
  } catch (error) {
    return { valid: false, error: 'Verification failed' };
  }
}

/**
 * Parse license token without verification
 */
export function parseLicense(token: string): {
  deviceId: string;
  owner: string;
  expiryDate: string;
  signature: string;
} | null {
  const parts = token.split('|');
  if (parts.length !== 4) return null;
  
  return {
    deviceId: parts[0],
    owner: parts[1],
    expiryDate: parts[2],
    signature: parts[3],
  };
}

