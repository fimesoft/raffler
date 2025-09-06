import styles from './CircularProgress.module.scss'

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

export const CircularProgress = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = '#ff9800' 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={styles.circularProgress} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.progressSvg}>
        <circle
          className={styles.progressBackground}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={styles.progressBar}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          style={{
            stroke: color,
            strokeDasharray,
            strokeDashoffset,
            transformOrigin: '50% 50%',
            transform: 'rotate(-90deg)'
          }}
        />
      </svg>
      <div className={styles.progressText}>
        <span className={styles.progressNumber}>{Math.round(percentage)}%</span>
      </div>
    </div>
  )
}

export default CircularProgress