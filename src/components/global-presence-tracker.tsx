"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/utils/auth-helpers";

export function GlobalPresenceTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let presenceChannel: any = null;
    let bc: BroadcastChannel | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("readsmart_student_presence");
      }
    } catch {
      // ignore
    }

    const sendHeartbeat = async () => {
      const user = getCurrentUser();
      if (!user?.id || user.role === "teacher") return;

      const cleanName = (user.fullName || "").toLowerCase().trim();
      const cleanEmail = (user.email || "").toLowerCase().trim();
      const now = Date.now();

      // 1. Post to cross-tab BroadcastChannel
      if (bc) {
        bc.postMessage({
          type: "heartbeat",
          studentId: user.id,
          name: user.fullName,
          cleanName,
          email: user.email,
          cleanEmail,
          online: true,
          timestamp: now,
        });
      }

      // 2. Write to localStorage active student presence map
      try {
        const raw = localStorage.getItem("readsmart_online_students") || "{}";
        const map = JSON.parse(raw);
        map[user.id] = now;
        if (cleanName) map[cleanName] = now;
        if (cleanEmail) map[cleanEmail] = now;
        localStorage.setItem("readsmart_online_students", JSON.stringify(map));
      } catch {
        // ignore
      }

      // 3. Touch Supabase profiles.updated_at
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        void supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", user.id);
      } catch {
        // ignore
      }
    };

    // Initial heartbeat immediately
    void sendHeartbeat();

    // Regular interval every 15 seconds
    heartbeatInterval = setInterval(() => {
      void sendHeartbeat();
    }, 15000);

    // Supabase Realtime presence channel subscription
    import("@/utils/supabase/client")
      .then(({ createClient }) => {
        const user = getCurrentUser();
        if (!user?.id || user.role === "teacher") return;

        const supabase = createClient();
        presenceChannel = supabase.channel("readsmart_online_presence");
        presenceChannel.subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel.track({
              studentId: user.id,
              name: user.fullName,
              cleanName: (user.fullName || "").toLowerCase().trim(),
              email: user.email,
              cleanEmail: (user.email || "").toLowerCase().trim(),
              onlineAt: new Date().toISOString(),
            });
          }
        });
      })
      .catch(() => {});

    // Send heartbeat on window focus or visibility change
    const handleFocus = () => {
      void sendHeartbeat();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    const handleBeforeUnload = () => {
      const user = getCurrentUser();
      if (!user?.id || user.role === "teacher") return;
      const cleanName = (user.fullName || "").toLowerCase().trim();
      const cleanEmail = (user.email || "").toLowerCase().trim();

      if (bc) {
        bc.postMessage({
          type: "offline",
          studentId: user.id,
          cleanName,
          cleanEmail,
          online: false,
          timestamp: Date.now(),
        });
      }

      try {
        const raw = localStorage.getItem("readsmart_online_students") || "{}";
        const map = JSON.parse(raw);
        delete map[user.id];
        if (cleanName) delete map[cleanName];
        if (cleanEmail) delete map[cleanEmail];
        localStorage.setItem("readsmart_online_students", JSON.stringify(map));
      } catch {}

      if (presenceChannel) {
        void presenceChannel.untrack();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
      if (bc) bc.close();
      if (presenceChannel) {
        try {
          import("@/utils/supabase/client").then(({ createClient }) => {
            createClient().removeChannel(presenceChannel);
          });
        } catch {}
      }
    };
  }, []);

  return null;
}
