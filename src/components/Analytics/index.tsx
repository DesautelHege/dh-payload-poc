import Script from 'next/script'
import React from 'react'

import { getSiteSettings } from '@/utilities/mergeOpenGraph'

// Loads Google Analytics only when a measurement ID is set in Site settings
export async function Analytics() {
  const settings = await getSiteSettings()
  const id = settings?.gaMeasurementId

  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  )
}
