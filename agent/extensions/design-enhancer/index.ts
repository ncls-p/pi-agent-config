/**
 * Design Enhancer - modern, minimal PI TUI polish.
 *
 * Design goals:
 * - one place for each info type (no repeated model/cwd/context blocks)
 * - compact header, premium editor chrome, tiny telemetry footer
 * - refined dark theme with soft neon accents
 *
 * Commands:
 *   /design-status          Show what's enabled
 *   /design-header [on|off] Toggle custom header
 *   /design-footer [on|off] Toggle custom footer
 *   /design-editor [on|off] Toggle enhanced editor borders
 *   /design-spinner [on|off] Toggle working indicator
 *   /design-titlebar [on|off] Toggle titlebar spinner
 *   /design-theme           Switch to refined-dark theme
 *   /design-reset           Reset all to defaults
 */

import path from "node:path";
import {
	CustomEditor,
	VERSION,
	createBashTool,
	createEditTool,
	createReadTool,
	createWriteTool,
	type AssistantMessage,
	type BashToolDetails,
	type EditToolDetails,
	type ExtensionAPI,
	type ExtensionContext,
	type KeybindingsManager,
	type ReadToolDetails,
} from "@earendil-works/pi-coding-agent";
import type { EditorTheme, TUI, Theme } from "@earendil-works/pi-tui";
import {
	Spacer,
	Text,
	truncateToWidth,
	visibleWidth,
} from "@earendil-works/pi-tui";

// --- Config ---
const THEME_DIR = "/home/ncls/.pi/agent/extensions/design-enhancer";
const PI_INTERACTIVE_MODE_PATH =
	"/home/ncls/.nvm/versions/node/v24.16.0/lib/node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/interactive-mode.js";
