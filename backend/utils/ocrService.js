import vision from "@google-cloud/vision";
import { createWorker } from "tesseract.js";
import crypto from "crypto";

let visionClient = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    visionClient = new vision.ImageAnnotatorClient();
  }
} catch (err) {
  console.warn("Cloud Vision client not initialized, will use Tesseract fallback:", err.message);
}

async function runCloudVision(imageBuffer) {
  const [result] = await visionClient.textDetection({ image: { content: imageBuffer } });
  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) return { text: "", confidence: 0 };
  return { text: detections[0].description, confidence: 0.9 };
}

async function runTesseract(imageBuffer) {
  const worker = await createWorker("eng");
  const { data } = await worker.recognize(imageBuffer);
  await worker.terminate();
  return { text: data.text, confidence: (data.confidence || 0) / 100 };
}

export async function extractTextFromImage(imageBuffer) {
  if (visionClient) {
    try {
      return await runCloudVision(imageBuffer);
    } catch (err) {
      console.warn("Cloud Vision failed, falling back to Tesseract:", err.message);
    }
  }
  return runTesseract(imageBuffer);
}

export function parseReceiptText(rawText) {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const HEADER_SKIP = /total|date|gst|est\.|order|host|address|ave|st\.|rd\.|blvd|#|:|\d{3,}/i;
  const merchant =
    lines.find((l) => l.length > 2 && !/^\d/.test(l) && !HEADER_SKIP.test(l)) ||
    lines.find((l) => l.length > 2 && !/^\d/.test(l)) ||
    "Unknown Merchant";

  const dateMatch = rawText.match(
    /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})|(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/
  );
  const date = dateMatch ? dateMatch[0] : null;

  const totalMatches = [
    ...rawText.matchAll(/(?:total|balance\s*due)[^\d]{0,10}[\$₹€£]?\s*(\d+[.,]?\d{0,2})/gi),
  ];
  let totalAmount = null;
  if (totalMatches.length > 0) {
    const amounts = totalMatches.map((m) => parseFloat(m[1].replace(",", "")));
    totalAmount = Math.max(...amounts);
  }

  const taxMatch = rawText.match(/(?:gst|tax|cgst|sgst)[^\d]{0,10}[\$₹€£]?\s*(\d+[.,]?\d{0,2})/i);
  const tax = taxMatch ? parseFloat(taxMatch[1].replace(",", "")) : 0;

  const items = [];
  const itemLineRegex = /^(.{2,50}?)\s{2,}(?:x?\d+\s+)?[\$₹€£rs\.]*\s*(\d+[.,]\d{2})\s*$/i;
  const itemLineFallback = /^(.{2,50}?)\s+[\$₹€£]\s*(\d+[.,]\d{2})\s*$/i;

  const SKIP_PATTERN =
    /total|subtotal|gst|tax|change|cash|card|thank|balance|authorize|visa|mastercard|amex|host|order|like us|facebook|email|special|auth|x{3,}|^\*/i;

  for (const line of lines) {
    if (SKIP_PATTERN.test(line)) continue;

    const match = line.match(itemLineRegex) || line.match(itemLineFallback);
    if (match) {
      const name = match[1].trim().replace(/[-:]+$/, "").trim();
      const price = parseFloat(match[2].replace(",", "."));
      if (
        name.length > 1 &&
        !isNaN(price) &&
        price > 0 &&
        price < (totalAmount || Infinity) + 1
      ) {
        const alreadyAdded = items.some((it) => it.name === name && it.price === price);
        if (!alreadyAdded) items.push({ name, price, quantity: 1 });
      }
    }
  }

  return {
    merchant,
    date,
    totalAmount,
    tax,
    items,
    rawText,
  };
}

export function hashReceiptImage(imageBuffer) {
  return crypto.createHash("sha256").update(imageBuffer).digest("hex");
}
