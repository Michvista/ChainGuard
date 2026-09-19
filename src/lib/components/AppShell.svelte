<script lang="ts">
	import UiIcon from './UiIcon.svelte';

	let { children } = $props();
</script>

<header class="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
		<a href="/overview" class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm"
			>
				<UiIcon name="shield" size={20} />
			</div>
			<div class="flex items-center justify-center">
				<span class="text-base font-bold tracking-tight text-slate-900">ChainGuard</span>
			</div>
		</a>
	</div>
</header>

<main class="flex-1 bg-slate-100">
	{@render children()}
</main>

<footer class="border-t border-slate-200 bg-white">
	<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
		<div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
			<div class="flex items-center gap-3">
				<span class="font-semibold text-slate-700">ChainGuard</span>
				<span class="text-slate-300">|</span>
				<span class="font-mono">ICSC 2026 · Track H</span>
				<span class="hidden text-slate-300 sm:inline">|</span>
				<span class="hidden sm:inline"
					>Digital evidence integrity and chain-of-custody prototype</span
				>
			</div>
			<span>Proves that registered evidence has not been changed.</span>
		</div>
	</div>
</footer>
