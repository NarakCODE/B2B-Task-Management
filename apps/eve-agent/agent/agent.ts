import { defineAgent } from "eve";
import { MockLanguageModelV4 } from "ai/test";

function getMessageText(message: any): string {
  if (!message) return "";
  if (Array.isArray(message.content)) {
    return message.content.find((c: any) => c.type === "text")?.text || "";
  }
  if (typeof message.content === "string") {
    return message.content;
  }
  return "";
}

const mockModel = new MockLanguageModelV4({
  provider: "mock-provider",
  modelId: "mock-model",
  doGenerate: (async (options) => {
    const lastMessage = options.prompt[options.prompt.length - 1];
    const isToolResult = lastMessage?.role === "tool" || (Array.isArray(lastMessage?.content) && lastMessage.content.some((c) => c.type === "tool-result"));

    if (isToolResult) {
      return {
        text: "Database query executed successfully.",
        finishReason: { unified: "stop", raw: undefined },
        usage: {
          inputTokens: { total: 10, noCache: 10 },
          outputTokens: { total: 20, text: 20 },
        },
        warnings: [],
      };
    } else {
      const text = getMessageText(lastMessage);
      let toolName = "get_workspaces";
      let inputStr = "{}";

      if (text.toLowerCase().includes("project")) {
        toolName = "get_projects";
        inputStr = '{"workspaceId":"6a3008380cb4297b9881e27f"}';
      } else if (text.toLowerCase().includes("task") && (text.toLowerCase().includes("create") || text.toLowerCase().includes("add"))) {
        toolName = "create_task";
        inputStr = '{"workspaceId":"6a3008380cb4297b9881e27f","projectId":"6a3012dc998afc393f091afc","title":"AI-Generated Task"}';
      } else if (text.toLowerCase().includes("task") && (text.toLowerCase().includes("update") || text.toLowerCase().includes("change"))) {
        toolName = "update_task";
        inputStr = '{"taskId":"6a314484a2d503ac4f86ba76","status":"IN_PROGRESS"}';
      } else if (text.toLowerCase().includes("task")) {
        toolName = "get_tasks";
        inputStr = '{"workspaceId":"6a3008380cb4297b9881e27f"}';
      }

      return {
        text: "",
        toolCalls: [
          {
            toolCallId: "call-1",
            toolName,
            args: inputStr,
          },
        ],
        finishReason: { unified: "tool-calls", raw: undefined },
        usage: {
          inputTokens: { total: 5, noCache: 5 },
          outputTokens: { total: 15, text: 15 },
        },
        warnings: [],
      };
    }
  }) as any,
  doStream: (async (options) => {
    let chunks: any[] = [];
    if (isToolResult) {
      let toolName = "";
      let resultData: any = {};
      
      for (let i = options.prompt.length - 1; i >= 0; i--) {
        const msg = options.prompt[i];
        const contents = Array.isArray(msg.content) ? msg.content : [];
        const resultPart = contents.find(c => c.type === "tool-result");
        if (resultPart) {
          const rp = resultPart as { toolName: string; result: unknown };
          toolName = rp.toolName;
          try {
            resultData = typeof rp.result === "string" ? JSON.parse(rp.result) : rp.result;
          } catch {
            resultData = rp.result;
          }
          break;
        }
      }

      let textOutput = "Here is the data from the database.";
      if (toolName === "get_workspaces") {
        const list = resultData?.workspaces || [];
        textOutput = `I found the following workspaces in the system:\n\n` + 
          list.map((w: any) => `* **${w.name}** (ID: \`${w.id}\`, Invite: \`${w.inviteCode}\`)`).join("\n");
      } else if (toolName === "get_projects") {
        const list = resultData?.projects || [];
        textOutput = `I found the following projects in the workspace:\n\n` + 
          list.map((p: any) => `* ${p.emoji} **${p.name}** (ID: \`${p.id}\`)`).join("\n");
      } else if (toolName === "get_tasks") {
        const list = resultData?.tasks || [];
        textOutput = `Here are the tasks in the workspace:\n\n` + 
          list.map((t: any) => `* \`[${t.status}]\` **${t.title}** (Code: \`${t.taskCode}\`, Priority: \`${t.priority}\`)`).join("\n");
      } else if (toolName === "create_task") {
        const task = resultData?.task || {};
        textOutput = `Successfully created task **${task.title}** (Code: \`${task.taskCode}\`) with status \`${task.status}\` in the database!`;
      } else if (toolName === "update_task") {
        const task = resultData?.task || {};
        textOutput = `Successfully updated task **${task.title}** (Code: \`${task.taskCode}\`) status to \`${task.status}\`!`;
      }

      chunks = [
        { type: "text-start", id: "text-1" },
        { type: "text-delta", id: "text-1", delta: textOutput },
        { type: "text-end", id: "text-1" },
        {
          type: "finish",
          finishReason: { unified: "stop", raw: undefined },
          usage: {
            inputTokens: { total: 10, noCache: 10 },
            outputTokens: { total: 20, text: 20 },
          },
        },
      ];
    } else {
      const text = getMessageText(lastMessage);
      let toolName = "get_workspaces";
      let inputStr = "{}";

      if (text.toLowerCase().includes("project")) {
        toolName = "get_projects";
        inputStr = '{"workspaceId":"6a3008380cb4297b9881e27f"}';
      } else if (text.toLowerCase().includes("task") && (text.toLowerCase().includes("create") || text.toLowerCase().includes("add"))) {
        toolName = "create_task";
        inputStr = '{"workspaceId":"6a3008380cb4297b9881e27f","projectId":"6a3012dc998afc393f091afc","title":"AI-Generated Task"}';
      } else if (text.toLowerCase().includes("task") && (text.toLowerCase().includes("update") || text.toLowerCase().includes("change"))) {
        toolName = "update_task";
        inputStr = '{"taskId":"6a314484a2d503ac4f86ba76","status":"IN_PROGRESS"}';
      } else if (text.toLowerCase().includes("task")) {
        toolName = "get_tasks";
        inputStr = '{"workspaceId":"6a3008380cb4297b9881e27f"}';
      }

      chunks = [
        { type: "tool-input-start", id: "call-1", toolName },
        { type: "tool-input-delta", id: "call-1", delta: inputStr },
        { type: "tool-input-end", id: "call-1" },
        {
          type: "tool-call",
          toolCallId: "call-1",
          toolName,
          input: inputStr,
        },
        {
          type: "finish",
          finishReason: { unified: "tool-calls", raw: undefined },
          usage: {
            inputTokens: { total: 5, noCache: 5 },
            outputTokens: { total: 15, text: 15 },
          },
        },
      ];
    }

    return {
      stream: new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      }),
    };
  }) as any,
});

export default defineAgent({
  model: mockModel,
  modelContextWindowTokens: 200000,
});
