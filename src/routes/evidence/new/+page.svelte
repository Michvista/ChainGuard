<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import type { Evidence, MetadataRecord } from '$lib/api/types';
	import { formatBytes, formatDateTime, kindLabel } from '$lib/api/format';
	import FilePicker from '$lib/components/FilePicker.svelte';
	import HashValue from '$lib/components/HashValue.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import UiIcon from '$lib/components/UiIcon.svelte';

	const MAX_BYTES = 50 * 1024 * 1024;

	let file = $state<File | null>(null);
	let actor = $state('');
	let submitting = $state(false);
	let error = $state('');
	let pickerError = $state('');
	let result = $state<{ evidence: Evidence; metadata: MetadataRecord } | null>(null);

	async function submit() {
		error = '';
		pickerError = '';
		if (!file) {
			pickerError = 'Select a file to register.';
			return;
		}
		if (!actor.trim()) {
			error = 'Enter the actor who is collecting or registering the evidence.';
			return;
		}
		submitting = true;
		try {
			const res = await api.createEvidence(file, actor.trim());
			result = res;
		} catch (e) {
			error =
				e instanceof ApiError
					? e.message
					: e instanceof Error
						? e.message
						: 'The evidence could not be registered.';
		} finally {
			submitting = false;
		}
	}

	function reset() {
		result = null;
		file = null;
		actor = '';
		error = '';
		pickerError = '';
	}

	const noExif = $derived(result?.metadata.flags?.includes('NO_EXIF_DATA') ?? false);
</script>

<svelte:head><title>Register Evidence — ChainGuard</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
	<div class="mb-8">
		<div
			class="mb-2 flex items-center gap-2 font-mono text-xs tracking-wider text-blue-700 uppercase"
		>
			<span class="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
			<span>Evidence intake</span>
		</div>
		<h1 class="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
			Register Evidence
		</h1>
		<p class="mt-1 max-w-2xl text-sm text-slate-600">
			Upload a file, identify the actor collecting it, and ChainGuard will compute a SHA-256
			fingerprint and create the first custody record.
		</p>
	</div>

	{#if result}
		<div class="rounded-xl border border-slate-200 bg-white">
			<div class="border-b-4 border-b-emerald-500 p-6 sm:p-8">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div class="flex items-start gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
						>
							<UiIcon name="verified" size={22} />
						</div>
						<div>
							<h2 class="font-display text-lg font-bold text-slate-900">
								Evidence registered successfully
							</h2>
							<p class="mt-0.5 text-sm text-slate-600">
								This is the original evidence we registered. Its fingerprint and first custody
								record are now stored.
							</p>
						</div>
					</div>
					<StatusBadge tone="neutral" label="Registered · not yet verified" />
				</div>

				<dl class="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
					<div>
						<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
							Evidence ID
						</dt>
						<dd class="mt-1 font-mono text-sm text-slate-900">{result.evidence._id}</dd>
					</div>
					<div>
						<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
							Filename
						</dt>
						<dd
							class="mt-1 truncate font-mono text-sm text-slate-900"
							title={result.evidence.fileName}
						>
							{result.evidence.fileName}
						</dd>
					</div>
					<div>
						<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
							File type
						</dt>
						<dd class="mt-1 text-sm text-slate-900">{kindLabel(result.evidence.mimeType)}</dd>
					</div>
					<div>
						<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
							File size
						</dt>
						<dd class="mt-1 text-sm text-slate-900">{formatBytes(result.evidence.sizeBytes)}</dd>
					</div>
					<div>
						<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
							Registered by
						</dt>
						<dd class="mt-1 text-sm text-slate-900">{actor.trim()}</dd>
					</div>
					<div>
						<dt class="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
							Registered at
						</dt>
						<dd class="mt-1 font-mono text-sm text-slate-900">
							{formatDateTime(result.evidence.createdAt)}
						</dd>
					</div>
				</dl>

				<div class="mt-6">
					<HashValue dark value={result.evidence.originalHash} label="SHA-256 fingerprint" />
				</div>

				{#if noExif}
					<p
						class="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
					>
						<UiIcon name="info" size={16} class="mt-0.5" />
						<span>
							No camera or origin metadata was found in this file. Missing metadata does not by
							itself prove manipulation — files are frequently stripped, converted, or generated
							without metadata.
						</span>
					</p>
				{/if}
			</div>

			<div
				class="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8"
			>
				<a
					href={`/evidence/${result.evidence._id}`}
					class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
				>
					<UiIcon name="openNew" size={18} />
					Open Evidence
				</a>
				<a
					href={`/evidence/${result.evidence._id}#verify`}
					class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
				>
					<UiIcon name="verify" size={18} />
					Verify Integrity
				</a>
				<button
					type="button"
					onclick={reset}
					class="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
				>
					<UiIcon name="add" size={18} />
					Register Another
				</button>
			</div>
		</div>
	{:else}
		<div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
			<FilePicker bind:file bind:error={pickerError} maxBytes={MAX_BYTES} accept="*/*" />

			<div class="mt-6">
				<label for="actor" class="mb-1.5 block text-sm font-semibold text-slate-700">
					Actor / collecting officer
				</label>
				<input
					id="actor"
					bind:value={actor}
					type="text"
					placeholder="e.g. Investigator A. Adebayo"
					class="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
				/>
				<p class="mt-1.5 text-xs text-slate-500">
					The name or ID of the person collecting or registering the evidence. This is recorded in
					the custody log.
				</p>
			</div>

			{#if error}
				<div
					class="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
				>
					<UiIcon name="alert" size={16} class="mt-0.5" />
					<span>{error}</span>
				</div>
			{/if}

			<div
				class="mt-6 flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"
			>
				<p class="text-xs text-slate-500">
					The file is uploaded to secure storage and hashed with SHA-256.
				</p>
				<button
					type="button"
					onclick={submit}
					disabled={submitting}
					class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{#if submitting}
						<UiIcon name="spinner" size={18} class="animate-spin" />
						Registering…
					{:else}
						<UiIcon name="lock" size={18} />
						Register Evidence
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>
