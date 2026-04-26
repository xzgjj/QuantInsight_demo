"use client";

import { useEffect, useState } from "react";

type Language = "zh" | "en";

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>("zh");

  useEffect(() => {
    const saved = readSavedLanguage();
    const nextLanguage = saved === "en" ? "en" : "zh";
    setLanguage(nextLanguage);
    document.documentElement.dataset.lang = nextLanguage;
  }, []);

  function updateLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    saveLanguage(nextLanguage);
    document.documentElement.dataset.lang = nextLanguage;
  }

  return (
    <div className="inline-flex h-9 rounded-md border border-line bg-white p-1 text-sm">
      <button
        aria-pressed={language === "zh"}
        className={`rounded px-3 font-medium ${
          language === "zh" ? "bg-ink text-white" : "text-graphite hover:text-ink"
        }`}
        onClick={() => updateLanguage("zh")}
        type="button"
      >
        中文
      </button>
      <button
        aria-pressed={language === "en"}
        className={`rounded px-3 font-medium ${
          language === "en" ? "bg-ink text-white" : "text-graphite hover:text-ink"
        }`}
        onClick={() => updateLanguage("en")}
        type="button"
      >
        EN
      </button>
    </div>
  );
}

function readSavedLanguage(): Language | null {
  try {
    if (typeof window.localStorage.getItem !== "function") {
      return null;
    }
    return window.localStorage.getItem("qi-language") as Language | null;
  } catch {
    return null;
  }
}

function saveLanguage(nextLanguage: Language) {
  try {
    if (typeof window.localStorage.setItem === "function") {
      window.localStorage.setItem("qi-language", nextLanguage);
    }
  } catch {
    // Language can still switch for the current session when storage is unavailable.
  }
}
