import type {
	BashToolDetails,
	EditToolDetails,
	ExtensionAPI,
	ExtensionContext,
	ReadToolDetails,
} from "@earendil-works/pi-coding-agent";
import {
	createBashTool,
	createEditTool,
	createReadTool,
	createWriteToolDefinition,
} from "@earendil-works/pi-coding-agent";
import { Text, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

let workingDotsTimer: ReturnType<typeof setInterval> | undefined;

export default function (pi: ExtensionAPI) {
	registerToolRenderers(pi);

	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		apply(ctx);
	});

	pi.on("model_select", (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		applyHeader(ctx);
		applyFooter(ctx);
	});
}

function apply(ctx: ExtensionContext) {
	ctx.ui.setTitle("pi");
	ctx.ui.setWorkingIndicator({ frames: [""] });
	startWorkingDots(ctx);
	applyHeader(ctx);
	applyFooter(ctx);
}

function startWorkingDots(ctx: ExtensionContext) {
	if (workingDotsTimer) clearInterval(workingDotsTimer);
	const frames = ["Working", "Working.", "Working..", "Working..."];
	let i = 0;
	const tick = () => ctx.ui.setWorkingMessage(frames[i++ % frames.length]);
	tick();
	workingDotsTimer = setInterval(tick, 220);
}

function applyHeader(ctx: ExtensionContext) {
	ctx.ui.setHeader((_tui, theme) => ({
		invalidate() {},
		render(width: number): string[] {
			const logo = theme.fg("accent", theme.bold("◐ pi"));
			const title = theme.fg("text", "minimal");
			const left = `${logo} ${theme.fg("dim", "·")} ${title}`;
			const project = theme.fg("muted", basename(ctx.cwd));
			const pad = " ".repeat(
				Math.max(1, width - visibleWidth(left) - visibleWidth(project)),
			);
			const line = truncateToWidth(left + pad + project, width);
			const rule = theme.fg("borderMuted", "─".repeat(Math.max(0, width)));
			return [line, rule];
		},
	}));
}

function applyFooter(ctx: ExtensionContext) {
	const { ui, model } = ctx;
	ui.setFooter((tui, theme, footerData) => {
		const unsub = footerData.onBranchChange(() => tui.requestRender());
		return {
			dispose: unsub,
			invalidate() {},
			render(width: number): string[] {
				let right = "";
				const repo = basename(ctx.cwd);
				const b = footerData.getGitBranch();
				if (b) {
					right +=
						theme.fg("muted", ` ${repo}`) +
						theme.fg("dim", ":") +
						theme.fg("success", b);
				} else {
					right += theme.fg("muted", ` ${repo}`);
				}
				const usage = ctx.getContextUsage();
				const tokens = usage?.tokens ?? null;
				const window = model?.contextWindow ?? usage?.contextWindow ?? 0;
				if (tokens != null && window > 0) {
					const pct = Math.round((tokens / window) * 100);
					const color = pct >= 85 ? "error" : pct >= 65 ? "warning" : "success";
					right += theme.fg(color, ` ${pct}%`) + theme.fg("dim", " ctx");
				} else if (tokens != null) {
					right += theme.fg("warning", ` ${fmt(tokens)}t`);
				}
				const m = model?.id ?? "";
				if (m)
					right +=
						(right ? theme.fg("dim", " · ") : "") +
						theme.fg("accent", `◉ ${m}`);
				if (!right) return [""];
				const pad = " ".repeat(Math.max(1, width - visibleWidth(right)));
				return [truncateToWidth(pad + right, width)];
			},
		};
	});
}

function registerToolRenderers(pi: ExtensionAPI) {
	const cwd = process.cwd();
	registerReadRenderer(pi, cwd);
	registerBashRenderer(pi, cwd);
	registerEditRenderer(pi, cwd);
	registerWriteRenderer(pi, cwd);
}

