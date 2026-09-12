<script lang="ts">
	import type { CustodyEntry } from '$lib/api/types';
	import { actionLabel, formatDateTime } from '$lib/api/format';
	import EmptyState from './EmptyState.svelte';
	import UiIcon from './UiIcon.svelte';
	import type { IconName } from './icons';

	type Props = {
		entries?: CustodyEntry[];
		loading?: boolean;
	};

	let { entries = [], loading = false }: Props = $props();

	const nodeStyles: Record<string, string> = {
		INTAKE: 'border-emerald-300 bg-emerald-100 text-emerald-600',
		VERIFY: 'border-blue-300 bg-blue-100 text-blue-600',
		TRANSFER: 'border-slate-300 bg-slate-200 text-slate-600',
		EXPORT: 'border-slate-300 bg-slate-200 text-slate-600',
		ACCESS: 'border-slate-300 bg-slate-200 text-slate-600'
	};

	function nodeClass(action: string): string {
		return nodeStyles[action] ?? 'border-amber-300 bg-amber-100 text-amber-600';
	}

	function entryIcon(action: string): IconName {
		switch (action) {
			case 'INTAKE':
				return 'archive';
			case 'VERIFY':
				return 'verify';
			case 'TRANSFER':
				return 'transfer';
			case 'EXPORT':
				return 'download';
			case 'ACCESS':
				return 'eye';
			default:
				return 'note';
		}
	}
</script>

<div>
	{#if loading}
		<p class="py-6 text-center text-sm text-slate-500">Loading custody history…</p>
	{:else if entries.length === 0}
		<EmptyState
			icon="timeline"
			title="No custody events recorded"
			text="This evidence has no custody history yet."
		/>
	{:else}
		<ol class="relative">
			{#each entries as entry, i}
				<li class="relative flex gap-4 pb-8 last:pb-0">
					{#if i < entries.length - 1}
						<span class="absolute top-8 bottom-0 left-[15px] w-px bg-slate-200"></span>
					{/if}
					<div
						class="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 bg-white {nodeClass(
							entry.action
						)}"
					>
						<UiIcon name={entryIcon(entry.action)} size={16} />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
							<div class="flex flex-wrap items-center gap-2">
								<span
									class="rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase {nodeClass(
										entry.action
									)}">{actionLabel(entry.action)}</span
								>
								{#if entry.offline}
									<span
										class="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
									>
										<UiIcon name="wifiOff" size={13} />
										Offline entry
									</span>
								{/if}
							</div>
							<span class="shrink-0 font-mono text-xs text-slate-500"
								>{formatDateTime(entry.createdAt)}</span
							>
						</div>
						<p class="mt-1 text-sm font-medium text-slate-900">{entry.actor}</p>
						{#if entry.notes}
							<p class="mt-0.5 text-sm text-slate-600">{entry.notes}</p>
						{/if}
						{#if entry.resultingHash}
							<div
								class="mt-2 inline-flex max-w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5"
							>
								<span
									class="shrink-0 font-mono text-[10px] font-semibold tracking-wider text-slate-500 uppercase"
									>Hash</span
								>
								<span class="truncate font-mono text-xs text-slate-800" title={entry.resultingHash}
									>{entry.resultingHash}</span
								>
							</div>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
		<p class="mt-6 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
			Each event records who handled the evidence, when, and the resulting hash where applicable.
			This is a documented history — it is not a formal legal chain-of-custody certificate.
		</p>
	{/if}
</div>
