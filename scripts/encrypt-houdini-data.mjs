#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, pbkdf2Sync, createCipheriv } from "node:crypto";

function getArg(name, fallback = "") {
  const pair = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (!pair) {
    return fallback;
  }
  return pair.slice(name.length + 1);
}

function toBase64(buffer) {
  return Buffer.from(buffer).toString("base64");
}

async function main() {
  const inputPath = getArg("--in", "apps/HoudinisNotebook/data.json");
  const outputPath = getArg("--out", "apps/HoudinisNotebook/data.enc");
  const password = getArg("--password", process.env.HOUDINI_DATA_PASSWORD || "");
  const iterations = Number(getArg("--iter", "310000"));

  if (!password) {
    console.error("Error: password kosong. Gunakan --password=... atau env HOUDINI_DATA_PASSWORD.");
    process.exit(1);
  }

  if (!Number.isInteger(iterations) || iterations < 100000) {
    console.error("Error: iterasi PBKDF2 harus integer >= 100000.");
    process.exit(1);
  }

  const plaintext = await readFile(inputPath);

  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(password, salt, iterations, 32, "sha256");

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const ciphertext = Buffer.concat([encrypted, authTag]);

  const payload = {
    v: 1,
    alg: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iter: iterations,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ct: toBase64(ciphertext)
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Encrypted: ${inputPath}`);
  console.log(`Output   : ${outputPath}`);
  console.log(`Iter     : ${iterations}`);
}

main().catch((error) => {
  console.error("Encryption failed:", error.message);
  process.exit(1);
});
