import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Extract IP address from Next.js request
 * Checks various headers for the real IP address
 */
export function getClientIP(request: NextRequest): string | null {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, ...)
  // The first one is usually the client's real IP
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  // Fallback to connection remote address
  // Note: In Next.js, this might not always be available
  return null;
}

/**
 * Hash IP address using SHA-256
 * This ensures privacy while still allowing duplicate detection
 * 
 * @param ip - The IP address to hash
 * @param salt - Optional salt for additional security (default: env variable or empty string)
 * @returns Hashed IP address as hex string
 */
export function hashIP(ip: string, salt?: string): string {
  const saltValue = salt || process.env.IP_HASH_SALT || '';
  const hash = createHash('sha256');
  hash.update(ip + saltValue);
  return hash.digest('hex');
}

/**
 * Get hashed IP from request
 * Convenience function that combines getClientIP and hashIP
 * 
 * @param request - Next.js request object
 * @returns Hashed IP address or null if IP cannot be determined
 */
export function getHashedIP(request: NextRequest): string | null {
  const ip = getClientIP(request);
  if (!ip) {
    return null;
  }
  return hashIP(ip);
}

/**
 * Validate IP address format (IPv4 or IPv6)
 */
export function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  
  if (ipv4Regex.test(ip)) {
    // Validate IPv4 octets are 0-255
    const octets = ip.split('.');
    return octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  return ipv6Regex.test(ip);
}
