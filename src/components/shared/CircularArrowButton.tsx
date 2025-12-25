import styles from './CircularArrowButton.module.scss'

interface CircularArrowButtonProps {
  onClick?: () => void
}

export default function CircularArrowButton({ onClick }: CircularArrowButtonProps) {
  return (
    <button className={styles.circularButton} onClick={onClick}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: 'rotate(-45deg)' }}
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  )
}
