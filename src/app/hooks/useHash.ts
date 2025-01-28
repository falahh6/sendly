"use client";

import { useEffect, useState } from "react";

export function useHash() {
  const [hash, setHash] = useState<string>("");

  const handleHashChange = (hash: string) => {
    console.log("Hash changed: ", hash);
    setHash(hash);
  };

  useEffect(() => {
    window.addEventListener("hashchange", () =>
      handleHashChange(window.location.hash)
    );
    setHash(window.location.hash);

    return () => {
      window.removeEventListener("hashchange", () =>
        handleHashChange(window.location.hash)
      );
    };
  }, []);

  return hash;
}