function registerReadRenderer(pi: ExtensionAPI, cwd: string) {
	const tool = createReadTool(cwd);
	pi.registerTool({
		name: "read",
		label: "read",
		description: tool.description,
		parameters: tool.parameters,
		execute: (toolCallId, params, signal, onUpdate) =>
			tool.execute(toolCallId, params, signal, onUpdate),
		renderCall: (args, theme) =>
			new Text(
				theme.fg("toolTitle", "◇ read ") +
					theme.fg("accent", compactPath(args.path)),
				0,
				0,
			),
		renderResult(result, { expanded, isPartial }, theme) {
			if (isPartial) return new Text(theme.fg("warning", "◇ reading…"), 0, 0);
			const details = result.details as ReadToolDetails | undefined;
			const content = result.content[0];
			if (content?.type === "image")
				return new Text(theme.fg("success", "□ image"), 0, 0);
			if (content?.type !== "text")
				return new Text(theme.fg("error", "no content"), 0, 0);
			const lines = content.text.split("\n");
			let text = theme.fg("success", `◇ ${lines.length} lines`);
			if (details?.truncation?.truncated)
				text += theme.fg(
					"warning",
					` / truncated from ${details.truncation.totalLines}`,
				);
			if (expanded)
				text += "\n" + lines.map((l) => theme.fg("dim", l)).join("\n");
			return new Text(text, 0, 0);
		},
	});
}

function registerBashRenderer(pi: ExtensionAPI, cwd: string) {
	const tool = createBashTool(cwd);
	pi.registerTool({
		name: "bash",
		label: "bash",
		description: tool.description,
		parameters: tool.parameters,
		execute: (toolCallId, params, signal, onUpdate) =>
			tool.execute(toolCallId, params, signal, onUpdate),
		renderCall: (args, theme) =>
			new Text(
				theme.fg("toolTitle", "› bash ") +
					theme.fg("accent", trim(args.command, 96)),
				0,
				0,
			),
		renderResult(result, { expanded, isPartial }, theme) {
			if (isPartial) return new Text(theme.fg("warning", "› running…"), 0, 0);
			const details = result.details as BashToolDetails | undefined;
			const output = firstText(result);
			const lines = output.split("\n").filter((l) => l.trim());
			const exitCode = Number(output.match(/exit code: (\d+)/)?.[1] ?? 0);
			let text =
				exitCode === 0
					? theme.fg("success", "✓ done")
					: theme.fg("error", `✗ exit ${exitCode}`);
			text += theme.fg("dim", ` / ${lines.length} lines`);
			if (details?.truncation?.truncated)
				text += theme.fg("warning", " / truncated");
			if (expanded && output)
				text +=
					"\n" +
					output
						.split("\n")
						.map((l) => theme.fg("dim", l))
						.join("\n");
			return new Text(text, 0, 0);
		},
	});
}

function registerEditRenderer(pi: ExtensionAPI, cwd: string) {
	const tool = createEditTool(cwd);
	pi.registerTool({
		name: "edit",
		label: "edit",
		description: tool.description,
		parameters: tool.parameters,
		execute: (toolCallId, params, signal, onUpdate) =>
			tool.execute(toolCallId, params, signal, onUpdate),
		renderCall: (args, theme) =>
			new Text(
				theme.fg("toolTitle", "± edit ") +
					theme.fg("accent", compactPath(args.path)),
				0,
				0,
			),
		renderResult(result, { expanded, isPartial }, theme) {
			if (isPartial) return new Text(theme.fg("warning", "± editing…"), 0, 0);
			const content = firstText(result);
			if (content.startsWith("Error"))
				return new Text(
					theme.fg("error", content.split("\n")[0] ?? "error"),
					0,
					0,
				);
			const details = result.details as EditToolDetails | undefined;
			if (!details?.diff)
				return new Text(theme.fg("success", "✓ applied"), 0, 0);
			const stats = diffStats(details.diff);
			let text = diffSummary(stats, theme);
			if (expanded) text += "\n" + renderDiff(details.diff, theme);
			return new Text(text, 0, 0);
		},
	});
}

