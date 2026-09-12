<script lang="ts">
	import { api } from '$lib/api/client';
	import type { CustodyEntry, Evidence } from '$lib/api/types';
	import { actionLabel, formatBytes, formatDateTime, kindLabel, shortHash } from '$lib/api/format';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import UiIcon from '$lib/components/UiIcon.svelte';

	let rows = $state<{ evidence: Evidence; custody: CustodyEntry[] }[]>([]);
	let loading = $state(true);
	let error = $state('');
	let query = $state('');

	async function load() {
		loading = true;
		error = '';
		try {
			const list = await api.listEvidence();
			const withCustody = await Promise.all(
				list.map(async (evidence) => {
					try {
						return { evidence, custody: await api.getCustody(evidence._id) };
					} catch {
						return { evidence, custody: [] };
					}
				})
			);
			rows = withCustody;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load evidence.';
		} finally {
			loading = false;
		}
	}

	function loadError() {
		load();
	}

	const filtered = $derived(
		query.trim()
			? rows.filter((r) => r.evidence.fileName.toLowerCase().includes(query.trim().toLowerCase()))
			: rows
	);

	function lastEvent(entry: CustodyEntry[]): CustodyEntry | null {
		return entry.length > 0 ? entry[entry.length - 1] : null;
	}

	function intakeActor(entry: CustodyEntry[]): string {
		const first = entry.find((e) => e.action === 'INTAKE');
		return first?.actor ?? entry[0]?.actor ?? '—';
	}
</script>

<svelte:head><title>Evidence — ChainGuard</title></svelte:head>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
	<div
		class="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"
	>
		<div>
			<div
				class="mb-2 flex items-center gap-2 font-mono text-xs tracking-wider text-blue-700 uppercase"
			>
				<span class="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
				<span>Evidence registry</span>
			</div>
			<h1 class="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
				Registered Evidence
			</h1>
			<p class="mt-1 text-sm text-slate-600">
				Files registered with ChainGuard, their fingerprints, and their custody activity.
			</p>
		</div>
		<a
			href="/evidence/new"
			class="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 sm:self-auto"
		>
			<UiIcon name="add" size={18} />
			Register Evidence
		</a>
	</div>

	<div class="mt-6">
		{#if loading}
			<LoadingState label="Loading registered evidence…" />
		{:else if error}
			<ErrorState title="Could not load evidence" detail={error} retry={loadError} />
		{:else if rows.length === 0}
			<EmptyState
				icon="evidence"
				title="No evidence registered yet"
				text="Register a file to create its cryptographic fingerprint and custody record."
			>
				<a
					href="/evidence/new"
					class="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
				>
					<UiIcon name="upload" size={18} />
					Register Evidence
				</a>
			</EmptyState>
		{:else}
			<div class="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
				<p class="text-sm text-slate-600">
					<span class="font-semibold text-slate-900">{rows.length}</span>
					{rows.length === 1 ? 'item' : 'items'} registered
				</p>
				<div class="relative w-full sm:w-72">
					<UiIcon
						name="search"
						size={18}
						class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
					/>
					<input
						type="search"
						bind:value={query}
						placeholder="Filter by filename…"
						class="h-10 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
					/>
				</div>
			</div>

			<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
				<table class="w-full min-w-[820px] text-left text-sm">
					<thead>
						<tr class="border-b border-slate-200 bg-slate-50">
							<th
								class="px-4 py-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
							>
								Evidence
							</th>
							<th
								class="px-4 py-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
							>
								Type
							</th>
							<th
								class="px-4 py-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
							>
								Registered by
							</th>
							<th
								class="px-4 py-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
							>
								Registered
							</th>
							<th
								class="px-4 py-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
							>
								Size
							</th>
							<th
								class="px-4 py-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
							>
								SHA-256 fingerprint
							</th>
							<th
								class="px-4 py-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
							>
								Latest custody
							</th>
							<th
								class="px-4 py-3 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
							>
								Action
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each filtered as row}
							{@const last = lastEvent(row.custody)}
							<tr class="transition-colors hover:bg-slate-50/70">
								<td class="px-4 py-3">
									<div class="flex items-center gap-3">
										<div
											class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
										>
											<UiIcon name="file" size={18} />
										</div>
										<div class="min-w-0">
											<p
												class="max-w-[220px] truncate font-medium text-slate-900"
												title={row.evidence.fileName}
											>
												{row.evidence.fileName}
											</p>
											<p class="font-mono text-[11px] text-slate-400">id {row.evidence._id}</p>
										</div>
									</div>
								</td>
								<td class="px-4 py-3">
									<span
										class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600"
										>{kindLabel(row.evidence.mimeType)}</span
									>
								</td>
								<td class="px-4 py-3 text-slate-700">{intakeActor(row.custody)}</td>
								<td class="px-4 py-3 font-mono text-xs text-slate-600"
									>{formatDateTime(row.evidence.createdAt)}</td
								>
								<td class="px-4 py-3 font-mono text-xs text-slate-600"
									>{formatBytes(row.evidence.sizeBytes)}</td
								>
								<td class="px-4 py-3">
									<span class="font-mono text-xs text-slate-700" title={row.evidence.originalHash}
										>{shortHash(row.evidence.originalHash)}</span
									>
								</td>
								<td class="px-4 py-3">
									{#if last}
										<div class="flex items-center gap-2">
											<StatusBadge tone="neutral" label={actionLabel(last.action)} />
											<span class="font-mono text-[11px] text-slate-400"
												>{formatDateTime(last.createdAt)}</span
											>
										</div>
									{:else}
										<span class="text-xs text-slate-400">No custody events</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-right">
									<a
										href={`/evidence/${row.evidence._id}`}
										class="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
									>
										Open
										<UiIcon name="arrowForward" size={15} />
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if filtered.length === 0 && rows.length > 0}
					<p class="px-4 py-8 text-center text-sm text-slate-500">
						No evidence matches “{query}”.
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
