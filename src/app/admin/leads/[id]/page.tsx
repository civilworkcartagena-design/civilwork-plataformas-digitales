'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VentureLogo } from '@/components/branding/venture-logo';
import { createRecommendation } from '@/lib/recommendation-engine';
import type { Lead } from '@/types/venture';
import styles from '@/styles/venture.module.css';
const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n);
export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>();
  useEffect(() => {
    void fetch(`/api/venture/leads/${encodeURIComponent(id)}`)
      .then((response) => (response.ok ? (response.json() as Promise<Lead>) : null))
      .then(setLead);
  }, [id]);
  if (lead === undefined) return <main className={styles.admin}>Cargando…</main>;
  if (lead === null)
    return (
      <main className={styles.admin}>
        <p>Lead no encontrado.</p>
        <Link href='/admin/leads'>Volver</Link>
      </main>
    );
  const result = createRecommendation(lead.answers);
  return (
    <main className={styles.admin}>
      <header className={styles.adminHeader}>
        <VentureLogo />
        <Link className={styles.secondary} href='/admin/leads'>
          ← TODOS LOS LEADS
        </Link>
      </header>
      <div className={styles.adminTitle}>
        <p className={styles.kicker}>EXPEDIENTE · {lead.status}</p>
        <h1>{lead.company}</h1>
        <p>
          {lead.contactName} · {lead.position} · {lead.email} · {lead.phone}
        </p>
      </div>
      <div className={styles.priorityGrid}>
        <article>
          <span>01</span>
          <h3>Madurez digital</h3>
          <p>{lead.digitalScore}/100</p>
        </article>
        <article>
          <span>02</span>
          <h3>Plan recomendado</h3>
          <p>{lead.recommendedPlan}</p>
        </article>
        <article>
          <span>03</span>
          <h3>Inversión</h3>
          <p>
            {cop(lead.estimatedInvestmentMin)} — {cop(lead.estimatedInvestmentMax)}
          </p>
        </article>
        <article>
          <span>04</span>
          <h3>Plazo</h3>
          <p>{result.timelineWeeks} semanas</p>
        </article>
      </div>
      <section className={styles.resultSection}>
        <p className={styles.kicker}>RECOMENDACIONES</p>
        <div className={styles.moduleGrid}>
          {result.modules.map((m) => (
            <article key={m.id}>
              <h3>{m.title}</h3>
              <p>{m.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.resultSection}>
        <p className={styles.kicker}>RESPUESTAS</p>
        <table className={styles.adminTable}>
          <tbody>
            {Object.entries(lead.answers).map(([key, value]) => (
              <tr key={key}>
                <td>
                  <strong>{key}</strong>
                </td>
                <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className={styles.resultSection}>
        <p className={styles.kicker}>ATRIBUCIÓN</p>
        <pre>{JSON.stringify(lead.attribution, null, 2)}</pre>
      </section>
      <section className={styles.resultSection}>
        <p className={styles.kicker}>ACTIVIDAD</p>
        <div className={styles.empty}>
          Espacio preparado para llamadas, emails, reuniones y WhatsApp.
        </div>
      </section>
    </main>
  );
}
