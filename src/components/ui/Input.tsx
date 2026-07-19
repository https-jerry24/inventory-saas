import { InputHTMLAttributes } from 'react'

export default function Input(
  props: InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
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
        placeholder:text-slate-400
        focus:border-emerald-500
        focus:ring-2
        focus:ring-emerald-500/20
        ${props.className ?? ''}
      `}
    />
  )
}