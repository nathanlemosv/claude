import { Loader2 } from "lucide-react";

type StrReplaceArgs = {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path: string;
};

type FileManagerArgs = {
  command: "rename" | "delete";
  path: string;
  new_path?: string;
};

type ToolInvocation = {
  toolName: string;
  state: string;
  result?: unknown;
  args?: Record<string, unknown>;
};

export function getToolLabel(tool: ToolInvocation): string {
  const args = tool.args ?? {};

  if (tool.toolName === "str_replace_editor") {
    const { command, path } = args as StrReplaceArgs;
    const filename = path?.split("/").pop() ?? path;
    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return `Editing ${filename}`;
      case "undo_edit":
        return `Undoing edit to ${filename}`;
      case "view":
        return `Reading ${filename}`;
    }
  }

  if (tool.toolName === "file_manager") {
    const { command, path, new_path } = args as FileManagerArgs;
    const filename = path?.split("/").pop() ?? path;
    if (command === "rename" && new_path) {
      const newFilename = new_path.split("/").pop() ?? new_path;
      return `Renaming ${filename} to ${newFilename}`;
    }
    if (command === "delete") {
      return `Deleting ${filename}`;
    }
  }

  return tool.toolName;
}

interface ToolCallBadgeProps {
  tool: ToolInvocation;
}

export function ToolCallBadge({ tool }: ToolCallBadgeProps) {
  const done = tool.state === "result" && tool.result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{getToolLabel(tool)}</span>
    </div>
  );
}
