const SECRETS = new Set<string>();

export function registerSecret(s: string): void {
  if (!s || s.length === 0) return;
  SECRETS.add(s);
}

// Matches base64 tokens of at least 12 chars (covers anything realistically
// holding credential material). Allows trailing '=' padding.
const BASE64_TOKEN = /[A-Za-z0-9+/]{12,}={0,2}/g;

function maskBase64Tokens(input: string): string {
  return input.replace(BASE64_TOKEN, (match) => {
    let decoded: string;
    try {
      decoded = Buffer.from(match, "base64").toString("utf8");
    } catch {
      return match;
    }
    for (const secret of SECRETS) {
      if (decoded.includes(secret)) return "REDACTED";
    }
    return match;
  });
}

export function redact(value: unknown): unknown {
  if (typeof value === "string") {
    let out = value;
    for (const secret of SECRETS) out = out.split(secret).join("REDACTED");
    out = maskBase64Tokens(out);
    return out;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = redact(v);
    return out;
  }
  return value;
}

export function _resetForTests(): void {
  SECRETS.clear();
}
