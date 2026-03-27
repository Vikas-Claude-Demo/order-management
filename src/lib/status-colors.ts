export interface StatusColorConfig {
  badge: string
  dot: string
  headerBg: string
  headerText: string
  cardBorder: string
  cardHoverBg: string
  dropBg: string
  countBg: string
  toggleBg: string
  toggleActive: string
  accentBorder: string
  swatch: string
}

export const COLOR_PRESETS: Record<string, StatusColorConfig> = {
  slate: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    headerBg: "bg-gradient-to-r from-slate-100 to-slate-50",
    headerText: "text-slate-700",
    cardBorder: "border-l-slate-400",
    cardHoverBg: "hover:bg-slate-50/80",
    dropBg: "bg-slate-50",
    countBg: "bg-slate-200 text-slate-600",
    toggleBg: "bg-slate-100 text-slate-600 border-slate-200",
    toggleActive: "bg-slate-500 text-white border-slate-500",
    accentBorder: "border-l-4 border-l-slate-400",
    swatch: "bg-slate-400",
  },
  blue: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    headerBg: "bg-gradient-to-r from-blue-100 to-blue-50",
    headerText: "text-blue-700",
    cardBorder: "border-l-blue-500",
    cardHoverBg: "hover:bg-blue-50/50",
    dropBg: "bg-blue-50",
    countBg: "bg-blue-100 text-blue-600",
    toggleBg: "bg-blue-50 text-blue-600 border-blue-200",
    toggleActive: "bg-blue-500 text-white border-blue-500",
    accentBorder: "border-l-4 border-l-blue-500",
    swatch: "bg-blue-500",
  },
  amber: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    headerBg: "bg-gradient-to-r from-amber-100 to-amber-50",
    headerText: "text-amber-700",
    cardBorder: "border-l-amber-500",
    cardHoverBg: "hover:bg-amber-50/50",
    dropBg: "bg-amber-50",
    countBg: "bg-amber-100 text-amber-600",
    toggleBg: "bg-amber-50 text-amber-600 border-amber-200",
    toggleActive: "bg-amber-500 text-white border-amber-500",
    accentBorder: "border-l-4 border-l-amber-500",
    swatch: "bg-amber-500",
  },
  emerald: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    headerBg: "bg-gradient-to-r from-emerald-100 to-emerald-50",
    headerText: "text-emerald-700",
    cardBorder: "border-l-emerald-500",
    cardHoverBg: "hover:bg-emerald-50/50",
    dropBg: "bg-emerald-50",
    countBg: "bg-emerald-100 text-emerald-600",
    toggleBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    toggleActive: "bg-emerald-500 text-white border-emerald-500",
    accentBorder: "border-l-4 border-l-emerald-500",
    swatch: "bg-emerald-500",
  },
  rose: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    headerBg: "bg-gradient-to-r from-rose-100 to-rose-50",
    headerText: "text-rose-700",
    cardBorder: "border-l-rose-500",
    cardHoverBg: "hover:bg-rose-50/50",
    dropBg: "bg-rose-50",
    countBg: "bg-rose-100 text-rose-600",
    toggleBg: "bg-rose-50 text-rose-600 border-rose-200",
    toggleActive: "bg-rose-500 text-white border-rose-500",
    accentBorder: "border-l-4 border-l-rose-500",
    swatch: "bg-rose-500",
  },
  violet: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    headerBg: "bg-gradient-to-r from-violet-100 to-violet-50",
    headerText: "text-violet-700",
    cardBorder: "border-l-violet-500",
    cardHoverBg: "hover:bg-violet-50/50",
    dropBg: "bg-violet-50",
    countBg: "bg-violet-100 text-violet-600",
    toggleBg: "bg-violet-50 text-violet-600 border-violet-200",
    toggleActive: "bg-violet-500 text-white border-violet-500",
    accentBorder: "border-l-4 border-l-violet-500",
    swatch: "bg-violet-500",
  },
  indigo: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
    headerBg: "bg-gradient-to-r from-indigo-100 to-indigo-50",
    headerText: "text-indigo-700",
    cardBorder: "border-l-indigo-500",
    cardHoverBg: "hover:bg-indigo-50/50",
    dropBg: "bg-indigo-50",
    countBg: "bg-indigo-100 text-indigo-600",
    toggleBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
    toggleActive: "bg-indigo-500 text-white border-indigo-500",
    accentBorder: "border-l-4 border-l-indigo-500",
    swatch: "bg-indigo-500",
  },
  cyan: {
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    dot: "bg-cyan-500",
    headerBg: "bg-gradient-to-r from-cyan-100 to-cyan-50",
    headerText: "text-cyan-700",
    cardBorder: "border-l-cyan-500",
    cardHoverBg: "hover:bg-cyan-50/50",
    dropBg: "bg-cyan-50",
    countBg: "bg-cyan-100 text-cyan-600",
    toggleBg: "bg-cyan-50 text-cyan-600 border-cyan-200",
    toggleActive: "bg-cyan-500 text-white border-cyan-500",
    accentBorder: "border-l-4 border-l-cyan-500",
    swatch: "bg-cyan-500",
  },
  pink: {
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    dot: "bg-pink-500",
    headerBg: "bg-gradient-to-r from-pink-100 to-pink-50",
    headerText: "text-pink-700",
    cardBorder: "border-l-pink-500",
    cardHoverBg: "hover:bg-pink-50/50",
    dropBg: "bg-pink-50",
    countBg: "bg-pink-100 text-pink-600",
    toggleBg: "bg-pink-50 text-pink-600 border-pink-200",
    toggleActive: "bg-pink-500 text-white border-pink-500",
    accentBorder: "border-l-4 border-l-pink-500",
    swatch: "bg-pink-500",
  },
  orange: {
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    headerBg: "bg-gradient-to-r from-orange-100 to-orange-50",
    headerText: "text-orange-700",
    cardBorder: "border-l-orange-500",
    cardHoverBg: "hover:bg-orange-50/50",
    dropBg: "bg-orange-50",
    countBg: "bg-orange-100 text-orange-600",
    toggleBg: "bg-orange-50 text-orange-600 border-orange-200",
    toggleActive: "bg-orange-500 text-white border-orange-500",
    accentBorder: "border-l-4 border-l-orange-500",
    swatch: "bg-orange-500",
  },
}

export const COLOR_OPTIONS = Object.keys(COLOR_PRESETS)

export function getColorConfig(color: string): StatusColorConfig {
  return COLOR_PRESETS[color] ?? COLOR_PRESETS.slate
}

export interface StatusDef {
  key: string
  label: string
  color: string
  sortOrder: number
  isDefault: boolean
}
