<script lang="ts">
	import { formatBytes } from '$lib/api/format';
	import UiIcon from './UiIcon.svelte';

	type Props = {
		accept?: string;
		maxBytes?: number;
		hint?: string;
		file?: File | null;
		error?: string;
	};

	let {
		accept,
		maxBytes,
		hint = 'Drag & drop a file here, or click to browse.',
		file = $bindable(null),
		error = $bindable('')
	}: Props = $props();

	let dragging = $state(false);
	let inputEl: HTMLInputElement;

	function pick(files: FileList | null) {
		if (!files || files.length === 0) return;
		const candidate = files[0];
		if (maxBytes && candidate.size > maxBytes) {
			error = `This file is too large (${formatBytes(candidate.size)}). Maximum allowed: ${formatBytes(maxBytes)}.`;
			file = null;
			return;
		}
		error = '';
		file = candidate;
	}

	function clear() {
		file = null;
		error = '';
		if (inputEl) inputEl.value = '';
	}
</script>

<div
	class="relative cursor-pointer rounded-xl border-2 border-dashed p-8 transition-colors {dragging
		? 'border-blue-600 bg-blue-50/50'
		: file
			? 'border-emerald-300 bg-emerald-50/30'
			: 'border-slate-300 bg-white hover:border-blue-600 hover:bg-slate-50/50'}"
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			inputEl?.click();
		}
	}}
	onclick={() => inputEl?.click()}
	ondragover={(e) => {
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	ondrop={(e) => {
		e.preventDefault();
		dragging = false;
		pick(e.dataTransfer?.files ?? null);
	}}
>
	<input
		bind:this={inputEl}
		type="file"
		class="sr-only"
		{accept}
		onchange={(e) => pick((e.currentTarget as HTMLInputElement).files)}
	/>

	{#if file}
		<div class="flex flex-col items-center gap-3 text-center">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
			>
				<UiIcon name="check" size={26} />
			</div>
			<div class="min-w-0">
				<p
					class="max-w-full truncate font-mono text-sm font-semibold text-slate-900"
					title={file.name}
				>
					{file.name}
				</p>
				<p class="mt-0.5 font-mono text-xs text-slate-500">{formatBytes(file.size)}</p>
			</div>
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					clear();
				}}
				class="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
				>Remove file</button
			>
		</div>
	{:else}
		<div class="flex flex-col items-center gap-3 text-center">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"
			>
				<UiIcon name="upload" size={26} />
			</div>
			<div>
				<p class="text-sm font-semibold text-slate-800">Drag &amp; drop the evidence file here</p>
				<p class="mt-0.5 text-xs text-slate-500">{hint}</p>
			</div>
			{#if maxBytes}
				<span
					class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-500"
					>Max {formatBytes(maxBytes)}</span
				>
			{/if}
		</div>
	{/if}
</div>

{#if error}
	<p class="mt-2 flex items-center gap-1.5 text-sm text-rose-600">
		<UiIcon name="alert" size={16} />
		{error}
	</p>
{/if}
