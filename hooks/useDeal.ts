"use client";

import { useReducer, useEffect, useCallback } from "react";
import { QuoDeal } from "@/lib/types";
import { createDefaultDeal } from "@/lib/defaults";
import { getDealFromURL, setDealInURL, clearDealFromURL } from "@/lib/encoding";

// ─── Actions ──────────────────────────────────────────────────────────────────

type DealAction =
  | { type: "SET_BASICS"; payload: Partial<QuoDeal["basics"]> }
  | { type: "SET_CONDITION"; payload: Partial<QuoDeal["condition"]> }
  | { type: "SET_UNIT_STRATEGY"; payload: Partial<QuoDeal["unitStrategy"]> }
  | {
      type: "SET_UNVERIFIED";
      payload: Partial<QuoDeal["unitStrategy"]["unverified"]>;
    }
  | { type: "SET_RISK_POSTURE"; payload: Partial<QuoDeal["riskPosture"]> }
  | { type: "SET_OFFER_INTENT"; payload: Partial<QuoDeal["offerIntent"]> }
  | { type: "LOAD"; payload: QuoDeal }
  | { type: "RESET" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function dealReducer(state: QuoDeal, action: DealAction): QuoDeal {
  switch (action.type) {
    case "SET_BASICS":
      return { ...state, basics: { ...state.basics, ...action.payload } };
    case "SET_CONDITION":
      return { ...state, condition: { ...state.condition, ...action.payload } };
    case "SET_UNIT_STRATEGY":
      return {
        ...state,
        unitStrategy: { ...state.unitStrategy, ...action.payload },
      };
    case "SET_UNVERIFIED":
      return {
        ...state,
        unitStrategy: {
          ...state.unitStrategy,
          unverified: {
            ...state.unitStrategy.unverified,
            ...action.payload,
          },
        },
      };
    case "SET_RISK_POSTURE":
      return {
        ...state,
        riskPosture: { ...state.riskPosture, ...action.payload },
      };
    case "SET_OFFER_INTENT":
      return {
        ...state,
        offerIntent: { ...state.offerIntent, ...action.payload },
      };
    case "LOAD":
      return action.payload;
    case "RESET":
      clearDealFromURL();
      return createDefaultDeal();
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDeal() {
  const [deal, dispatch] = useReducer(dealReducer, undefined, () => {
    // SSR-safe: start with defaults; URL restore happens in useEffect
    return createDefaultDeal();
  });

  // Restore from URL on mount
  useEffect(() => {
    const restored = getDealFromURL();
    if (restored) {
      dispatch({ type: "LOAD", payload: restored });
    }
  }, []);

  // Sync to URL on every change
  useEffect(() => {
    setDealInURL(deal);
  }, [deal]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return { deal, dispatch, reset };
}
