<script lang="ts">
	type Tone = 'verified' | 'failed' | 'pending' | 'neutral' | 'accent';

	type Props = {
		tone?: Tone;
		label: string;
		pulse?: boolean;
	};

	let { tone = 'neutral', label, pulse = false }: Props = $props();

	const tones: Record<Tone, string> = {
		verified: 'border-emerald-200 bg-emerald-50 text-emerald-700',
		failed: 'border-rose-200 bg-rose-50 text-rose-700',
		pending: 'border-amber-200 bg-amber-50 text-amber-700',
		neutral: 'border-slate-200 bg-slate-100 text-slate-600',
		accent: 'border-blue-200 bg-blue-50 text-blue-700'
	};

	const dots: Record<Tone, string> = {
		verified: 'bg-emerald-500',
		failed: 'bg-rose-500',
		pending: 'bg-amber-500',
		neutral: 'bg-slate-400',
		accent: 'bg-blue-500'
	};
</script>

<span
	class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase {tones[
		tone
	]}"
>
	<span class="h-1.5 w-1.5 rounded-full {dots[tone]} {pulse ? 'animate-pulse' : ''}"></span>
	{label}
</span>
