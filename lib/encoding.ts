import LZString from "lz-string";
import { QuoDeal } from "@/lib/types";

const PARAM = "d";

export function encodeDeal(deal: QuoDeal): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(deal));
}

export function decodeDeal(encoded: string): QuoDeal | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as QuoDeal;
  } catch {
    return null;
  }
}

export function getDealFromURL(): QuoDeal | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(PARAM);
  if (!encoded) return null;
  return decodeDeal(encoded);
}

export function setDealInURL(deal: QuoDeal): void {
  if (typeof window === "undefined") return;
  const encoded = encodeDeal(deal);
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, encoded);
  window.history.replaceState(null, "", url.toString());
}

export function clearDealFromURL(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM);
  window.history.replaceState(null, "", url.toString());
}
