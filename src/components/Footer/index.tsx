import styles from './styles.module.scss';
import Image from 'next/image';
import logo from '../../../public/images/sozei.png';
import Link from 'next/link';

export function Footer(){

  return (
    <footer className={styles.footerContainer}>
      <hr/>
      <div className={styles.linksContainer}>
        <Link href="/">
          <a><p>CashFlow - Filecoin</p></a>
        </Link>
      </div>
      <div className={styles.rightsContainer}>
        <p>Developed by Sozei. All rights reserved 2022-2023</p>
        <Image src={logo} alt="Sozei Logo" />
      </div>
    </footer>
  )
}