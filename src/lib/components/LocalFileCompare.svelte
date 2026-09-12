<script lang="ts">
	import { sha256Hex } from '$lib/api/hash';
	import { formatBytes } from '$lib/api/format';
	import FilePicker from './FilePicker.svelte';
	import HashValue from './HashValue.svelte';
	import UiIcon from './UiIcon.svelte';

	type Props = {
		recordedHash: string;
	};

	let { recordedHash }: Props = $props();

	let file = $state<File | null>(null);
	let pickerError = $state('');
	let comparing = $state(false);
	let computeError = $state('');
	let result = $state<{ match: boolean; computedHash: string } | null>(null);

	async function compare() {
		computeError = '';
		result = null;
		if (!file) {
			pickerError = 'Select a file to compare.';
			return;
		}
		comparing = true;
		try {
			const computedHash = await sha256Hex(file);
			result = { match: computedHash.toLowerCase() === recordedHash.toLowerCase(), computedHash };
		} catch (e) {
			computeError = e instanceof Error ? e.message : 'Could not compute the file hash.';
		} finally {
			comparing = false;
		}
	}
</script>

<div class="rounded-lg border border-slate-200 bg-white p-5">
	<div class="mb-4">
		<h3 class="font-display text-base font-bold text-slate-900">
			Compare a file against the registered fingerprint
		</h3>
		<p class="mt-1 text-sm text-slate-600">
			Select any file to have this browser compute its SHA-256 and compare it with the fingerprint
			recorded for this evidence. The file is hashed locally and is
			<strong>never uploaded</strong>. This is the safe way to demonstrate what happens when a copy
			is modified.
		</p>
	</div>

	<FilePicker
		bind:file
		bind:error={pickerError}
		hint="Select the original, a modified copy, or a re-encoded version…"
	/>

	<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		{#if file}
			<p class="font-mono text-xs text-slate-500">{file.name} · {formatBytes(file.size)}</p>
		{:else}
			<p class="text-xs text-slate-400">No file selected.</p>
		{/if}
		<button
			type="button"
			onclick={compare}
			disabled={comparing || !file}
			class="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if comparing}
				<UiIcon name="spinner" size={18} class="animate-spin" />
				Hashing…
			{:else}
				<UiIcon name="fingerprint" size={18} />
				Compute &amp; Compare
			{/if}
		</button>
	</div>

	{#if computeError}
		<p class="mt-3 text-sm text-rose-600">{computeError}</p>
	{/if}

	{#if result}
		<div
			class="mt-5 rounded-lg border border-l-4 p-5 {result.match
				? 'border-emerald-200 border-l-emerald-500 bg-emerald-50'
				: 'border-rose-200 border-l-rose-500 bg-rose-50'}"
		>
			<div class="flex items-center gap-2">
				<UiIcon
					name={result.match ? 'verified' : 'mismatch'}
					size={20}
					class={result.match ? 'text-emerald-600' : 'text-rose-600'}
				/>
				<h4
					class="font-display text-base font-bold {result.match
						? 'text-emerald-900'
						: 'text-rose-900'}"
				>
					{result.match
						? 'File matches the registered evidence'
						: 'File does not match the registered evidence'}
				</h4>
			</div>
			<p class="mt-1 text-sm {result.match ? 'text-emerald-800' : 'text-rose-800'}">
				{#if result.match}
					This file is byte-for-byte identical to the evidence registered in ChainGuard.
				{:else}
					The selected file is a different digital artifact. It is not byte-for-byte identical to
					the registered evidence.
				{/if}
			</p>
			<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
				<HashValue value={recordedHash} label="Registered fingerprint" />
				<HashValue
					value={result.computedHash}
					label="Selected file hash"
					dark
					tone={result.match ? 'emerald' : 'rose'}
				/>
			</div>
			<p
				class="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-white/70 p-3 text-sm text-slate-700"
			>
				<UiIcon name="info" size={16} class="mt-0.5" />
				<span>
					A mismatch does not mean the file is “fake”. Visually similar copies (such as a screenshot
					or a re-encoded video) are different digital artifacts and produce different hashes. This
					tool reports a change in the digital artifact, not a judgment about its content.
				</span>
			</p>
		</div>
	{/if}
</div>
