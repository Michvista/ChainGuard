<script lang="ts">
	import type { MetadataRecord } from '$lib/api/types';
	import { formatDateTime } from '$lib/api/format';
	import EmptyState from './EmptyState.svelte';
	import UiIcon from './UiIcon.svelte';

	type Props = {
		metadata?: MetadataRecord | null;
		loading?: boolean;
		error?: string;
	};

	let { metadata = null, loading = false, error = '' }: Props = $props();

	const rows = $derived.by(() => {
		if (!metadata) return [];
		return [
			{ label: 'Camera make', value: metadata.make },
			{ label: 'Camera model', value: metadata.cameraModel },
			{ label: 'Software', value: metadata.software },
			{ label: 'Capture timestamp', value: formatDateTime(metadata.dateTimeOriginal) },
			{
				label: 'GPS coordinates',
				value:
					metadata.gpsLatitude != null && metadata.gpsLongitude != null
						? `${Number(metadata.gpsLatitude).toFixed(6)}, ${Number(metadata.gpsLongitude).toFixed(6)}`
						: null
			}
		];
	});

	const hasAny = $derived(rows.some((r) => r.value));
	const hasC2pa = $derived(Boolean(metadata?.c2paPresent));
	const hasFlagNoExif = $derived(metadata?.flags?.includes('NO_EXIF_DATA') ?? false);
	const otherFlags = $derived((metadata?.flags ?? []).filter((f) => f !== 'NO_EXIF_DATA'));
</script>

<div>
	{#if loading}
		<p class="py-6 text-center text-sm text-slate-500">Reading observed file metadata…</p>
	{:else if error}
		<EmptyState
			icon="info"
			title="Metadata unavailable"
			text={error === '404'
				? 'No metadata record exists for this evidence item.'
				: 'Metadata could not be read for this item.'}
		/>
	{:else if !metadata}
		<EmptyState
			icon="info"
			title="Metadata unavailable"
			text="There is no metadata record for this evidence item."
		/>
	{:else if !hasAny && !hasC2pa && !hasFlagNoExif && otherFlags.length === 0}
		<EmptyState
			icon="metadata"
			title="No camera or origin metadata found"
			text="This file carries no readable origin metadata. Files are frequently stripped, converted, re-encoded, or generated without metadata, so this alone does not prove manipulation."
		/>
	{:else}
		<dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
			{#each rows as row}
				<div>
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						{row.label}
					</dt>
					<dd class="mt-1 text-sm text-slate-900">{row.value ?? '—'}</dd>
				</div>
			{/each}
			<div>
				<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
					C2PA provenance present
				</dt>
				<dd class="mt-1 text-sm text-slate-900">{hasC2pa ? 'Yes' : 'No'}</dd>
			</div>
		</dl>

		{#if hasFlagNoExif || otherFlags.length > 0}
			<div class="mt-5 space-y-2">
				{#if hasFlagNoExif}
					<p
						class="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
					>
						<UiIcon name="warning" size={16} class="mt-0.5" />
						<span>
							<strong>No EXIF data found.</strong> This is an observation, not a verdict. Missing metadata
							does not automatically mean the file is fake.
						</span>
					</p>
				{/if}
				{#each otherFlags as flag}
					<p
						class="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
					>
						<UiIcon name="flag" size={16} class="mt-0.5" />
						<span>Heuristic flag: <span class="font-mono">{flag}</span></span>
					</p>
				{/each}
			</div>
		{/if}

		<p
			class="mt-5 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
		>
			<UiIcon name="info" size={16} class="mt-0.5" />
			<span>
				These are <strong>observed file metadata</strong> recorded at intake. They are not proof that
				the file is authentic, and they can be stripped, rewritten, lost during conversion, or absent
				for legitimate reasons.
			</span>
		</p>
	{/if}
</div>
