"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthCallback() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const returnedState = params.get("state");
    const storedState = sessionStorage.getItem("oauth_state");

    // Verify state to prevent CSRF
    if (!returnedState || returnedState !== storedState) {
      console.error("State mismatch — possible CSRF");
      router.replace("/");
      return;
    }

    // Clean up temporary storage
    sessionStorage.removeItem("pkce_verifier");
    sessionStorage.removeItem("oauth_state");

    // Cookies are already set by the backend — just navigate
    router.replace("/dashboard");
  }, []);

  return <p>Completing sign-in…</p>;
}
