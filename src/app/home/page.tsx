import HeroCarousel from '@/components/home/HeroCarousel'
import HowItWorks from '@/components/home/HowItWorks'
import LatestRaffles from '@/components/home/LatestRaffles'
import Footer from '@/components/home/Footer'
import styles from './home.module.scss'

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      <HeroCarousel />
      <HowItWorks />
      <LatestRaffles />
      <Footer />
    </div>
  )
}
