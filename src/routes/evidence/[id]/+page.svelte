<script lang="ts">
	import { page } from '$app/state';
	import { api, ApiError } from '$lib/api/client';
	import type {
		CustodyEntry,
		EvidenceDetail,
		EvidenceReport,
		MetadataRecord,
		VerifyResult
	} from '$lib/api/types';
	import { formatBytes, formatDateTime, kindLabel } from '$lib/api/format';
	import CustodyTimeline from '$lib/components/CustodyTimeline.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import HashValue from '$lib/components/HashValue.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import LocalFileCompare from '$lib/components/LocalFileCompare.svelte';
	import MetadataPanel from '$lib/components/MetadataPanel.svelte';
	import ReportView from '$lib/components/ReportView.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import VerifyPanel from '$lib/components/VerifyPanel.svelte';
	import UiIcon from '$lib/components/UiIcon.svelte';

	const id = $derived(page.params.id as string);

	let evidence = $state<EvidenceDetail | null>(null);
	let custody = $state<CustodyEntry[]>([]);
	let metadata = $state<MetadataRecord | null>(null);
	let report = $state<EvidenceReport | null>(null);
	let loading = $state(true);
	let error = $state('');
	let actor = $state('');
	let verifyResult = $state<VerifyResult | null>(null);

	async function load(evidenceId: string) {
		loading = true;
		error = '';
		evidence = null;
		custody = [];
		metadata = null;
		report = null;
		try {
			const [ev, cust, meta, rep] = await Promise.all([
				api.getEvidence(evidenceId),
				api.getCustody(evidenceId).catch(() => [] as CustodyEntry[]),
				api.getMetadata(evidenceId).catch(() => null as MetadataRecord | null),
				api.getReport(evidenceId).catch(() => null as EvidenceReport | null)
			]);
			evidence = ev;
			custody = cust;
			metadata = meta;
			report = rep;
			const intake = cust.find((c) => c.action === 'INTAKE');
			if (intake?.actor) actor = intake.actor;
		} catch (e) {
			error =
				e instanceof ApiError
					? e.message
					: e instanceof Error
						? e.message
						: 'Could not load this evidence item.';
		} finally {
			loading = false;
		}
	}

	async function handleVerified(res: VerifyResult) {
		verifyResult = res;
		try {
			custody = await api.getCustody(id);
		} catch {
			// Keep the previously loaded custody trail.
		}
		try {
			report = await api.getReport(id);
		} catch {
			// Keep the previously loaded report.
		}
	}

	$effect(() => {
		load(id);
	});

	const statusBadge = $derived.by(() => {
		if (verifyResult) {
			return verifyResult.status === 'UNALTERED'
				? { tone: 'verified' as const, label: 'Integrity verified' }
				: { tone: 'failed' as const, label: 'Integrity check failed' };
		}
		if (report?.lastVerifiedAt) {
			return { tone: 'accent' as const, label: 'Last verified' };
		}
		return { tone: 'pending' as const, label: 'Not yet verified' };
	});

	const intakeActor = $derived(custody.find((c) => c.action === 'INTAKE')?.actor ?? '—');
</script>

<svelte:head><title>{evidence?.fileName ?? 'Evidence'} — ChainGuard</title></svelte:head>

