interface Props {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-6">

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          {title}
        </h1>

        {subtitle && (
          <p className="text-slate-500 mt-1">
            {subtitle}
          </p>
        )}

      </div>

      {action}

    </div>
  )
}