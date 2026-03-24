import DesktopCafe from './DesktopCafe'
import MobilePortfolio from './MobilePortfolio'
import { useBreakpoint } from './hooks/useBreakpoint'

export default function App() {
  const { isMobile } = useBreakpoint()
  if (isMobile) return <MobilePortfolio />
  return <DesktopCafe />
}
