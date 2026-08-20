import styles from '@/styles/venture.module.css';
export function ProjectTimeline({ weeks }: { weeks: number }) {
  const phases = [
    ['DISCOVERY', 'Objetivos, procesos y datos'],
    ['ARQUITECTURA', 'Modelo operativo y técnico'],
    ['IMPLEMENTACIÓN', 'CRM y bases de datos'],
    ['AUTOMATIZACIÓN', 'Flujos y comunicaciones'],
    ['INTEGRACIÓN', 'Canales y herramientas'],
    ['LANZAMIENTO', 'Pruebas y capacitación']
  ];
  return (
    <div className={styles.timeline}>
      {phases.map(([title, desc], i) => {
        const start = Math.max(1, Math.round((i / 6) * weeks) + 1);
        return (
          <div key={title}>
            <span>SEMANA {start}</span>
            <i />
            <strong>{title}</strong>
            <small>{desc}</small>
          </div>
        );
      })}
    </div>
  );
}
