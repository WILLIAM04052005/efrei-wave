interface BadgeProps {
  label: string
  description?: string
}

function Badge({ label, description }: BadgeProps) {
  return (
    <span className="badge" title={description}>
      <span aria-hidden={description ? true : undefined}>{label}</span>
      {description && <span className="visually-hidden">{description}</span>}
    </span>
  )
}

export default Badge