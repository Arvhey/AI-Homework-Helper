import React from 'react'
import { cn } from './Glass'

const Skeleton = ({ className }) => {
  return (
    <div className={cn(
      "bg-white/5 animate-pulse rounded-lg",
      className
    )} />
  )
}

export default Skeleton