<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
	<a
		href="/evidence"
		class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
	>
		<UiIcon name="arrowBack" size={18} />
		Back to evidence
	</a>

	{#if loading}
		<LoadingState label="Loading evidence record…" />
	{:else if error}
		<ErrorState title="Could not load this evidence item" detail={error} retry={() => load(id)} />
	{:else if evidence}
		<!-- Header -->
		<div class="border-b border-slate-200 pb-6">
			<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div class="min-w-0">
					<div class="mb-2 flex flex-wrap items-center gap-2 font-mono text-xs text-slate-500">
						<span class="text-blue-700">Evidence record</span>
						<span class="text-slate-300">/</span>
						<span>{id}</span>
					</div>
					<h1
						class="font-display text-2xl font-extrabold tracking-tight break-all text-slate-900 sm:text-3xl"
						title={evidence.fileName}
					>
						{evidence.fileName}
					</h1>
					<p class="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
						<span
							class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600"
							>{kindLabel(evidence.mimeType)}</span
						>
						<span class="font-mono text-xs">{formatBytes(evidence.sizeBytes)}</span>
						<span>Registered {formatDateTime(evidence.createdAt)}</span>
					</p>
				</div>
				<div class="shrink-0">
					<StatusBadge
						tone={statusBadge.tone}
						label={statusBadge.label}
						pulse={statusBadge.tone === 'pending'}
					/>
				</div>
			</div>
		</div>

		<!-- Overview -->
		<section class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="file" size={20} class="text-slate-500" />
				<h2 class="font-display text-base font-bold text-slate-900">Evidence overview</h2>
			</div>
			<dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
				<div>
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						Evidence ID
					</dt>
					<dd class="mt-1 font-mono text-sm text-slate-900">{evidence._id}</dd>
				</div>
				<div>
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						Filename
					</dt>
					<dd class="mt-1 font-mono text-sm break-all text-slate-900">{evidence.fileName}</dd>
				</div>
				<div>
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						File type
					</dt>
					<dd class="mt-1 text-sm text-slate-900">
						{kindLabel(evidence.mimeType)} ({evidence.mimeType})
					</dd>
				</div>
				<div>
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						File size
					</dt>
					<dd class="mt-1 font-mono text-sm text-slate-900">{formatBytes(evidence.sizeBytes)}</dd>
				</div>
				<div>
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						Registered by
					</dt>
					<dd class="mt-1 text-sm text-slate-900">{intakeActor}</dd>
				</div>
				<div>
					<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
						Registered at
					</dt>
					<dd class="mt-1 font-mono text-sm text-slate-900">
						{formatDateTime(evidence.createdAt)}
					</dd>
				</div>
			</dl>
		</section>

		<!-- Integrity summary -->
		<section class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="verified" size={20} class="text-slate-500" />
				<h2 class="font-display text-base font-bold text-slate-900">Integrity status</h2>
			</div>
			{#if verifyResult}
				<div
					class="rounded-lg border-l-4 p-4 {verifyResult.status === 'UNALTERED'
						? 'border border-emerald-200 border-l-emerald-500 bg-emerald-50'
						: 'border border-rose-200 border-l-rose-500 bg-rose-50'}"
				>
					<p
						class="font-display text-base font-bold {verifyResult.status === 'UNALTERED'
							? 'text-emerald-900'
							: 'text-rose-900'}"
					>
						{verifyResult.status === 'UNALTERED' ? 'Integrity Verified' : 'Integrity Check Failed'}
					</p>
					<p
						class="mt-1 text-sm {verifyResult.status === 'UNALTERED'
							? 'text-emerald-800'
							: 'text-rose-800'}"
					>
						{verifyResult.message ??
							'The stored file matches the evidence registered in ChainGuard.'}
					</p>
				</div>
			{:else if report?.lastVerifiedAt}
				<p class="text-sm text-slate-700">
					This evidence was last verified on <span class="font-mono"
						>{formatDateTime(report.lastVerifiedAt)}</span
					>. Run a verification to confirm the current state.
				</p>
			{:else}
				<p class="text-sm text-slate-700">
					This evidence has not been verified yet. Run a verification to confirm that the stored
					file still matches its recorded fingerprint.
				</p>
			{/if}
			<p
				class="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
			>
				<UiIcon name="info" size={16} class="mt-0.5" />
				<span>
					Integrity means the current file matches the registered file. It does not prove that the
					depicted event happened or that the content is truthful.
				</span>
			</p>
		</section>

		<!-- Fingerprint -->
		<section class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="fingerprint" size={20} class="text-slate-500" />
				<h2 class="font-display text-base font-bold text-slate-900">Cryptographic fingerprint</h2>
			</div>
			<p class="mb-4 text-sm text-slate-600">
				The SHA-256 hash is a fingerprint of the file's bytes. Any change to the file changes the
				hash. File names are not the identity; the bytes are.
			</p>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<HashValue
					value={evidence.originalHash}
					label="Original fingerprint (recorded at intake)"
				/>
				<HashValue
					value={evidence.currentHash}
					label="Current chain hash"
					dark={evidence.originalHash !== evidence.currentHash}
				/>
			</div>
		</section>

		<!-- Verify -->
		<section id="verify" class="mt-6 scroll-mt-20 rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="verify" size={20} class="text-slate-500" />
				<h2 class="font-display text-base font-bold text-slate-900">Integrity verification</h2>
			</div>
			<p class="mb-4 text-sm text-slate-600">
				ChainGuard re-downloads the stored file, computes its current SHA-256, and compares it with
				the recorded hash. The verification attempt is recorded in the custody trail.
			</p>
			<VerifyPanel evidenceId={id} bind:actor onVerified={handleVerified} />
		</section>

		<!-- Compare a file -->
		<section class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="science" size={20} class="text-slate-500" />
				<h2 class="font-display text-base font-bold text-slate-900">Compare a suspect file</h2>
			</div>
			<LocalFileCompare recordedHash={evidence.currentHash} />
		</section>

		<!-- Custody -->
		<section class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="timeline" size={20} class="text-slate-500" />
				<h2 class="font-display text-base font-bold text-slate-900">Chain of custody</h2>
			</div>
			<CustodyTimeline entries={custody} />
		</section>

		<!-- Metadata -->
		<section class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="metadata" size={20} class="text-slate-500" />
				<h2 class="font-display text-base font-bold text-slate-900">Metadata</h2>
			</div>
			<MetadataPanel {metadata} />
		</section>

		<!-- Report -->
		<section class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="report" size={20} class="text-slate-500" />
				<h2 class="font-display text-base font-bold text-slate-900">Plain-language report</h2>
			</div>
			<ReportView {report} />
		</section>
	{/if}
</div>
