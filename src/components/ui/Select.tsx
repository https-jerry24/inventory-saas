import { SelectHTMLAttributes } from 'react'

export default function Select(
  props: SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={`
        w-full
        rounded-xl
        border
        border-slate-300
        bg-white
        px-4
        py-3
        text-slate-900
        focus:border-emerald-500
        focus:ring-2
        focus:ring-emerald-500/20
        ${props.className ?? ''}
      `}
    />
  )
}