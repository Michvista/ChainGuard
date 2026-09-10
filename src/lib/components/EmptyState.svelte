<script lang="ts">
	type Props = {
		icon?: string;
		title?: string;
		text?: string;
		children?: import('svelte').Snippet;
	};

	let { icon = 'inbox', title = 'Nothing here yet', text = '', children }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
	<span class="material-symbols-outlined text-[34px] text-slate-300">{icon}</span>
	<h3 class="font-display text-sm font-bold text-slate-700">{title}</h3>
	{#if text}<p class="max-w-md text-sm text-slate-500">{text}</p>{/if}
	{#if children}{@render children()}{/if}
</div>
