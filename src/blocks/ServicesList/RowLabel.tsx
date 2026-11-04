'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ title?: string; services?: string[] }>()
  const count = data?.data?.services?.length || 0

  return (
    <div>
      {data?.data?.title || `Group ${(data.rowNumber ?? 0) + 1}`}
      {count > 0 && ` (${count})`}
    </div>
  )
}
