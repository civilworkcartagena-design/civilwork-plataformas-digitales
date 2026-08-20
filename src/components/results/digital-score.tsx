'use client';
import { motion } from 'motion/react';
import styles from '@/styles/venture.module.css';
export function DigitalScore({
  score,
  categories
}: {
  score: number;
  categories: Record<string, number>;
}) {
  return (
    <section className={styles.scoreSection}>
      <div className={styles.scoreHero}>
        <p>MADUREZ DIGITAL</p>
        <strong>
          {score}
          <span>/ 100</span>
        </strong>
        <small>
          {score < 40
            ? 'Operación fragmentada'
            : score < 65
              ? 'Base en evolución'
              : score < 80
                ? 'Operación conectada'
                : 'Infraestructura avanzada'}
        </small>
      </div>
      <div className={styles.scoreBars}>
        {Object.entries(categories).map(([name, value]) => (
          <div key={name}>
            <p>
              <span>{name}</span>
              <b>{value}</b>
            </p>
            <i>
              <motion.span
                initial={{ width: 0 }}
                whileInView={{ width: `${value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </i>
          </div>
        ))}
      </div>
    </section>
  );
}
