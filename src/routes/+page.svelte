<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/overview', { replaceState: true });
	});
</script>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	<p class="text-sm text-slate-500">Redirecting to the overview page…</p>
</div>
