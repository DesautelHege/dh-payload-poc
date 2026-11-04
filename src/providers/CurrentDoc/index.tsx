'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type CurrentDoc = {
  collection: 'pages' | 'posts' | 'projects' | 'team'
  id: number | string
}

type ContextType = {
  doc: CurrentDoc | null
  setDoc: (doc: CurrentDoc | null) => void
}

const Context = createContext<ContextType>({ doc: null, setDoc: () => {} })

// Tells the admin bar which document the visitor is looking at, so editors get an "Edit" link
export const CurrentDocProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doc, setDoc] = useState<CurrentDoc | null>(null)

  return <Context value={{ doc, setDoc }}>{children}</Context>
}

export const useCurrentDoc = () => useContext(Context)

export const SetCurrentDoc: React.FC<CurrentDoc> = ({ collection, id }) => {
  const { setDoc } = useCurrentDoc()

  useEffect(() => {
    setDoc({ collection, id })
    return () => setDoc(null)
  }, [collection, id, setDoc])

  return null
}
