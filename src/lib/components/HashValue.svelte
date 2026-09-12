<script lang="ts">
	import UiIcon from './UiIcon.svelte';

	type Props = {
		value: string;
		label?: string;
		copyable?: boolean;
		dark?: boolean;
		tone?: 'emerald' | 'rose' | 'slate';
	};

	let {
		value,
		label = 'SHA-256',
		copyable = true,
		dark = false,
		tone = 'emerald'
	}: Props = $props();

	let copied = $state(false);

	async function copyHash() {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			// Clipboard unavailable (e.g. insecure context). Copy silently fails.
		}
	}

	const textColor = $derived(
		dark
			? tone === 'rose'
				? 'text-rose-300'
				: tone === 'slate'
					? 'text-slate-200'
					: 'text-emerald-300'
			: 'text-slate-800'
	);

	const borderColor = $derived(
		dark && tone === 'rose' ? 'border-rose-500/60' : dark ? 'border-slate-700' : 'border-slate-200'
	);
</script>

<div class="rounded-lg border p-3 {dark ? 'bg-slate-900' : 'bg-slate-50'} {borderColor}">
	<div class="flex items-center justify-between gap-2">
		<span
			class="font-mono text-[10px] font-semibold tracking-wider uppercase {dark
				? 'text-slate-400'
				: 'text-slate-500'}">{label}</span
		>
		{#if copyable}
			<button
				type="button"
				onclick={copyHash}
				class="inline-flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase {dark
					? 'text-slate-400 hover:text-white'
					: 'text-slate-500 hover:text-slate-900'}"
			>
				<UiIcon
					name={copied ? 'check' : 'copy'}
					size={14}
					class={dark ? 'text-slate-400' : 'text-slate-500'}
				/>
				{copied ? 'Copied' : 'Copy'}
			</button>
		{/if}
	</div>
	<p class="mt-1.5 font-mono text-xs leading-relaxed break-all {textColor}">{value}</p>
</div>
