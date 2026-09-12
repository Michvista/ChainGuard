<script lang="ts">
	import type { IconName } from './icons';
	import UiIcon from './UiIcon.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		icon?: IconName;
		title?: string;
		text?: string;
		children?: Snippet;
	};

	let { icon = 'inbox', title = 'Nothing here yet', text = '', children }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
	<UiIcon name={icon} size={34} class="text-slate-300" />
	<h3 class="font-display text-sm font-bold text-slate-700">{title}</h3>
	{#if text}<p class="max-w-md text-sm text-slate-500">{text}</p>{/if}
	{#if children}{@render children()}{/if}
</div>
