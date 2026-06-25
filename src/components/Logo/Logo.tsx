import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="凝皓教育 Defining Education"
      width={1073}
      height={409}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('h-11 w-auto md:h-14', className)}
      src="/de-logo.png"
    />
  )
}
