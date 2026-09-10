<script lang="ts">
	import { api } from '$lib/api/client';

	let status = $state<'checking' | 'online' | 'offline'>('checking');

	$effect(() => {
		let cancelled = false;
		status = 'checking';
		api
			.listEvidence()
			.then(() => {
				if (!cancelled) status = 'online';
			})
			.catch(() => {
				if (!cancelled) status = 'offline';
			});
		return () => {
			cancelled = true;
		};
	});
</script>

<span
	class="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium {status ===
	'online'
		? 'border-emerald-200 bg-emerald-50 text-emerald-700'
		: status === 'offline'
			? 'border-rose-200 bg-rose-50 text-rose-700'
			: 'border-amber-200 bg-amber-50 text-amber-700'}"
>
	{#if status === 'online'}
		<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
		<span>Evidence API online</span>
	{:else if status === 'offline'}
		<span class="h-2 w-2 rounded-full bg-rose-500"></span>
		<span>Evidence API unreachable</span>
	{:else}
		<span class="h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
		<span>Checking API…</span>
	{/if}
</span>
