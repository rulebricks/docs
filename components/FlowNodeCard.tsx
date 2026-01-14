import React from 'react'
import { IconGripVertical } from '@tabler/icons-react'

type ColorScheme =
  | 'red'
  | 'orange'
  | 'amber'
  | 'green'
  | 'sky'
  | 'cyan'
  | 'blue'
  | 'indigo'
  | 'fuchsia'
  | 'violet'
  | 'neutral'
  | 'slate'

interface FlowNodeCardProps {
  colorScheme: ColorScheme
  icon: React.ReactNode
  name: string
  description: string
}

const colorClasses: Record<
  ColorScheme,
  { bg: string; border: string; text: string; descText: string }
> = {
  red: {
    bg: 'bg-red-50/10 dark:bg-red-950/20',
    border: 'border-red-300 dark:border-red-800',
    text: 'text-red-900 dark:text-red-200',
    descText: 'text-red-800/50 dark:text-red-300/50',
  },
  orange: {
    bg: 'bg-orange-50/10 dark:bg-orange-950/20',
    border: 'border-orange-300 dark:border-orange-800',
    text: 'text-orange-900 dark:text-orange-200',
    descText: 'text-orange-800/50 dark:text-orange-300/50',
  },
  amber: {
    bg: 'bg-amber-50/10 dark:bg-amber-950/20',
    border: 'border-amber-300 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-200',
    descText: 'text-amber-800/50 dark:text-amber-300/50',
  },
  green: {
    bg: 'bg-green-100/10 dark:bg-green-950/20',
    border: 'border-green-300 dark:border-green-800',
    text: 'text-green-900 dark:text-green-200',
    descText: 'text-green-800/50 dark:text-green-300/50',
  },
  sky: {
    bg: 'bg-sky-100/10 dark:bg-sky-950/20',
    border: 'border-sky-300 dark:border-sky-800',
    text: 'text-sky-900 dark:text-sky-200',
    descText: 'text-sky-800/50 dark:text-sky-300/50',
  },
  cyan: {
    bg: 'bg-cyan-100/10 dark:bg-cyan-950/20',
    border: 'border-cyan-300 dark:border-cyan-800',
    text: 'text-cyan-900 dark:text-cyan-200',
    descText: 'text-cyan-800/50 dark:text-cyan-300/50',
  },
  blue: {
    bg: 'bg-blue-100/10 dark:bg-blue-950/20',
    border: 'border-blue-300 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-200',
    descText: 'text-blue-800/50 dark:text-blue-300/50',
  },
  indigo: {
    bg: 'bg-indigo-100/10 dark:bg-indigo-950/20',
    border: 'border-indigo-300 dark:border-indigo-800',
    text: 'text-indigo-900 dark:text-indigo-200',
    descText: 'text-indigo-800/50 dark:text-indigo-300/50',
  },
  fuchsia: {
    bg: 'bg-fuchsia-50/10 dark:bg-fuchsia-950/20',
    border: 'border-fuchsia-300 dark:border-fuchsia-800',
    text: 'text-fuchsia-900 dark:text-fuchsia-200',
    descText: 'text-fuchsia-800/50 dark:text-fuchsia-300/50',
  },
  violet: {
    bg: 'bg-violet-100/10 dark:bg-violet-950/20',
    border: 'border-violet-300 dark:border-violet-800',
    text: 'text-violet-900 dark:text-violet-200',
    descText: 'text-violet-800/50 dark:text-violet-300/50',
  },
  neutral: {
    bg: 'bg-neutral-100/10 dark:bg-neutral-900/20',
    border: 'border-neutral-400 dark:border-neutral-600',
    text: 'text-neutral-700 dark:text-neutral-300',
    descText: 'text-neutral-500/50 dark:text-neutral-400/50',
  },
  slate: {
    bg: 'bg-slate-100/10 dark:bg-slate-900/20',
    border: 'border-neutral-300 dark:border-slate-600',
    text: 'text-slate-700 dark:text-slate-300',
    descText: 'text-slate-600/50 dark:text-slate-400/50',
  },
}

export default function FlowNodeCard({
  colorScheme,
  icon,
  name,
  description,
}: FlowNodeCardProps) {
  const colors = colorClasses[colorScheme]

  return (
    <div
      className={`flex flex-col max-w-sm ${colors.bg} border ${colors.border} ${colors.text} p-2 px-2 my-4 font-semibold text-sm rounded shadow`}
    >
      <div className="flex items-center flex-row">
        <IconGripVertical className="w-3 h-4 shrink-0 opacity-50 mr-2 self-center" />
        <div className="flex flex-col">
          <span className="text-sm font-medium align-middle inline-flex">
            <span className="w-3 h-3 mr-1.5 self-center flex items-center justify-center">
              {icon}
            </span>
            {name}
          </span>
          <span className={`text-xs mt-0.5 font-medium ${colors.descText}`}>
            {description}
          </span>
        </div>
      </div>
    </div>
  )
}
