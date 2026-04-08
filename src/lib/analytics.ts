import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";

type EventType = "habit_completed" | "streak_broken" | "level_up";

export const trackEvent = (eventName: EventType, params?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  } else {
    // Fallback if analytics is somehow blocked but app is running
    console.debug(`[Analytics tracking disabled] ${eventName}`, params);
  }
};
