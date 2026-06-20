type ExtensionAPI = {
	on(
		event: "before_provider_request",
		handler: (
			event: { type: "before_provider_request"; payload: unknown },
			ctx: {
				model?: {
					id?: string;
					provider?: string;
					api?: string;
					maxTokens?: number;
				};
			},
		) => unknown,
	): void;
};

const FALLBACK_MAX_TOKENS = 16_384;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function (pi: ExtensionAPI) {
	pi.on("before_provider_request", (event, ctx) => {
		const model = ctx.model;
		const payload = event.payload;

		if (!model || !isRecord(payload)) return;
		if (
			model.provider !== "cortex" ||
			model.api !== "openai-completions" ||
			model.id !== "qwen3.6-27B-pi-tune"
		) {
			return;
		}

		// This Cortex-served fine-tune is intended to answer directly, but the
		// server's Qwen chat template defaults to thinking unless explicitly disabled.
		// Pi also omits max_tokens unless an explicit per-call cap is present; for this
		// model Cortex defaults that to 1, so the single token can land in hidden
		// reasoning_content and make the visible answer look empty/stray.
		const nextPayload: Record<string, unknown> = {
			...payload,
			chat_template_kwargs: {
				...(isRecord(payload.chat_template_kwargs)
					? payload.chat_template_kwargs
					: {}),
				enable_thinking: false,
				preserve_thinking: false,
			},
		};

		if (
			nextPayload.max_tokens === undefined &&
			nextPayload.max_completion_tokens === undefined
		) {
			const maxTokens =
				typeof model.maxTokens === "number" &&
				Number.isFinite(model.maxTokens) &&
				model.maxTokens > 0
					? model.maxTokens
					: FALLBACK_MAX_TOKENS;
			nextPayload.max_tokens = maxTokens;
		}

		return nextPayload;
	});
}
