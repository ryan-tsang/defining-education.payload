'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  // Shared by Header navItems and subjectItems — both rows carry a `link.label`.
  const data = useRowLabel<{ link?: { label?: string | null } }>()

  const label = data?.data?.link?.label
    ? `${data.rowNumber !== undefined ? `${data.rowNumber + 1}. ` : ''}${data.data.link.label}`
    : 'Row'

  return <div>{label}</div>
}
