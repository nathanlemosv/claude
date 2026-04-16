import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";

describe("getToolLabel", () => {
  describe("str_replace_editor", () => {
    test("create command", () => {
      expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "create", path: "/src/App.tsx" } }))
        .toBe("Creating App.tsx");
    });

    test("str_replace command", () => {
      expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "str_replace", path: "/src/components/Button.tsx" } }))
        .toBe("Editing Button.tsx");
    });

    test("insert command", () => {
      expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "insert", path: "/src/index.ts" } }))
        .toBe("Editing index.ts");
    });

    test("view command", () => {
      expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "view", path: "/src/App.tsx" } }))
        .toBe("Reading App.tsx");
    });

    test("undo_edit command", () => {
      expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "undo_edit", path: "/src/App.tsx" } }))
        .toBe("Undoing edit to App.tsx");
    });
  });

  describe("file_manager", () => {
    test("rename command", () => {
      expect(getToolLabel({ toolName: "file_manager", state: "call", args: { command: "rename", path: "/src/Old.tsx", new_path: "/src/New.tsx" } }))
        .toBe("Renaming Old.tsx to New.tsx");
    });

    test("delete command", () => {
      expect(getToolLabel({ toolName: "file_manager", state: "call", args: { command: "delete", path: "/src/App.tsx" } }))
        .toBe("Deleting App.tsx");
    });
  });

  test("falls back to toolName for unknown tools", () => {
    expect(getToolLabel({ toolName: "some_unknown_tool", state: "call", args: {} }))
      .toBe("some_unknown_tool");
  });
});

describe("ToolCallBadge", () => {
  test("shows spinner when in progress", () => {
    const { container } = render(
      <ToolCallBadge
        tool={{ toolName: "str_replace_editor", state: "call", args: { command: "create", path: "/App.tsx" } }}
      />
    );
    expect(screen.getByText("Creating App.tsx")).toBeDefined();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("shows green dot when done", () => {
    const { container } = render(
      <ToolCallBadge
        tool={{ toolName: "str_replace_editor", state: "result", result: "ok", args: { command: "str_replace", path: "/src/Button.tsx" } }}
      />
    );
    expect(screen.getByText("Editing Button.tsx")).toBeDefined();
    expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
