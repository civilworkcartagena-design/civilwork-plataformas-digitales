'use client';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { VentureLogo } from '@/components/branding/venture-logo';
import type { Lead } from '@/types/venture';
import styles from '@/styles/venture.module.css';
const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    notation: 'compact'
  }).format(n);
export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Todos');
  useEffect(() => {
    void fetch('/api/venture/leads')
      .then((response) => {
        if (!response.ok) throw new Error('No fue posible cargar los leads');
        return response.json() as Promise<Lead[]>;
      })
      .then(setLeads);
  }, []);
  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (status === 'Todos' || l.status === status) &&
          `${l.company} ${l.contactName} ${l.email}`.toLowerCase().includes(query.toLowerCase())
      ),
    [leads, query, status]
  );
  return (
    <main className={styles.admin}>
      <header className={styles.adminHeader}>
        <VentureLogo />
        <Link className={styles.secondary} href='/venture'>
          VER DIAGNÓSTICO
        </Link>
      </header>
      <div className={styles.adminTitle}>
        <p className={styles.kicker}>VENTURE · PIPELINE</p>
        <h1>Leads de diagnóstico</h1>
        <p>{leads.length} registros centralizados en Venture.</p>
      </div>
      <div className={styles.adminControls}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: 15, color: '#666' }} />
          <input
            aria-label='Buscar leads'
            style={{ paddingLeft: 38 }}
            placeholder='Buscar empresa, contacto o email'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {[
            'Todos',
            'Nuevo',
            'Contactado',
            'Diagnóstico',
            'Propuesta',
            'Negociación',
            'Ganado',
            'Perdido'
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {filtered.length ? (
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>EMPRESA</th>
              <th>CONTACTO</th>
              <th>FECHA</th>
              <th>SECTOR</th>
              <th>SCORE</th>
              <th>PROYECTO</th>
              <th>INVERSIÓN</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <Link
                    aria-label={`Ver detalle de ${lead.company}`}
                    href={`/admin/leads/${lead.id}`}
                  >
                    <strong>{lead.company}</strong>
                  </Link>
                </td>
                <td>
                  {lead.contactName}
                  <br />
                  {lead.email}
                </td>
                <td>{new Date(lead.createdAt).toLocaleDateString('es-CO')}</td>
                <td>{lead.industry}</td>
                <td>
                  <strong>{lead.digitalScore}/100</strong>
                </td>
                <td>{lead.recommendedPlan}</td>
                <td>
                  {cop(lead.estimatedInvestmentMin)} – {cop(lead.estimatedInvestmentMax)}
                </td>
                <td>
                  <span className={styles.status}>{lead.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.empty}>Aún no hay diagnósticos que coincidan con los filtros.</div>
      )}
    </main>
  );
}
