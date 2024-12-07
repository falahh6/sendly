"use client";

import { Button } from "../ui/button";

export default function Integrations() {
  const handleGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  const handleOutlookAuth = () => {
    window.location.href = "/api/auth/outlook";
  };

  return (
    <div className="space-x-2 py-6">
      <Button onClick={handleGoogleAuth}>Authenticate with Google</Button>
      <Button onClick={handleOutlookAuth}>Authenticate with Outlook</Button>
    </div>
  );
}
