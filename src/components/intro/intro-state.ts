"use client";

import { useSyncExternalStore } from "react";

export type IntroPhase = "playing" | "crossfade" | "complete";

let hasIntroPlayedInRuntime = false;
let currentPhase: IntroPhase = "playing";
const listeners = new Set<() => void>();

export function getHasIntroPlayed(): boolean {
  return hasIntroPlayedInRuntime;
}

export function getIntroPhase(): IntroPhase {
  return currentPhase;
}

export function setIntroPhase(phase: IntroPhase) {
  currentPhase = phase;
  if (phase === "complete") {
    hasIntroPlayedInRuntime = true;
  }
  listeners.forEach((fn) => fn());
}

export function skipIntroDirectly() {
  hasIntroPlayedInRuntime = true;
  currentPhase = "complete";
  listeners.forEach((fn) => fn());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function useIntroPhase(): IntroPhase {
  return useSyncExternalStore(
    subscribe,
    () => (hasIntroPlayedInRuntime ? "complete" : currentPhase),
    () => "playing" // Matches initial client state so no hydration mismatch
  );
}
