'use client'

import styles from './Avatar.module.scss'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  // Extract initials from name
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'U'
    
    const names = fullName.trim().split(' ')
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase()
    }
    
    // Get first letter of first name and last name
    const firstInitial = names[0].charAt(0).toUpperCase()
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase()
    
    return `${firstInitial}${lastInitial}`
  }

  const initials = getInitials(name)

  return (
    <div className={`${styles.avatar} ${styles[size]} ${className}`}>
      <span className={styles.initials}>
        {initials}
      </span>
    </div>
  )
}