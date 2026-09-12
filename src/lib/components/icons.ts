import {
	Add01Icon,
	Alert01Icon,
	Alert02Icon,
	Archive01Icon,
	ArrowLeft01Icon,
	ArrowRight01Icon,
	ArrowUpRight01Icon,
	BadgeCheckIcon,
	Cancel01Icon,
	CancelCircleIcon,
	CheckIcon,
	ChevronRightIcon,
	Copy01Icon,
	DocumentValidationIcon,
	Download01Icon,
	EyeIcon,
	File01Icon,
	FileBlockIcon,
	FileSearchIcon,
	FileUploadIcon,
	FingerPrintIcon,
	Flag01Icon,
	Folder01Icon,
	GitBranchIcon,
	HardDriveIcon,
	Home01Icon,
	InboxIcon,
	InformationCircleIcon,
	LegalDocument01Icon,
	Loading01Icon,
	LockKeyIcon,
	Menu01Icon,
	NoteIcon,
	RefreshIcon,
	RepeatIcon,
	Search01Icon,
	Shield01Icon,
	TestTubeIcon,
	TimelineIcon,
	WifiOff01Icon
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/svelte';

export type IconName =
	| 'shield'
	| 'home'
	| 'evidence'
	| 'upload'
	| 'search'
	| 'check'
	| 'copy'
	| 'spinner'
	| 'alert'
	| 'warning'
	| 'refresh'
	| 'inbox'
	| 'timeline'
	| 'info'
	| 'metadata'
	| 'report'
	| 'file'
	| 'verify'
	| 'transfer'
	| 'download'
	| 'eye'
	| 'note'
	| 'wifiOff'
	| 'verified'
	| 'fingerprint'
	| 'mismatch'
	| 'flag'
	| 'chevronRight'
	| 'arrowBack'
	| 'arrowForward'
	| 'openNew'
	| 'add'
	| 'lock'
	| 'science'
	| 'hardDrive'
	| 'menu'
	| 'close'
	| 'doNotDisturb'
	| 'archive'
	| 'swap';

export const icons: Record<IconName, IconSvgElement> = {
	shield: Shield01Icon,
	home: Home01Icon,
	evidence: Folder01Icon,
	upload: FileUploadIcon,
	search: Search01Icon,
	check: CheckIcon,
	copy: Copy01Icon,
	spinner: Loading01Icon,
	alert: Alert01Icon,
	warning: Alert02Icon,
	refresh: RefreshIcon,
	inbox: InboxIcon,
	timeline: TimelineIcon,
	info: InformationCircleIcon,
	metadata: FileSearchIcon,
	report: LegalDocument01Icon,
	file: File01Icon,
	verify: DocumentValidationIcon,
	transfer: RepeatIcon,
	download: Download01Icon,
	eye: EyeIcon,
	note: NoteIcon,
	wifiOff: WifiOff01Icon,
	verified: BadgeCheckIcon,
	fingerprint: FingerPrintIcon,
	mismatch: FileBlockIcon,
	flag: Flag01Icon,
	chevronRight: ChevronRightIcon,
	arrowBack: ArrowLeft01Icon,
	arrowForward: ArrowRight01Icon,
	openNew: ArrowUpRight01Icon,
	add: Add01Icon,
	lock: LockKeyIcon,
	science: TestTubeIcon,
	hardDrive: HardDriveIcon,
	menu: Menu01Icon,
	close: Cancel01Icon,
	doNotDisturb: CancelCircleIcon,
	archive: Archive01Icon,
	swap: RepeatIcon
};
