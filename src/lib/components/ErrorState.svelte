<script lang="ts">
	import UiIcon from './UiIcon.svelte';

	type Props = {
		title?: string;
		detail?: string;
		retry?: (() => void) | null;
	};

	let { title = 'Something went wrong', detail = '', retry = null }: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-6 py-10 text-center"
>
	<UiIcon name="alert" size={32} class="text-rose-500" />
	<h3 class="font-display text-sm font-bold text-rose-900">{title}</h3>
	{#if detail}<p class="max-w-md text-sm text-rose-700">{detail}</p>{/if}
	{#if retry}
		<button
			type="button"
			onclick={retry}
			class="mt-1 inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
		>
			<UiIcon name="refresh" size={15} />
			Try again
		</button>
	{/if}
</div>
