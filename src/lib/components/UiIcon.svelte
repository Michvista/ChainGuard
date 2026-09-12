<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { icons, type IconName } from './icons';

	type Props = {
		name: IconName;
		size?: number;
		color?: string;
		strokeWidth?: number;
		class?: string;
	};

	let { name, size = 18, color = 'currentColor', strokeWidth, class: className }: Props = $props();
</script>

<HugeiconsIcon icon={icons[name]} {size} {color} {strokeWidth} class={className} />
