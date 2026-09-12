<script lang="ts">
	import UiIcon from './UiIcon.svelte';

	type Props = {
		label?: string;
	};

	let { label = 'Loading…' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
	<UiIcon name="spinner" size={28} class="animate-spin text-slate-400" />
	<p class="text-sm text-slate-600">{label}</p>
</div>
