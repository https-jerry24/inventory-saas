interface Props {
  children: React.ReactNode
  color?:
    | 'green'
    | 'blue'
    | 'red'
    | 'yellow'
    | 'gray'
}

export default function Badge({
  children,
  color = 'gray',
}: Props) {

  const styles = {
    green:
      'bg-emerald-100 text-emerald-700',

    blue:
      'bg-blue-100 text-blue-700',

    red:
      'bg-red-100 text-red-700',

    yellow:
      'bg-yellow-100 text-yellow-700',

    gray:
      'bg-slate-100 text-slate-700',
  }

  return (
    <span
      className={`
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        ${styles[color]}
      `}
    >
      {children}
    </span>
  )
}