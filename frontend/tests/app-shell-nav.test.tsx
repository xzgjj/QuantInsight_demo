import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShellNav } from "@/components/AppShellNav";

describe("AppShellNav", () => {
  it("renders language toggle and login entry", () => {
    render(<AppShellNav />);

    expect(screen.getByText("投研工作台")).toBeInTheDocument();
    expect(screen.getByText("中文")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("登录")).toBeInTheDocument();
  });
});
