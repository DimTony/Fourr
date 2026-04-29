import crypto from "crypto";
export function generatePkce() {
    // verifier — random 64-byte string, base64url encoded
    const verifier = crypto.randomBytes(64).toString("base64url"); // base64url = no padding, url-safe chars
    // challenge — SHA-256 of the verifier, also base64url encoded
    const challenge = crypto
        .createHash("sha256")
        .update(verifier)
        .digest("base64url");
    return { verifier, challenge };
}
