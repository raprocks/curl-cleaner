<script lang="ts">
	import {
		DEFAULT_CONFIG,
		formatHeaderList,
		parseHeaderList,
		type CleanerConfig
	} from '$lib/settings';

	type Props = {
		open: boolean;
		config: CleanerConfig;
		onclose: () => void;
		onchange: (config: CleanerConfig) => void;
	};

	let { open, config, onclose, onchange }: Props = $props();

	let draft = $state<CleanerConfig>({ ...DEFAULT_CONFIG });
	let denyText = $state('');
	let allowText = $state('');

	$effect(() => {
		if (open) {
			draft = { ...config };
			denyText = formatHeaderList(config.denyHeaders);
			allowText = formatHeaderList(config.allowHeaders);
		}
	});

	let dialogEl = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) dialogEl.showModal();
		else if (!open && dialogEl.open) dialogEl.close();
	});

	function apply() {
		const next: CleanerConfig = {
			...draft,
			denyHeaders: parseHeaderList(denyText),
			allowHeaders: parseHeaderList(allowText)
		};
		onchange(next);
		onclose();
	}

	function reset() {
		draft = { ...DEFAULT_CONFIG };
		denyText = '';
		allowText = '';
	}

	function handleDialogClose() {
		onclose();
	}
</script>

<dialog bind:this={dialogEl} class="settings-dialog" onclose={handleDialogClose}>
	<form method="dialog" onsubmit={(e) => { e.preventDefault(); apply(); }}>
		<header>
			<h2>Settings</h2>
			<button type="button" class="icon-btn" aria-label="Close" onclick={onclose}>×</button>
		</header>

		<div class="body">
			<fieldset>
				<legend>Defaults</legend>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.keepCookie} />
					<span>Keep <code>Cookie</code> header and <code>-b</code> flags</span>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.stripXHeaders} />
					<span>Strip <code>X-*</code> headers</span>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.compress} />
					<span>Compress output <span class="hint">(single line, no continuations)</span></span>
				</label>
			</fieldset>

			<label class="field">
				<span class="field-label">Always strip <span class="hint">(one header name per line)</span></span>
				<textarea
					bind:value={denyText}
					placeholder={'accept-encoding\nx-custom-noise'}
					spellcheck="false"
					rows="3"
				></textarea>
			</label>

			<label class="field">
				<span class="field-label">Always keep <span class="hint">(overrides other rules)</span></span>
				<textarea
					bind:value={allowText}
					placeholder={'x-api-key\nx-request-id'}
					spellcheck="false"
					rows="3"
				></textarea>
			</label>
		</div>

		<footer>
			<button type="button" class="ghost" onclick={reset}>Reset defaults</button>
			<div class="actions">
				<button type="button" class="ghost" onclick={onclose}>Cancel</button>
				<button type="submit" class="primary">Save</button>
			</div>
		</footer>
	</form>
</dialog>

<style>
	.settings-dialog {
		margin: auto;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: 0.625rem;
		background: var(--surface);
		color: var(--text);
		max-width: 26rem;
		width: calc(100% - 2rem);
		box-shadow: var(--shadow);
		font-family: system-ui, -apple-system, sans-serif;
	}

	.settings-dialog::backdrop {
		background: var(--backdrop);
	}

	form {
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	h2 {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.body {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	fieldset {
		margin: 0;
		padding: 0;
		border: none;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	legend {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		margin-bottom: 0.25rem;
	}

	.toggle {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.8125rem;
		line-height: 1.4;
		cursor: pointer;
	}

	.toggle input {
		margin-top: 0.15rem;
		accent-color: var(--accent);
	}

	.toggle code {
		font-family: inherit;
		font-size: 0.8125rem;
		background: var(--bg);
		padding: 0.1em 0.35em;
		border-radius: 0.25rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field-label {
		font-size: 0.8125rem;
	}

	.hint {
		color: var(--muted);
		font-weight: 400;
	}

	textarea {
		font-family: 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
		font-size: 0.75rem;
		line-height: 1.45;
		padding: 0.5rem 0.625rem;
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		background: var(--bg);
		color: var(--text);
		resize: vertical;
		min-height: 4rem;
	}

	textarea:focus {
		outline: none;
		border-color: var(--accent-dim);
	}

	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--border);
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		font-size: 0.8125rem;
		cursor: pointer;
		border-radius: 0.375rem;
		border: 1px solid var(--border);
		padding: 0.35rem 0.75rem;
		background: var(--bg);
		color: var(--text);
	}

	button.primary {
		background: var(--accent-dim);
		border-color: var(--accent);
		color: #fff;
	}

	button.primary:hover {
		background: var(--accent);
	}

	button.ghost:hover {
		border-color: var(--muted);
	}

	.icon-btn {
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		display: grid;
		place-items: center;
		font-size: 1.125rem;
		line-height: 1;
		color: var(--muted);
		border: none;
		background: transparent;
	}

	.icon-btn:hover {
		color: var(--text);
	}
</style>
