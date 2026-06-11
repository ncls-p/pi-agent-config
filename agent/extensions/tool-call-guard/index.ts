import type {
	AssistantMessage,
	ExtensionAPI,
} from "@earendil-works/pi-coding-agent";

type TextPart = { type: "text"; text: string };

const TOOL_TAG_RE = /<tool_call>[\s\S]*?<\/tool_call>/i;
const FUNCTION_TAG_RE = /<function=([a-zA-Z0-9_-]+)>/g;
const PARAM_TAG_RE =
	/<parameter=([a-zA-Z0-9_-]+)>\s*([\s\S]*?)\s*<\/parameter>/g;
const PATH_RE = /<parameter=path>\s*([\s\S]*?)\s*<\/parameter>/gi;

let enabled = true;
let lastSignature: string | undefined;

function assistantText(message: AssistantMessage): string {
	return message.content
		.filter((part): part is TextPart => part.type === "text")
		.map((part) => part.text)
		.join("\n");
}

function hasRealToolCall(message: AssistantMessage): boolean {
	return message.content.some((part) => part.type === "toolCall");
}

function signature(text: string): string {
	return text.replace(/\s+/g, " ").trim().slice(0, 600);
}

function unique(values: string[]): string[] {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractMalformedSummary(text: string): {
	tools: string[];
	paths: string[];
	params: string[];
} {
	const tools = unique(
		[...text.matchAll(FUNCTION_TAG_RE)].map((match) => match[1] ?? ""),
	);
	const paths = unique(
		[...text.matchAll(PATH_RE)].map((match) => match[1] ?? ""),
	).slice(0, 8);
	const params = unique(
		[...text.matchAll(PARAM_TAG_RE)].map((match) => match[1] ?? ""),
	).slice(0, 12);
	return { tools, paths, params };
}

function looksLikeLiteralToolCall(text: string): boolean {
	return TOOL_TAG_RE.test(text) && /<function=[a-zA-Z0-9_-]+>/i.test(text);
}

function buildRepairPrompt(summary: {
	tools: string[];
	paths: string[];
	params: string[];
}): string {
	const tools = summary.tools.length ? summary.tools.join(", ") : "unknown";
	const params = summary.params.length ? summary.params.join(", ") : "unknown";
	const paths = summary.paths.length
		? `\nTarget paths detected:\n${summary.paths.map((path) => `- ${path}`).join("\n")}`
		: "";

	return [
		"SYSTEM TOOL-CALL REPAIR NOTICE:",
		"Your previous assistant message contained literal `<tool_call>`, `<function=...>` and `<parameter=...>` tags in text.",
		"Those tags are NOT executable in Pi, so no action was performed.",
		"Retry the intended action now using the real function-call/tool interface only.",
		"Do not print XML/HTML-like tool tags. Do not wrap tool calls in Markdown. Do not apologize unless the user asked for explanation.",
		`Detected intended tool(s): ${tools}`,
		`Detected parameter name(s): ${params}`,
		paths,
		"If the intended action is still valid, call the correct tool(s) now with the same arguments. If you need to write or edit files, use the actual write/edit tool call.",
	]
		.filter(Boolean)
		.join("\n");
}

export default function (pi: ExtensionAPI) {
	pi.on("message_end", async (_event, ctx) => {
		if (!enabled) return;
		if (_event.message.role !== "assistant") return;

		const message = _event.message as AssistantMessage;
		if (hasRealToolCall(message)) return;

		const text = assistantText(message);
		if (!looksLikeLiteralToolCall(text)) return;

		const sig = signature(text);
		if (sig === lastSignature) return;
		lastSignature = sig;

		const summary = extractMalformedSummary(text);
		ctx.ui.notify(
			"Literal <tool_call> detected — asking model to retry with real tools",
			"warning",
		);
		pi.sendUserMessage(buildRepairPrompt(summary), { deliverAs: "followUp" });
	});

	pi.registerCommand("tool-call-guard", {
		description: "Toggle malformed literal <tool_call> repair guard [on|off]",
		handler: async (args, ctx) => {
			const value = args.trim().toLowerCase();
			if (value === "on") enabled = true;
			else if (value === "off") enabled = false;
			else if (value) {
				ctx.ui.notify("Usage: /tool-call-guard [on|off]", "error");
				return;
			} else enabled = !enabled;

			ctx.ui.notify(`tool-call-guard: ${enabled ? "on" : "off"}`, "info");
		},
	});
}
