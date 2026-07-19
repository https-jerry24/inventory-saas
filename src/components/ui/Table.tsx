interface Props {
  children: React.ReactNode
}

export default function Table({
  children,
}: Props) {

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      <table className="w-full text-sm">

        {children}

      </table>

    </div>
  )
}