'use client';
import { motion } from 'motion/react';
import type { DiagnosticResult } from '@/types/venture';
import styles from '@/styles/venture.module.css';
const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n);
export function InvestmentSummary({ result }: { result: DiagnosticResult }) {
  return (
    <section className={styles.investment}>
      <p className={styles.kicker}>INVERSIÓN ESTIMADA</p>
      <div className={styles.investmentGrid}>
        <div>
          <span>Implementación inicial</span>
          <motion.strong
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {cop(result.setupTotal)}
          </motion.strong>
        </div>
        {result.monthlyTotal > 0 && (
          <div>
            <span>Infraestructura / operación mensual</span>
            <strong>
              {cop(result.monthlyTotal)} <small>/ mes</small>
            </strong>
          </div>
        )}
      </div>
      <p className={styles.range}>
        Rango estimado del proyecto{' '}
        <strong>
          {cop(result.investmentMin)} — {cop(result.investmentMax)}
        </strong>
      </p>
      <div className={styles.breakdown}>
        {result.quoteItems.map((item) => (
          <div key={item.id}>
            <span>{item.label}</span>
            <b>{cop(item.setup)}</b>
          </div>
        ))}
        <div className={styles.total}>
          <span>TOTAL ESTIMADO</span>
          <b>{cop(result.setupTotal)}</b>
        </div>
      </div>
      <small className={styles.disclaimer}>
        Estimación preliminar sujeta a validación técnica y definición final del alcance. Licencias
        de terceros pueden variar.
      </small>
    </section>
  );
}
