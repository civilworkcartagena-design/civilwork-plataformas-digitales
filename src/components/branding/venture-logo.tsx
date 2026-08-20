import styles from '@/styles/venture.module.css';

export function VentureLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={styles.logo} aria-label='Venture Aceleradora Empresarial by Civil Work'>
      <span className={styles.logoMark}>V</span>
      <span>
        <strong>VENTURE</strong>
        {!compact && <small>ACELERADORA EMPRESARIAL</small>}
      </span>
    </div>
  );
}

export function CivilWorkLogo() {
  return (
    <div className={styles.civilLogo}>
      <span>by</span> <strong>CIVIL WORK</strong>
    </div>
  );
}