const SPINNER_FRAMES = ["◐", "◓", "◑", "◒"];
const PULSE_FRAMES = ["·", "•", "●", "•"];
const ANSI_PATTERN = /\x1b\[[0-?]*[ -/]*[@-~]/g;

type FeatureKey = keyof typeof features;

// --- Mutable State ---
let features = {
	header: true,
	footer: true,
	editor: true,
	spinner: true,
	titlebar: true,
};

let isWorking = false;
let spinnerIndex = 0;
let spinnerTimer: ReturnType<typeof setInterval> | undefined;
let titlebarTimer: ReturnType<typeof setInterval> | undefined;
let activeTui: TUI | undefined;
let gitBranch: string | undefined;
let ctxRef: ExtensionContext | undefined;
let piRef: ExtensionAPI | undefined;

// --- Helpers ---
function softPill(theme: Theme, text: string): string {
	return theme.fg("muted", ` ${text} `);
}

function compactModel(ctx: ExtensionContext): string {
	if (!ctx.model) return "no model";
	const id = ctx.model.id.replace(/^models\//, "");
	return `${ctx.model.provider}/${id}`;
}

function compactThinking(): string {
	const thinking = piRef?.getThinkingLevel() ?? "off";
	return thinking === "off" ? "think off" : `think ${thinking}`;
}

function formatCwd(cwd: string): string {
	return cwd;
}

function formatContext(ctx: ExtensionContext): string {
	const usage = ctx.getContextUsage();
	const contextWindow = usage?.contextWindow ?? ctx.model?.contextWindow;
	if (!contextWindow || !usage || usage.percent === null) return "ctx —";
	return `ctx ${Math.round(usage.percent)}%`;
}

function formatTokens(ctx: ExtensionContext): {
	input: string;
	output: string;
	cost: string;
} {
	let input = 0;
	let output = 0;
	let cost = 0;
	for (const e of ctx.sessionManager.getBranch()) {
		if (e.type === "message" && e.message.role === "assistant") {
			const m = e.message as Partial<AssistantMessage>;
			input += typeof m.usage?.input === "number" ? m.usage.input : 0;
			output += typeof m.usage?.output === "number" ? m.usage.output : 0;
			cost += typeof m.usage?.cost?.total === "number" ? m.usage.cost.total : 0;
		}
	}
	const fmt = (n: number) => (n < 1000 ? `${n}` : `${(n / 1000).toFixed(1)}k`);
	return { input: fmt(input), output: fmt(output), cost: cost.toFixed(3) };
}

function getBaseTitle(): string {
	const cwd = path.basename(ctxRef?.cwd ?? process.cwd());
	const session = piRef?.getSessionName();
	return session ? `π ${session} · ${cwd}` : `π ${cwd}`;
}

function centerLine(line: string, width: number): string {
	if (width <= visibleWidth(line)) return truncateToWidth(line, width);
	const left = Math.floor((width - visibleWidth(line)) / 2);
	return `${" ".repeat(left)}${line}`;
}

function fitBorder(
	left: string,
	right: string,
	width: number,
	border: (text: string) => string,
	fill: (text: string) => string = border,
	corners: readonly [string, string] = ["╭", "╮"],
): string {
	if (width <= 0) return "";
	if (width === 1) return border("─");

	let leftText = left;
	let rightText = right;
	const fixedWidth = 2;
	const minimumGap = 2;

	while (
		fixedWidth + visibleWidth(leftText) + visibleWidth(rightText) + minimumGap >
			width &&
		visibleWidth(rightText) > 0
	) {
		rightText = truncateToWidth(
			rightText,
			Math.max(0, visibleWidth(rightText) - 1),
			"",
		);
	}
	while (
		fixedWidth + visibleWidth(leftText) + visibleWidth(rightText) + minimumGap >
			width &&
		visibleWidth(leftText) > 0
	) {
		leftText = truncateToWidth(
			leftText,
			Math.max(0, visibleWidth(leftText) - 1),
			"",
		);
	}

	const gapWidth = Math.max(
		0,
		width - fixedWidth - visibleWidth(leftText) - visibleWidth(rightText),
	);
	return `${border(corners[0])}${leftText}${fill("─".repeat(gapWidth))}${rightText}${border(corners[1])}`;
}

// --- Spinner management ---
function stopSpinner() {
	if (spinnerTimer) {
		clearInterval(spinnerTimer);
		spinnerTimer = undefined;
	}
}

function startSpinner() {
	stopSpinner();
	spinnerTimer = setInterval(() => {
		spinnerIndex = (spinnerIndex + 1) % SPINNER_FRAMES.length;
		activeTui?.requestRender();
	}, 90);
	activeTui?.requestRender();
}

function stopTitlebar() {
	if (titlebarTimer) {
		clearInterval(titlebarTimer);
		titlebarTimer = undefined;
	}
	try {
		ctxRef?.ui.setTitle(getBaseTitle());
	} catch {
		// Session replacement tears down the old TUI context before the new
		// extension instance is fully bound. Title reset is cosmetic; never let it
		// crash /new or /resume.
	}
}

function startTitlebar() {
	stopTitlebar();
	if (!ctxRef) return;
	titlebarTimer = setInterval(() => {
		ctxRef?.ui.setTitle(
			`${SPINNER_FRAMES[spinnerIndex % SPINNER_FRAMES.length]} ${getBaseTitle()}`,
		);
	}, 90);
}

// --- Custom Header ---
function setCustomHeader() {
	if (!ctxRef) return;
	ctxRef.ui.setHeader((_tui, theme) => ({
		render(width: number): string[] {
			const session = piRef?.getSessionName() || "pi";
			const title = `${theme.fg("accent", "π")} ${theme.fg("text", theme.bold(session))}`;
			const subtitle = `${theme.fg("muted", "coding agent")} ${theme.fg("dim", "·")} ${theme.fg("muted", `v${VERSION}`)}`;
			const ruleWidth = Math.max(12, Math.min(width - 8, 42));
			const rule = `${theme.fg("accent", "━━━")}${theme.fg("borderMuted", "─".repeat(Math.max(0, ruleWidth - 3)))}`;

			return [
				"",
				centerLine(title, width),
				centerLine(subtitle, width),
				centerLine(rule, width),
			];
		},
		invalidate() {},
	}));
}

// --- Custom Footer ---
function setCustomFooter() {
	if (!ctxRef) return;
	ctxRef.ui.setFooter((_tui, theme, _footerData) => {
		return {
			invalidate() {},
			render(width: number): string[] {
				if (!ctxRef) return [];
				const tokens = formatTokens(ctxRef);
				const left = theme.fg(
					"dim",
					`in ${tokens.input} · out ${tokens.output} · $${tokens.cost}`,
				);
				const right = theme.fg("dim", formatCwd(ctxRef.cwd));
				const gap = " ".repeat(
					Math.max(1, width - visibleWidth(left) - visibleWidth(right)),
				);
				return [truncateToWidth(left + gap + right, width)];
			},
		};
	});
}

// --- Enhanced Editor ---
class DesignEditor extends CustomEditor {
	constructor(tui: TUI, theme: EditorTheme, keybindings: KeybindingsManager) {
		super(tui, theme, keybindings, { paddingX: 0 });
		activeTui = tui;
	}

	render(width: number): string[] {
		const lines = super.render(width);
		if (lines.length < 2) return lines;

		const theme = ctxRef?.ui.theme;
		if (!theme || !ctxRef) return lines;

		const status = isWorking
			? `${PULSE_FRAMES[spinnerIndex % PULSE_FRAMES.length]!} ${theme.fg("muted", "working")}`
			: `${theme.fg("success", "●")} ready`;
		const topLeft = softPill(theme, status);
		const topRight = softPill(
			theme,
			`${compactModel(ctxRef)} · ${compactThinking()}`,
		);

		const bottomLeft = softPill(theme, formatContext(ctxRef));
		const bottomRight = softPill(
			theme,
			gitBranch ? `git:${gitBranch}` : "no git",
		);

		const editor = this as CustomEditor & {
			borderColor?: (text: string) => string;
		};
		const borderColor = (text: string) =>
			editor.borderColor?.(text) ?? theme.fg("borderAccent", text);
		const fillColor = (text: string) => theme.fg("borderMuted", text);
		lines[0] = fitBorder(topLeft, topRight, width, borderColor, fillColor, [
			"╭",
			"╮",
		]);
		lines[lines.length - 1] = fitBorder(
			bottomLeft,
			bottomRight,
			width,
			borderColor,
			fillColor,
			["╰", "╯"],
		);
		return lines;
	}
}

// --- Working Indicator ---
function setWorkingIndicator() {
	if (!ctxRef) return;
	// Hide Pi's inline indicator: the editor border already shows
	// "working" and turns into "ready", so we avoid duplicate status text.
	ctxRef.ui.setWorkingIndicator({ frames: [] });
}

// --- Apply all ---
function refreshGitBranch() {
	if (!ctxRef) return;
	piRef
		?.exec("git", ["branch", "--show-current"], { cwd: ctxRef.cwd })
		.then((result) => {
			const stdout = result?.stdout.trim();
			gitBranch = stdout && stdout.length > 0 ? stdout : undefined;
			activeTui?.requestRender();
		})
		.catch(() => {
			gitBranch = undefined;
		});
}

function applyAll() {
	if (!ctxRef) return;

	refreshGitBranch();
	ctxRef.ui.setHeader(undefined);
	if (features.header) setCustomHeader();

	ctxRef.ui.setFooter(undefined);
	if (features.footer) setCustomFooter();

	ctxRef.ui.setEditorComponent(
		features.editor
			? (tui, theme, kb) => new DesignEditor(tui, theme, kb)
			: undefined,
	);
	ctxRef.ui.setWorkingIndicator(undefined);
	if (features.spinner) setWorkingIndicator();

	ctxRef.ui.setStatus("design", ctxRef.ui.theme.fg("dim", "✦ refined"));
}

// --- Tool chrome ---
function displayPath(filePath: string): string {
	return filePath;
}

type ToolTone = "quiet" | "accent" | "success" | "warning" | "error";

function tone(theme: Theme, value: ToolTone, text: string): string {
	const token =
		value === "quiet" ? "dim" : value === "accent" ? "accent" : value;
	return theme.fg(token, text);
}

function toolLine(
	theme: Theme,
	icon: string,
	title: string,
	target?: string,
	meta?: string,
	toneName: ToolTone = "accent",
): Text {
	const titleText = toneName === "quiet" ? title : theme.bold(title);
	let text = `${tone(theme, toneName, icon)} ${theme.fg(toneName === "quiet" ? "muted" : "toolTitle", titleText)}`;
	if (target)
		text += ` ${theme.fg(toneName === "quiet" ? "muted" : "text", displayPath(target))}`;
	if (meta) text += theme.fg("dim", `  ${meta}`);
	return new Text(text, 0, 0);
}

function stripAnsi(text: string): string {
	return text.replace(ANSI_PATTERN, "");
}

function previewLines(text: string, maxLines: number): string[] {
	const lines = stripAnsi(text).split("\n");
	return lines
		.slice(0, maxLines)
		.concat(
			Number.isFinite(maxLines) && lines.length > maxLines
				? [`… ${lines.length - maxLines} more lines`]
				: [],
		);
}

function previewLine(
	theme: Theme,
	line: string,
	color: "dim" | "muted" | "success" | "error" | "accent" | "warning" = "dim",
): string {
	return theme.fg(color, `│ ${line}`);
}

function fileBlock(theme: Theme, content: string, maxLines: number): string {
	return previewLines(content, maxLines)
		.map((line) =>
			previewLine(theme, line, line.startsWith("…") ? "warning" : "dim"),
		)
		.join("\n");
}

function diffBlock(theme: Theme, diff: string, maxLines: number): string {
	const important = stripAnsi(diff)
		.split("\n")
		.filter(
			(line) =>
				line.startsWith("@@") ||
				(line.startsWith("+") && !line.startsWith("+++")) ||
				(line.startsWith("-") && !line.startsWith("---")),
		);
	return previewLines(important.join("\n"), maxLines)
		.map((line) => {
			if (line.startsWith("+")) return previewLine(theme, line, "success");
			if (line.startsWith("-")) return previewLine(theme, line, "error");
			if (line.startsWith("@@")) return previewLine(theme, line, "accent");
			if (line.startsWith("…")) return previewLine(theme, line, "warning");
			return previewLine(theme, line, "dim");
		})
		.join("\n");
}

function summarizeArgs(args: Record<string, unknown> | undefined): {
	target?: string;
	meta?: string;
} {
	if (!args || typeof args !== "object") return {};
	const targetKeys = [
		"path",
		"file",
		"url",
		"query",
		"command",
		"name",
		"action",
	];
	const targetKey = targetKeys.find(
		(key) => typeof args[key] === "string" && String(args[key]).trim(),
	);
	const target = targetKey ? String(args[targetKey]) : undefined;
	const keys = Object.keys(args).filter((key) => args[key] !== undefined);
	const meta = keys.length ? keys.slice(0, 4).join(" · ") : undefined;
	return { target, meta };
}

function resultText(result: {
	content?: Array<{ type: string; text?: string }>;
}): string {
	return (
		result.content
			?.filter((part) => part.type === "text" && typeof part.text === "string")
			.map((part) => part.text)
			.join("\n") ?? ""
	);
}

function genericResultMeta(output: string): string {
	const clean = stripAnsi(output);
	if (!clean.trim()) return "done";
	const lines = clean.split("\n").filter((line) => line.trim()).length;
	return `${lines} lines`;
}

function isContextModeTool(name: string | undefined): boolean {
	return Boolean(
		name &&
			(name.startsWith("ctx_") ||
				name === "context-mode" ||
				name.includes("context-mode")),
	);
}

function contextToolLabel(name: string): string {
	return name
		.replace(/^ctx_/, "")
		.replace(/_/g, " ")
		.replace(/^execute file$/, "file analysis")
		.replace(/^fetch and index$/, "fetch+index");
}

function contextToolTarget(args: Record<string, unknown>): string | undefined {
	if (typeof args.path === "string") return args.path;
	if (typeof args.filePath === "string") return args.filePath;
	if (typeof args.source === "string") return args.source;
	if (typeof args.url === "string") return args.url;
	if (typeof args.command === "string")
		return truncateToWidth(args.command.replace(/\s+/g, " "), 74);
	if (Array.isArray(args.queries)) return `${args.queries.length} queries`;
	if (Array.isArray(args.commands)) return `${args.commands.length} commands`;
	if (Array.isArray(args.requests)) return `${args.requests.length} urls`;
	return undefined;
}

function contextResultMeta(output: string): string {
	const clean = stripAnsi(output);
	if (!clean.trim()) return "no visible output";
	const indexed = clean.match(/Indexed\s+(\d+)\s+sections/i)?.[1];
	const matched = clean.match(/(\d+)\s+sections\s+matched/i)?.[1];
	const saved = clean.match(/saved\s+to\s+([^\n]+)/i)?.[1];
	const lines = clean.split("\n").filter((line) => line.trim()).length;
	return [
		indexed ? `${indexed} indexed` : undefined,
		matched ? `${matched} matches` : undefined,
		saved ? "artifact saved" : undefined,
		`${lines} lines`,
	]
		.filter(Boolean)
		.join(" · ");
}

function contextBlock(theme: Theme, output: string, maxLines: number): string {
	return previewLines(output, maxLines)
		.map((line) => {
			const trimmed = line.trim();
			if (trimmed.startsWith("…")) return previewLine(theme, line, "warning");
			if (/^(error|failed|×)/i.test(trimmed))
				return previewLine(theme, line, "error");
			if (/^(Indexed|Stored|Saved|\[OK\]|✓)/i.test(trimmed))
				return previewLine(theme, line, "success");
			if (/sections matched|Searchable terms|Use ctx_search/i.test(trimmed))
				return previewLine(theme, line, "accent");
			if (/^(```|path=|source=)/i.test(trimmed))
				return previewLine(theme, line, "muted");
			return previewLine(theme, line, "dim");
		})
		.join("\n");
}

function modernizeExtensionTool(definition: any): any {
	const coreTools = new Set(["read", "edit", "write", "bash"]);
	if (coreTools.has(definition?.name)) return definition;

	const contextMode = isContextModeTool(definition?.name);

	return {
		...definition,
		renderShell: "self",
		renderCall(args: Record<string, unknown>, theme: Theme) {
			if (contextMode) {
				return toolLine(
					theme,
					"◇",
					`context · ${contextToolLabel(definition.name)}`,
					contextToolTarget(args),
					"summarize, don’t flood",
					"accent",
				);
			}
			const summary = summarizeArgs(args);
			return toolLine(
				theme,
				"✧",
				definition.label ?? definition.name,
				summary.target,
				summary.meta,
				"accent",
			);
		},
		renderResult(
			result: { content?: Array<{ type: string; text?: string }> },
			{ expanded, isPartial }: { expanded: boolean; isPartial: boolean },
			theme: Theme,
		) {
			if (isPartial)
				return toolLine(
					theme,
					contextMode ? "◇" : "✧",
					contextMode ? "context running" : "running",
					undefined,
					definition.name,
					contextMode ? "accent" : "quiet",
				);
			const output = resultText(result);
			const failed = /^error\b|\bfailed\b/i.test(stripAnsi(output));
			if (contextMode) {
				let text = `${theme.fg(failed ? "error" : "success", failed ? "×" : "✓")} ${theme.fg("toolTitle", theme.bold(`context · ${contextToolLabel(definition.name)}`))} ${theme.fg(failed ? "error" : "text", contextResultMeta(output))}`;
				if (expanded && output) text += `\n${contextBlock(theme, output, 24)}`;
				return new Text(text, 0, 0);
			}
			let text = `${theme.fg(failed ? "error" : "success", failed ? "×" : "✓")} ${theme.fg("toolTitle", theme.bold(definition.label ?? definition.name))} ${theme.fg("dim", genericResultMeta(output))}`;
			if (expanded && output) text += `\n${fileBlock(theme, output, 80)}`;
			return new Text(text, 0, 0);
		},
	};
}

function installModernToolDefaults(pi: ExtensionAPI) {
	const runtime = pi as ExtensionAPI & {
		__designToolDefaults?: boolean;
		registerTool: (definition: any) => unknown;
	};
	if (runtime.__designToolDefaults) return;
	runtime.__designToolDefaults = true;
	const registerTool = runtime.registerTool.bind(pi);
	runtime.registerTool = (definition: any) =>
		registerTool(modernizeExtensionTool(definition));
}

function registerToolChrome(pi: ExtensionAPI) {
	const cwd = process.cwd();

	const read = createReadTool(cwd);
	pi.registerTool({
		...read,
		name: "read",
		label: "read",
		description: read.description,
		renderShell: "self",
		parameters: read.parameters,
		execute: (...args) => read.execute(...args),
		renderCall(args, theme) {
			const range = [
				args.offset ? `@${args.offset}` : "",
				args.limit ? `+${args.limit}` : "",
			]
				.filter(Boolean)
				.join(" ");
			return toolLine(
				theme,
				"○",
				"read",
				args.path,
				range || undefined,
				"quiet",
			);
		},
		renderResult(result, { expanded, isPartial }, theme) {
			if (isPartial)
				return toolLine(theme, "○", "reading", undefined, undefined, "quiet");
			const details = result.details as ReadToolDetails | undefined;
			const content = result.content?.[0];
			if (content?.type === "image")
				return toolLine(
					theme,
					"✓",
					"image loaded",
					undefined,
					undefined,
					"quiet",
				);
			if (content?.type !== "text")
				return toolLine(
					theme,
					"×",
					"empty",
					undefined,
					"no readable content",
					"warning",
				);
			const lines = content.text.split("\n");
			let text = `${theme.fg("success", "✓")} ${theme.fg("toolTitle", theme.bold("read"))} ${theme.fg("text", `${lines.length} lines`)}`;
			if (details?.truncation?.truncated)
				text += theme.fg(
					"warning",
					`  truncated/${details.truncation.totalLines}`,
				);
			if (expanded) text += `\n${fileBlock(theme, content.text, 14)}`;
			return new Text(text, 0, 0);
		},
	});

	const edit = createEditTool(cwd);
	pi.registerTool({
		...edit,
		name: "edit",
		label: "edit",
		description: edit.description,
		renderShell: "self",
		parameters: edit.parameters,
		execute: (...args) => edit.execute(...args),
		renderCall(args, theme) {
			return toolLine(theme, "✦", "edit", args.path, "will patch", "accent");
		},
		renderResult(result, { expanded, isPartial }, theme) {
			if (isPartial)
				return toolLine(theme, "✦", "editing", undefined, undefined, "accent");
			const content = result.content?.[0];
			if (content?.type === "text" && /^error/i.test(content.text))
				return toolLine(
					theme,
					"×",
					"edit failed",
					undefined,
					content.text.split("\n")[0],
					"error",
				);
			const details = result.details as EditToolDetails | undefined;
			const diff = details?.diff || "";
			let additions = 0;
			let removals = 0;
			for (const line of diff.split("\n")) {
				if (line.startsWith("+") && !line.startsWith("+++")) additions++;
				if (line.startsWith("-") && !line.startsWith("---")) removals++;
			}
			let text = `${theme.fg("success", "✓")} ${theme.fg("toolTitle", theme.bold("edited"))} ${theme.fg("success", `+${additions}`)} ${theme.fg("error", `-${removals}`)}`;
			if (expanded && diff) text += `\n${diffBlock(theme, diff, 28)}`;
			return new Text(text, 0, 0);
		},
	});

	const write = createWriteTool(cwd);
	pi.registerTool({
		...write,
		name: "write",
		label: "write",
		description: write.description,
		renderShell: "self",
		parameters: write.parameters,
		execute: (...args) => write.execute(...args),
		renderCall(args, theme, context) {
			const fileContent = typeof args.content === "string" ? args.content : "";
			const lineCount = fileContent ? fileContent.split("\n").length : 0;
			const meta = fileContent
				? `${lineCount} lines · ${context.expanded ? "live preview" : "collapsed"}`
				: "receiving content…";
			let text = `${theme.fg("accent", "◆")} ${theme.fg("toolTitle", theme.bold("write"))}`;
			if (args.path) text += ` ${theme.fg("text", displayPath(args.path))}`;
			text += theme.fg("dim", `  ${meta}`);
			if (context.expanded && fileContent)
				text += `\n${fileBlock(theme, fileContent, Number.POSITIVE_INFINITY)}`;
			return new Text(text, 0, 0);
		},
		renderResult(result, { expanded, isPartial }, theme, context) {
			const fileContent =
				typeof context.args?.content === "string" ? context.args.content : "";
			const lineCount = fileContent.split("\n").length;
			if (isPartial) {
				let text = `${theme.fg("accent", "◆")} ${theme.fg("toolTitle", theme.bold("writing"))} ${theme.fg("text", `${lineCount} lines`)} ${theme.fg("dim", expanded ? "live preview" : "collapsed")}`;
				if (expanded && fileContent)
					text += `\n${fileBlock(theme, fileContent, Number.POSITIVE_INFINITY)}`;
				return new Text(text, 0, 0);
			}
			const content = result.content?.[0];
			if (content?.type === "text" && /^error/i.test(content.text))
				return toolLine(
					theme,
					"×",
					"write failed",
					undefined,
					content.text.split("\n")[0],
					"error",
				);
			let text = `${theme.fg("success", "✓")} ${theme.fg("toolTitle", theme.bold("written"))} ${theme.fg("text", `${lineCount} lines`)}`;
			if (expanded && fileContent)
				text += `\n${fileBlock(theme, fileContent, Number.POSITIVE_INFINITY)}`;
			return new Text(text, 0, 0);
		},
	});

	const bash = createBashTool(cwd);
	pi.registerTool({
		...bash,
		name: "bash",
		label: "bash",
		description: bash.description,
		renderShell: "self",
		parameters: bash.parameters,
		execute: (...args) => bash.execute(...args),
		renderCall(args, theme) {
			return toolLine(
				theme,
				"⌁",
				"bash",
				undefined,
				truncateToWidth(args.command.replace(/\s+/g, " "), 74),
				"quiet",
			);
		},
		renderResult(result, { expanded, isPartial }, theme) {
			if (isPartial)
				return toolLine(theme, "⌁", "running", undefined, undefined, "quiet");
			const details = result.details as BashToolDetails | undefined;
			const content = result.content?.[0];
			const output = content?.type === "text" ? content.text : "";
			const exit = output.match(/exit code: (\d+)/)?.[1];
			const ok = !exit || exit === "0";
			const lineCount = output.split("\n").filter((line) => line.trim()).length;
			let text = `${theme.fg(ok ? "success" : "error", ok ? "✓" : "×")} ${theme.fg("toolTitle", theme.bold(ok ? "done" : `exit ${exit}`))} ${theme.fg("dim", `${lineCount} lines`)}`;
			if (details?.truncation?.truncated)
				text += theme.fg("warning", "  truncated");
			if (expanded && output)
				text += `\n${previewLines(output, 18)
					.map((line) =>
						previewLine(theme, line, line.startsWith("…") ? "warning" : "dim"),
					)
					.join("\n")}`;
			return new Text(text, 0, 0);
		},
	});
}

// --- Startup resources menu (runtime patch, no Pi core files modified) ---
type StartupItem = { path: string; sourceInfo?: unknown };

type StartupSection = {
	name: string;
	icon: string;
	labels: string[];
	details?: string[];
};

function visualList(theme: Theme, labels: string[], maxWidth = 118): string[] {
	const items = labels.filter(Boolean);
	if (items.length === 0) return [theme.fg("dim", "│  none")];
	const lines: string[] = [];
	let line = theme.fg("borderMuted", "│  ");
	for (const item of items) {
		const part = `${theme.fg("accent", "•")} ${theme.fg("text", item)}`;
		const sep = line.endsWith("  ") ? "" : theme.fg("dim", "  ·  ");
		if (visibleWidth(`${stripAnsi(line)}  ·  ${item}`) > maxWidth) {
			lines.push(line);
			line = `${theme.fg("borderMuted", "│  ")}${part}`;
		} else {
			line += `${sep}${part}`;
		}
	}
	lines.push(line);
	return lines;
}

function renderStartupSection(theme: Theme, section: StartupSection): string {
	const count = `${section.labels.length} ${section.labels.length === 1 ? "item" : "items"}`;
	const lines = [
		`${theme.fg("borderMuted", "╭─")} ${theme.fg("accent", section.icon)} ${theme.fg("toolTitle", theme.bold(section.name))} ${theme.fg("muted", count)}`,
		...visualList(theme, section.labels),
	];
	if (section.details?.length) {
		lines.push(
			...section.details.map(
				(detail) =>
					`${theme.fg("borderMuted", "│  ")}${theme.fg("dim", detail)}`,
			),
		);
	}
	lines.push(theme.fg("borderMuted", "╰"));
	return lines.join("\n");
}

function addStartupSection(
	chatContainer: any,
	theme: Theme,
	section: StartupSection,
) {
	chatContainer.addChild(new Text(renderStartupSection(theme, section), 0, 0));
	chatContainer.addChild(new Spacer(1));
}

async function installStartupMenuPatch() {
	const mod = await import(PI_INTERACTIVE_MODE_PATH);
	const proto = mod.InteractiveMode?.prototype as
		| { __designStartupMenuPatched?: boolean; showLoadedResources?: any }
		| undefined;
	if (!proto) return;
	proto.__designStartupMenuPatched = true;

	// Session replacement (/new, /resume, /fork) creates a fresh extension
	// runtime in the same Node process. Reinstall the monkey patch every time so
	// the method closes over the current runtime state instead of stale ctxRef/ui
	// objects from the previous session.
	proto.showLoadedResources = function showDesignLoadedResources(
		this: any,
		options: { force?: boolean; showDiagnosticsWhenQuiet?: boolean } = {},
	) {
		const showListing =
			options?.force ||
			this.options.verbose ||
			!this.settingsManager.getQuietStartup();
		const showDiagnostics =
			showListing || options?.showDiagnosticsWhenQuiet === true;
		if (!showListing && !showDiagnostics) return;

		const tuiTheme = ctxRef?.ui.theme;
		if (!tuiTheme) return;

		const skillsResult = this.session.resourceLoader.getSkills();
		const promptsResult = this.session.resourceLoader.getPrompts();
		const themesResult = this.session.resourceLoader.getThemes();
		const extensions =
			options?.force || this.session.resourceLoader.getExtensions().extensions
				? this.session.resourceLoader
						.getExtensions()
						.extensions.map((extension: StartupItem) => ({
							path: extension.path,
							sourceInfo: extension.sourceInfo,
						}))
				: [];

		if (showListing) {
			const contextFiles =
				this.session.resourceLoader.getAgentsFiles().agentsFiles;
			if (contextFiles.length > 0) {
				this.chatContainer.addChild(new Spacer(1));
				addStartupSection(this.chatContainer, tuiTheme, {
					name: "Context",
					icon: "◌",
					labels: contextFiles.map((file: { path: string }) =>
						this.formatContextPath(file.path),
					),
				});
			}

			if (skillsResult.skills.length > 0) {
				addStartupSection(this.chatContainer, tuiTheme, {
					name: "Skills",
					icon: "✦",
					labels: skillsResult.skills
						.map((skill: { name: string }) => skill.name)
						.sort((a: string, b: string) => a.localeCompare(b)),
					details: ["use /skill:name to load one when needed"],
				});
			}

			if (this.session.promptTemplates.length > 0) {
				addStartupSection(this.chatContainer, tuiTheme, {
					name: "Prompts",
					icon: "⌘",
					labels: this.session.promptTemplates
						.map((template: { name: string }) => `/${template.name}`)
						.sort((a: string, b: string) => a.localeCompare(b)),
				});
			}

			if (extensions.length > 0) {
				addStartupSection(this.chatContainer, tuiTheme, {
					name: "Extensions",
					icon: "◇",
					labels: this.getCompactExtensionLabels(extensions).sort(
						(a: string, b: string) => a.localeCompare(b),
					),
					details: ["runtime features loaded through extensions only"],
				});
			}

			const customThemes = themesResult.themes.filter(
				(loadedTheme: { sourcePath?: string }) => loadedTheme.sourcePath,
			);
			if (customThemes.length > 0) {
				addStartupSection(this.chatContainer, tuiTheme, {
					name: "Themes",
					icon: "◈",
					labels: customThemes
						.map(
							(loadedTheme: { name?: string; sourcePath?: string }) =>
								loadedTheme.name ?? loadedTheme.sourcePath ?? "theme",
						)
						.sort((a: string, b: string) => a.localeCompare(b)),
				});
			}
		}

		if (showDiagnostics) {
			const sourceInfos = new Map<string, unknown>();
			for (const extension of extensions) {
				if (extension.sourceInfo)
					sourceInfos.set(extension.path, extension.sourceInfo);
			}
			const diagnostics = [
				...skillsResult.diagnostics,
				...this.session.extensionRunner.getCommandDiagnostics(),
				...this.getBuiltInCommandConflictDiagnostics(
					this.session.extensionRunner,
				),
				...this.session.extensionRunner.getShortcutDiagnostics(),
				...themesResult.diagnostics,
			];
			if (diagnostics.length > 0) {
				this.chatContainer.addChild(
					new Text(
						`${tuiTheme.fg("warning", "╭─ ⚠ Diagnostics")}\n${this.formatDiagnostics(diagnostics, sourceInfos)}\n${tuiTheme.fg("borderMuted", "╰")}`,
						0,
						0,
					),
				);
				this.chatContainer.addChild(new Spacer(1));
			}
		}
	};
}

// --- Main ---
export default async function (pi: ExtensionAPI) {
	piRef = pi;
	await installStartupMenuPatch();
	installModernToolDefaults(pi);
	registerToolChrome(pi);

	pi.on("resources_discover", async () => ({ themePaths: [THEME_DIR] }));

	pi.on("agent_start", async () => {
		isWorking = true;
		if (features.spinner) startSpinner();
		if (features.titlebar) startTitlebar();
		activeTui?.requestRender();
	});

	pi.on("agent_end", async () => {
		isWorking = false;
		stopSpinner();
		stopTitlebar();
		activeTui?.requestRender();
	});

	pi.on("session_shutdown", async () => {
		stopSpinner();
		stopTitlebar();
		activeTui = undefined;
		ctxRef = undefined;
	});

	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode === "tui") {
			ctxRef = ctx;
			applyAll();
		}
	});

	pi.on("model_select", async () => activeTui?.requestRender());
	pi.on("thinking_level_select", async () => activeTui?.requestRender());

	pi.registerCommand("design-status", {
		description: "Show design-enhancer status",
		handler: async (_args, ctx) => {
			const items = (Object.keys(features) as FeatureKey[]).map(
				(key) => `${key}: ${features[key] ? "on" : "off"}`,
			);
			ctx.ui.notify(items.join(" · "), "info");
		},
	});

	const toggleFeature =
		(feature: FeatureKey) => (args: string, ctx: ExtensionContext) => {
			const val = args.trim().toLowerCase();
			if (val === "on") features[feature] = true;
			else if (val === "off") features[feature] = false;
			else features[feature] = !features[feature];

			applyAll();
			ctx.ui.notify(`${feature}: ${features[feature] ? "on" : "off"}`, "info");
		};

	pi.registerCommand("design-header", {
		description: "Toggle custom header [on|off]",
		handler: async (args, ctx) => toggleFeature("header")(args, ctx),
	});
	pi.registerCommand("design-footer", {
		description: "Toggle custom footer [on|off]",
		handler: async (args, ctx) => toggleFeature("footer")(args, ctx),
	});
	pi.registerCommand("design-editor", {
		description: "Toggle enhanced editor borders [on|off]",
		handler: async (args, ctx) => toggleFeature("editor")(args, ctx),
	});
	pi.registerCommand("design-spinner", {
		description: "Toggle working indicator [on|off]",
		handler: async (args, ctx) => toggleFeature("spinner")(args, ctx),
	});
	pi.registerCommand("design-titlebar", {
		description: "Toggle titlebar spinner [on|off]",
		handler: async (args, ctx) => toggleFeature("titlebar")(args, ctx),
	});
	pi.registerCommand("design-theme", {
		description: "Switch to refined-dark theme",
		handler: async (_args, ctx) =>
			ctx.ui.notify(
				"Theme available: refined-dark (/settings → theme)",
				"info",
			),
	});
	pi.registerCommand("design-reset", {
		description: "Reset all design enhancements to defaults",
		handler: async (_args, ctx) => {
			features = {
				header: false,
				footer: false,
				editor: false,
				spinner: false,
				titlebar: false,
			};
			ctx.ui.setHeader(undefined);
			ctx.ui.setFooter(undefined);
			ctx.ui.setEditorComponent(undefined);
			ctx.ui.setWorkingIndicator(undefined);
			stopSpinner();
			stopTitlebar();
			ctx.ui.setStatus("design", undefined);
			ctx.ui.notify("Design enhancer reset", "info");
		},
	});
}
