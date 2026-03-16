'use client'

import type { ButtonHTMLAttributes } from 'react'

interface ScrollToVveFormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  targetId?: string
}

export function ScrollToVveFormButton({
  targetId = 'vve-contact-form',
  onClick,
  type = 'button',
  ...props
}: ScrollToVveFormButtonProps) {
  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] = (event) => {
    onClick?.(event)
    if (event.defaultPrevented) {
      return
    }

    const target = document.getElementById(targetId)
    if (!target) {
      return
    }

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return <button type={type} onClick={handleClick} {...props} />
}
