type RecordStatusBadgesProps = {
  activeStatus?: boolean
  approved?: boolean
  rejected?: boolean
}

export default function RecordStatusBadges({
  activeStatus,
  approved,
  rejected,
}: RecordStatusBadgesProps) {
  const isActive = activeStatus ?? true

  return (
    <div className="mt-1 flex flex-wrap gap-2">
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          rejected
            ? 'bg-red-100 text-red-700'
            : approved
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
        }`}
      >
        {rejected ? 'Rejected' : approved ? 'Approved' : 'Pending'}
      </span>
    </div>
  )
}