function registerWriteRenderer(pi: ExtensionAPI, cwd: string) {
	const tool = createWriteToolDefinition(cwd);
	pi.registerTool({
		name: "write",
		label: "write",
		description: tool.description,
		parameters: tool.parameters,
		execute: (toolCallId, params, signal, onUpdate, ctx) =>
			tool.execute(toolCallId, params, signal, onUpdate, ctx),
		renderCall(args, theme, context) {
			if (context.expanded && tool.renderCall) {
				return tool.renderCall(args, theme, context);
			}
			const content = getWriteContent(args);
			const lines = writeLines(content);
			return new Text(
				theme.fg("toolTitle", "+ write ") +
					theme.fg("accent", compactPath(getWritePath(args))) +
					theme.fg("dim", ` / ${lines.length} lines`),
				0,
				0,
			);
		},
		renderResult(result, { isPartial }, theme, context) {
			const lines = writeLines(getWriteContent(context.args));
			if (isPartial) {
				return new Text(
					theme.fg("warning", "+ writing…") +
						theme.fg("dim", ` / ${lines.length} lines`),
					0,
					0,
				);
			}
			const content = firstText(result);
			if (content.startsWith("Error"))
				return new Text(
					theme.fg("error", content.split("\n")[0] ?? "error"),
					0,
					0,
				);
			if (context.expanded && tool.renderCall) {
				return tool.renderCall(context.args, theme, context);
			}
			return new Text(
				diffSummary({ added: lines.length, removed: 0 }, theme),
				0,
				0,
			);
		},
	});
}

function getWriteContent(args: { content?: string; file_content?: string }) {
	if (typeof args.content === "string") return args.content;
	if (typeof args.file_content === "string") return args.file_content;
	return "";
}

function getWritePath(args: { path?: string; file_path?: string }) {
	if (typeof args.path === "string") return args.path;
	if (typeof args.file_path === "string") return args.file_path;
	return "";
}

function writeLines(content: string) {
	return content === "" ? [] : content.split("\n");
}

function renderAddedLines(
	lines: string[],
	theme: { fg(color: string, text: string): string },
) {
	return lines.map((line) => theme.fg("success", `+${line}`)).join("\n");
}

function diffSummary(
	stats: { added: number; removed: number },
	theme: { fg(color: string, text: string): string },
) {
	return (
		theme.fg("success", `＋${stats.added}`) +
		theme.fg("dim", " / ") +
		theme.fg("error", `－${stats.removed}`)
	);
}

function firstText(result: {
	content: Array<{ type: string; text?: string }>;
}) {
	const first = result.content[0];
	return first?.type === "text" ? (first.text ?? "") : "";
}

function diffStats(diff: string) {
	let added = 0;
	let removed = 0;
	for (const line of diff.split("\n")) {
		if (line.startsWith("+") && !line.startsWith("+++")) added++;
		else if (line.startsWith("-") && !line.startsWith("---")) removed++;
	}
	return { added, removed };
}

function renderDiff(
	diff: string,
	theme: { fg(color: string, text: string): string },
) {
	return diff
		.split("\n")
		.map((line) => {
			if (line.startsWith("+") && !line.startsWith("+++"))
				return theme.fg("success", line);
			if (line.startsWith("-") && !line.startsWith("---"))
				return theme.fg("error", line);
			if (line.startsWith("@@")) return theme.fg("warning", line);
			return theme.fg("dim", line);
		})
		.join("\n");
}

function compactPath(path: string) {
	const parts = path.split("/").filter(Boolean);
	if (parts.length <= 2) return path;
	return `${parts.at(-2)}/${parts.at(-1)}`;
}

function trim(text: string, max: number) {
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function basename(path: string) {
	return path.split("/").filter(Boolean).pop() ?? path;
}

function fmt(n: number) {
	if (n < 1000) return `${n}`;
	if (n < 1_000_000) return `${(n / 1_000).toFixed(1)}k`;
	return `${(n / 1_000_000).toFixed(1)}m`;
}
