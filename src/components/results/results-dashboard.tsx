'use client';
import { ArrowRight, Calendar, Download, MessageCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import type { DiagnosticAnswers, DiagnosticResult } from '@/types/venture';
import { CivilWorkLogo, VentureLogo } from '../branding/venture-logo';
import { ArchitectureMap } from './architecture-map';
import { DigitalScore } from './digital-score';
import { InvestmentSummary } from './investment-summary';
import { ProjectTimeline } from './project-timeline';
import styles from '@/styles/venture.module.css';

export function ResultsDashboard({
  answers,
  result,
  onRestart
}: {
  answers: DiagnosticAnswers;
  result: DiagnosticResult;
  onRestart: () => void;
}) {
  const company = String(answers.companyName ?? 'tu empresa');
  const tools = Array.isArray(answers.tools) ? (answers.tools as string[]) : [];
  return (
    <main className={styles.results}>
      <header className={styles.resultsNav}>
        <VentureLogo />
        <CivilWorkLogo />
      </header>
      <section className={styles.resultHero}>
        <p className={styles.kicker}>PROPUESTA PRELIMINAR · {new Date().getFullYear()}</p>
        <h1>
          PROYECTO DE INFRAESTRUCTURA
          <br />
          EMPRESARIAL <em>DIGITAL</em>
        </h1>
        <p>
          Propuesta preliminar preparada para <strong>{company}</strong>
        </p>
        <div className={styles.planStamp}>
          <span>NIVEL RECOMENDADO</span>
          <strong>{result.plan}</strong>
          <small>Complejidad {result.complexity}</small>
        </div>
      </section>
      <div className={styles.resultsBody}>
        <DigitalScore score={result.score} categories={result.categoryScores} />
        <section className={styles.resultSection}>
          <p className={styles.kicker}>DIAGNÓSTICO</p>
          <h2>Detectamos {result.priorities.length} oportunidades prioritarias.</h2>
          <div className={styles.priorityGrid}>
            {result.priorities.map((p, i) => (
              <article key={p.title}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.detail}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.resultSection}>
          <p className={styles.kicker}>ARQUITECTURA RECOMENDADA</p>
          <h2>Un ecosistema. Una operación visible.</h2>
          <p className={styles.lead}>
            Integramos lo que la empresa ya utiliza con las nuevas capacidades recomendadas.
          </p>
          <ArchitectureMap tools={tools} modules={result.modules.map((m) => m.title)} />
        </section>
        <section className={styles.resultSection}>
          <p className={styles.kicker}>TU INFRAESTRUCTURA</p>
          <h2>Módulos diseñados para {company}.</h2>
          <div className={styles.moduleGrid}>
            {result.modules.map((module, i) => (
              <article key={module.id}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <ul>
                  {module.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <InvestmentSummary result={result} />
        <section className={styles.resultSection}>
          <p className={styles.kicker}>ROADMAP DE IMPLEMENTACIÓN</p>
          <h2>De diagnóstico a operación en {result.timelineWeeks} semanas.</h2>
          <ProjectTimeline weeks={result.timelineWeeks} />
        </section>
      </div>
      <section className={styles.finalCta}>
        <p>No implementamos herramientas aisladas.</p>
        <h2>
          Tu empresa necesita una infraestructura
          <br />
          que conecte las que ya utiliza.
        </h2>
        <div className={styles.ctaButtons}>
          <a
            className={styles.primary}
            href='mailto:venture@civilwork.com?subject=Reunión de diagnóstico Venture'
            onClick={() => trackEvent('meeting_clicked')}
          >
            <Calendar size={17} /> AGENDAR REUNIÓN <ArrowRight size={17} />
          </a>
          <button
            className={styles.secondary}
            onClick={() => {
              trackEvent('pdf_requested');
              window.print();
            }}
          >
            <Download size={17} /> DESCARGAR PROPUESTA
          </button>
          <a
            className={styles.secondary}
            href='https://wa.me/'
            target='_blank'
            rel='noreferrer'
            onClick={() => trackEvent('whatsapp_clicked')}
          >
            <MessageCircle size={17} /> WHATSAPP
          </a>
        </div>
        <button className={styles.restartLink} onClick={onRestart}>
          Realizar un nuevo diagnóstico
        </button>
      </section>
      <footer className={styles.resultsFooter}>
        <VentureLogo />
        <p>
          Ventas. Datos. Automatización. Atención. Inteligencia artificial.
          <br />
          <strong>Un solo ecosistema.</strong>
        </p>
        <CivilWorkLogo />
      </footer>
    </main>
  );
}
