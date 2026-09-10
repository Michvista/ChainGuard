<script lang="ts">
	type Props = {
		label?: string;
	};

	let { label = 'Loading…' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
	<span class="material-symbols-outlined animate-spin text-[28px] text-slate-400"
		>progress_activity</span
	>
	<p class="text-sm text-slate-600">{label}</p>
</div>
