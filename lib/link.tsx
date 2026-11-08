'use client'
import React from 'react'
import NextLink from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
}

/**
 * Drop-in link used across the UI. Accepts a `to` prop (instead of `href`)
 * and delegates to the Next.js router.
 */
export default function Link({ to, ...rest }: LinkProps) {
  return <NextLink href={to} {...rest} />
}
