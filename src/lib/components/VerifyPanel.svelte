<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import type { VerifyResult } from '$lib/api/types';
	import { humanizeIntegrityResult } from '$lib/api/format';
	import HashValue from './HashValue.svelte';

	type Props = {
		evidenceId: string;
		actor?: string;
		onVerified?: (result: VerifyResult) => void;
	};

	let { evidenceId, actor = $bindable(''), onVerified = () => {} }: Props = $props();

	let verifying = $state(false);
	let error = $state('');
	let result = $state<VerifyResult | null>(null);
	let phase = $state<'idle' | 'downloading' | 'hashing' | 'comparing' | 'done'>('idle');

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function run() {
		if (!actor.trim()) {
			error = 'Enter the actor performing this verification.';
			return;
		}
		error = '';
		result = null;
		verifying = true;
		try {
			phase = 'downloading';
			await delay(350);
			phase = 'hashing';
			const res = await api.verifyEvidence(evidenceId, actor.trim());
			phase = 'comparing';
			await delay(350);
			result = res;
			phase = 'done';
			onVerified(res);
		} catch (e) {
			error =
				e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Verification failed.';
			phase = 'idle';
		} finally {
			verifying = false;
		}
	}

	const steps = [
		{ key: 'downloading', label: 'Re-download the stored file' },
		{ key: 'hashing', label: 'Compute the current SHA-256' },
		{ key: 'comparing', label: 'Compare with the recorded hash' }
	];

	const order: Record<string, number> = {
		idle: -1,
		downloading: 0,
		hashing: 1,
		comparing: 2,
		done: 3
	};

	const matched = $derived(result?.status === 'UNALTERED');
</script>

<div>
	{#if error}
		<div
			class="mb-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
		>
			<span class="material-symbols-outlined mt-0.5 text-[16px]">error</span>
			<span>{error}</span>
		</div>
	{/if}

	<div class="rounded-lg border border-slate-200 bg-white p-5">
		<label for="verify-actor" class="mb-1.5 block text-sm font-semibold text-slate-700">
			Actor performing the verification
		</label>
		<div class="flex flex-col gap-3 sm:flex-row">
			<input
				id="verify-actor"
				bind:value={actor}
				type="text"
				placeholder="e.g. Analyst B. Okafor"
				class="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
			/>
			<button
				type="button"
				onclick={run}
				disabled={verifying}
				class="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if verifying}
					<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
					Checking…
				{:else}
					<span class="material-symbols-outlined text-[18px]">fact_check</span>
					Verify Integrity
				{/if}
			</button>
		</div>

		{#if verifying}
			<ol class="mt-5 space-y-2.5">
				{#each steps as step, i}
					{@const active = phase === step.key}
					{@const done = order[phase] > i}
					<li class="flex items-center gap-3 text-sm">
						<span
							class="flex h-6 w-6 items-center justify-center rounded-full border {active
								? 'border-blue-600 bg-blue-600 text-white'
								: done
									? 'border-emerald-300 bg-emerald-50 text-emerald-600'
									: 'border-slate-200 bg-slate-50 text-slate-400'}"
						>
							{#if done}
								<span class="material-symbols-outlined text-[14px]">check</span>
							{:else if active}
								<span class="material-symbols-outlined animate-spin text-[14px]"
									>progress_activity</span
								>
							{:else}
								<span class="text-[11px]">{i + 1}</span>
							{/if}
						</span>
						<span
							class={active
								? 'font-medium text-slate-900'
								: done
									? 'text-emerald-700'
									: 'text-slate-500'}
						>
							{step.label}
						</span>
					</li>
				{/each}
			</ol>
		{/if}

		{#if result}
			{@const human = humanizeIntegrityResult(result.status)}
			<div
				class="mt-5 rounded-lg border border-l-4 p-5 {matched
					? 'border-emerald-200 border-l-emerald-500 bg-emerald-50'
					: 'border-rose-200 border-l-rose-500 bg-rose-50'}"
			>
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined {matched ? 'text-emerald-600' : 'text-rose-600'}"
						>{matched ? 'verified_user' : 'warning'}</span
					>
					<h3
						class="font-display text-lg font-bold {matched ? 'text-emerald-900' : 'text-rose-900'}"
					>
						{human.title}
					</h3>
				</div>
				<p class="mt-1 text-sm {matched ? 'text-emerald-800' : 'text-rose-800'}">
					{result.message ?? human.detail}
				</p>
				<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
					<HashValue value={result.recordedHash} label="Recorded hash" dark />
					<HashValue
						value={result.computedHash}
						label="Current hash"
						dark
						tone={matched ? 'emerald' : 'rose'}
					/>
				</div>
				<p
					class="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-white/70 p-3 text-sm text-slate-700"
				>
					<span class="material-symbols-outlined mt-0.5 text-[16px]">info</span>
					<span>
						This confirms whether the stored file matches the evidence registered in ChainGuard. It
						does not judge whether the depicted event happened or whether the content is truthful.
					</span>
				</p>
			</div>
		{/if}
	</div>
</div>
