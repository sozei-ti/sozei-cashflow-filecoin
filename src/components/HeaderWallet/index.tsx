import styles from './styles.module.scss'
import { CgMenuBoxed } from 'react-icons/cg'
import Link from 'next/link'
import { ConnectWallet } from "@thirdweb-dev/react"

export function HeaderWallet(){

  return (
    <header className={styles.headerContainer}>   
      <div className={styles.headerContent}>
        <div className={styles.leftContent}>
          <CgMenuBoxed size={25} color="white" />
          <Link href="/">
            <a>
              <h2>CashFlow - Filecoin</h2>
            </a>
          </Link>
        </div>
        <div className={styles.rightContent}>
          <div className={styles.btn}>
            <ConnectWallet accentColor="#10FF8F"/>
          </div>
        </div>
      </div>
    </header>
  )
}