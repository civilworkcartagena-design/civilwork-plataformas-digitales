import styles from '@/styles/venture.module.css';
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className={styles.progressTrack} aria-label={`Progreso ${value}%`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
