<script lang="ts">
	import UiIcon from '$lib/components/UiIcon.svelte';
	import type { IconName } from '$lib/components/icons';

	const steps: { icon: IconName; title: string; text: string }[] = [
		{ icon: 'archive', title: 'Collect', text: 'A file is registered as evidence.' },
		{ icon: 'fingerprint', title: 'Hash', text: 'A SHA-256 fingerprint is recorded.' },
		{ icon: 'timeline', title: 'Track', text: 'Every custody action is logged.' },
		{ icon: 'verified', title: 'Verify', text: 'The file can be checked again.' },
		{ icon: 'report', title: 'Report', text: 'A plain-language report is produced.' }
	];

	const establishes = [
		{
			title: 'The file is the same file',
			text: 'Whether a presented file is byte-for-byte identical to the file registered at intake.'
		},
		{
			title: 'How the evidence was handled',
			text: 'A chronological, auditable chain of custody for the registered artifact.'
		},
		{
			title: 'Metadata observations',
			text: 'Camera, capture, software and origin metadata found in the file, if any.'
		},
		{
			title: 'What the system cannot know',
			text: 'ChainGuard does not judge whether an event actually happened or whether media is truthful.'
		}
	];

	const limitations = [
		'It does not prove that the depicted event happened.',
		'It does not detect deepfakes or visual manipulation.',
		'It does not independently establish who created the file.',
		'It does not guarantee legal admissibility.'
	];
</script>

<svelte:head><title>ChainGuard — Digital Evidence Integrity</title></svelte:head>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
	<!-- Hero -->
	<section class="border-b border-slate-200 pt-14 pb-12 sm:pt-20">
		<div class="max-w-3xl">
			<div
				class="mb-4 flex items-center gap-2 font-mono text-xs tracking-wider text-blue-700 uppercase"
			>
				<span class="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
				<span>ICSC 2026 · Track H — Proving Digital Evidence Has Not Been Changed</span>
			</div>
			<h1
				class="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1]"
			>
				Verify that digital evidence has not been altered since it was collected.
			</h1>
			<p class="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
				ChainGuard registers digital evidence, records a cryptographic fingerprint and a chain of
				custody, then lets you verify whether a file still matches the evidence that was originally
				collected.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a
					href="/evidence/new"
					class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
				>
					<UiIcon name="upload" size={18} />
					Register Evidence
				</a>
				<a
					href="/evidence"
					class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
				>
					<UiIcon name="evidence" size={18} class="text-slate-500" />
					View Evidence
				</a>
			</div>
		</div>
	</section>

	<!-- Workflow -->
	<section class="py-12">
		<h2 class="font-display text-lg font-bold tracking-tight text-slate-900">How it works</h2>
		<p class="mt-1 max-w-2xl text-sm text-slate-600">
			A single workflow moves evidence from collection to a readable integrity report.
		</p>
		<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
			{#each steps as step, i}
				<div class="relative rounded-xl border border-slate-200 bg-white p-5">
					<div class="mb-3 flex items-center justify-between">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white"
						>
							<UiIcon name={step.icon} size={20} />
						</div>
						<span class="font-mono text-xs font-semibold text-slate-400">0{i + 1}</span>
					</div>
					<h3 class="font-display text-sm font-bold text-slate-900">{step.title}</h3>
					<p class="mt-1 text-xs leading-relaxed text-slate-600">{step.text}</p>
					{#if i < steps.length - 1}
						<span
							class="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-0.5 text-slate-400 lg:block"
						>
							<UiIcon name="chevronRight" size={16} />
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- Honest positioning -->
	<section class="grid grid-cols-1 gap-6 pb-14 lg:grid-cols-2">
		<div class="rounded-xl border border-slate-200 bg-white p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="verified" size={20} class="text-emerald-600" />
				<h2 class="font-display text-base font-bold text-slate-900">What ChainGuard establishes</h2>
			</div>
			<ul class="space-y-4">
				{#each establishes as item}
					<li class="flex gap-3">
						<span
							class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
						>
							<UiIcon name="check" size={14} />
						</span>
						<div>
							<p class="text-sm font-semibold text-slate-900">{item.title}</p>
							<p class="text-sm text-slate-600">{item.text}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<div class="rounded-xl border border-amber-200 bg-amber-50 p-6">
			<div class="mb-4 flex items-center gap-2">
				<UiIcon name="info" size={20} class="text-amber-600" />
				<h2 class="font-display text-base font-bold text-amber-900">Important limitations</h2>
			</div>
			<p class="mb-3 text-sm text-amber-800">
				A cryptographic fingerprint proves that two files are the same. It cannot answer every
				question about a piece of media.
			</p>
			<ul class="space-y-2">
				{#each limitations as limitation}
					<li class="flex gap-2 text-sm text-amber-900">
						<UiIcon name="doNotDisturb" size={16} class="text-amber-500" />
						{limitation}
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="mb-14 rounded-xl bg-slate-900 px-6 py-10 text-center sm:px-10">
		<h2 class="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
			Try the evidence lifecycle
		</h2>
		<p class="mx-auto mt-2 max-w-xl text-sm text-slate-300">
			Register a synthetic file, inspect its fingerprint, verify it, and open the plain-language
			report. The full sequence takes under a minute.
		</p>
		<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
			<a
				href="/evidence/new"
				class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
			>
				<UiIcon name="add" size={18} />
				Register Evidence
			</a>
			<a
				href="/evidence"
				class="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
			>
				<UiIcon name="evidence" size={18} />
				View Registered Evidence
			</a>
		</div>
	</section>
</div>
