<script lang="ts">
	import { page } from '$app/state';
	import UiIcon from './UiIcon.svelte';
	import type { IconName } from './icons';

	const links: { href: string; label: string; icon: IconName }[] = [
		{ href: '/', label: 'Overview', icon: 'home' },
		{ href: '/evidence', label: 'Evidence', icon: 'evidence' },
		{ href: '/evidence/new', label: 'Register Evidence', icon: 'upload' }
	];

	let { children } = $props();

	let menuOpen = $state(false);

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path.startsWith(href);
	}
</script>

<header class="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
		<div class="flex min-w-0 items-center gap-6">
			<a href="/" class="flex shrink-0 items-center gap-3">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm"
				>
					<UiIcon name="shield" size={20} />
				</div>
				<div class="flex flex-col leading-tight">
					<span class="text-base font-bold tracking-tight text-slate-900">ChainGuard</span>
					<span
						class="hidden text-[10px] font-semibold tracking-widest text-slate-500 uppercase sm:block"
						>Digital Evidence Integrity</span
					>
				</div>
			</a>
			<nav class="hidden items-center gap-1 md:flex">
				{#each links as link}
					<a
						href={link.href}
						class="inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors {isActive(
							link.href
						)
							? 'bg-slate-900 text-white'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
					>
						<UiIcon name={link.icon} size={18} />
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
		<div class="flex shrink-0 items-center gap-3">
			<button
				type="button"
				aria-label="Toggle navigation"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
				class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 md:hidden"
			>
				<UiIcon name={menuOpen ? 'close' : 'menu'} size={18} />
			</button>
		</div>
	</div>

	{#if menuOpen}
		<div class="border-t border-slate-200 bg-white md:hidden">
			<nav class="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
				{#each links as link}
					<a
						href={link.href}
						onclick={() => (menuOpen = false)}
						class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium {isActive(
							link.href
						)
							? 'bg-slate-900 text-white'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
					>
						<UiIcon name={link.icon} size={18} />
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
</header>

<main class="flex-1">
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
