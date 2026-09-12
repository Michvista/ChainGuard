<script lang="ts">
	import type { EvidenceReport } from '$lib/api/types';
	import { formatDateTime } from '$lib/api/format';
	import EmptyState from './EmptyState.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import UiIcon from './UiIcon.svelte';

	type Props = {
		report?: EvidenceReport | null;
		loading?: boolean;
		error?: string;
	};

	let { report = null, loading = false, error = '' }: Props = $props();
</script>

<div>
	{#if loading}
		<p class="py-6 text-center text-sm text-slate-500">Preparing report…</p>
	{:else if error}
		<EmptyState
			icon="report"
			title="Report unavailable"
			text="The plain-language report could not be generated for this item."
		/>
	{:else if !report}
		<EmptyState
			icon="report"
			title="Report unavailable"
			text="There is no report for this evidence item."
		/>
	{:else}
		<div class="space-y-6">
			<div class="rounded-lg border border-l-4 border-slate-200 border-l-emerald-500 bg-white p-5">
				<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
					<span class="font-mono text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
						Evidence report
					</span>
					<StatusBadge tone="accent" label="Plain-language" />
				</div>
				<p class="font-display text-lg leading-snug font-bold text-slate-900">
					{report.summary}
				</p>
			</div>

			<dl class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="rounded-lg border border-slate-200 bg-white p-4">
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">File</dt>
					<dd class="mt-1 truncate font-mono text-sm text-slate-900" title={report.fileName}>
						{report.fileName}
					</dd>
				</div>
				<div class="rounded-lg border border-slate-200 bg-white p-4">
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						Collected
					</dt>
					<dd class="mt-1 font-mono text-sm text-slate-900">
						{formatDateTime(report.collectedAt)}
					</dd>
				</div>
				<div class="rounded-lg border border-slate-200 bg-white p-4">
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						Last verified
					</dt>
					<dd class="mt-1 font-mono text-sm text-slate-900">
						{report.lastVerifiedAt ? formatDateTime(report.lastVerifiedAt) : 'Never verified'}
					</dd>
				</div>
			</dl>

			<div>
				<h3 class="mb-2 font-display text-sm font-bold text-slate-900">Metadata observations</h3>
				<div class="rounded-lg border border-slate-200 bg-white p-4">
					{#if report.metadataSummary?.notes?.length}
						<ul class="space-y-2">
							{#each report.metadataSummary.notes as note}
								<li class="flex gap-2 text-sm text-slate-700">
									<UiIcon name="note" size={15} class="mt-0.5 text-slate-400" />
									{note}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-slate-600">No metadata observations were recorded.</p>
					{/if}
				</div>
			</div>

			<div>
				<h3 class="mb-2 font-display text-sm font-bold text-slate-900">Custody events</h3>
				{#if report.custodyEvents?.length}
					<div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
						<table class="w-full min-w-[480px] text-left text-sm">
							<thead>
								<tr class="border-b border-slate-200 bg-slate-50">
									<th
										class="px-4 py-2.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
										>When</th
									>
									<th
										class="px-4 py-2.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
										>Who</th
									>
									<th
										class="px-4 py-2.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
										>What</th
									>
									<th
										class="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
										>Origin</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each report.custodyEvents as event}
									<tr>
										<td class="px-4 py-2.5 font-mono text-xs text-slate-600"
											>{formatDateTime(event.when)}</td
										>
										<td class="px-4 py-2.5 text-slate-900">{event.who}</td>
										<td class="px-4 py-2.5 text-slate-700">{event.what}</td>
										<td class="px-4 py-2.5 text-right">
											{#if event.offline}
												<span class="text-xs font-medium text-amber-700">Offline</span>
											{:else}
												<span class="text-xs text-slate-500">Online</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
						No custody events were recorded for this item.
					</div>
				{/if}
			</div>

			<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
				<h3 class="mb-2 font-display text-sm font-bold text-slate-900">What this report means</h3>
				<p class="text-sm leading-relaxed text-slate-700">
					This report describes whether the registered file still matches its recorded fingerprint
					and how it was handled. It does not claim that the depicted event actually happened, that
					the content is truthful, or that the evidence is admissible in court. Those questions
					require qualified forensic and legal review.
				</p>
			</div>
		</div>
	{/if}
</div>
