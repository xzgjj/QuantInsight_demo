"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

import { LanguageToggle } from "@/components/LanguageToggle";

export function AppShellNav() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link className="min-w-0" href="/">
          <div className="text-sm font-semibold text-graphite">QuantInsight</div>
          <div className="text-xl font-semibold text-ink">
            <span className="lang-zh">投研工作台</span>
            <span className="lang-en">Research Workbench</span>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          <LanguageToggle />
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:border-ink">
            <LogIn aria-hidden="true" className="h-4 w-4" />
            <span className="lang-zh">登录</span>
            <span className="lang-en">Sign in</span>
          </button>
        </div>
      </div>
    </header>
  );
}
