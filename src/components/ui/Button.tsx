'use client'

import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: Props) {

  const styles = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white',

    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-900',

    danger:
      'bg-red-600 hover:bg-red-700 text-white',
  }

  return (
    <button
      {...props}
      className={`
        px-5
        py-2.5
        rounded-xl
        font-semibold
        transition
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${styles[variant]}
        ${className}
      `}
    />
  )
}