'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ heading?: string }>()

  return (
    <div>{data?.data?.heading || `Item ${String((data.rowNumber ?? 0) + 1).padStart(2, '0')}`}</div>
  )
}
