'use client';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { VentureLogo, CivilWorkLogo } from '@/components/branding/venture-logo';
import { DiagnosticShell } from '@/components/diagnostic/diagnostic-shell';
import { ResultsDashboard } from '@/components/results/results-dashboard';
import { trackEvent } from '@/lib/analytics';
import { createRecommendation } from '@/lib/recommendation-engine';
import { saveLead } from '@/lib/venture-storage';
import type { Attribution, DiagnosticAnswers, DiagnosticResult } from '@/types/venture';
import styles from '@/styles/venture.module.css';

type Screen = 'home' | 'diagnostic' | 'processing' | 'results';
export default function VenturePage() {
  const [screen, setScreen] = useState<Screen>('home');
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [task, setTask] = useState(0);
  const reduce = useReducedMotion();
  const attribution = useMemo<Attribution>(() => {
    if (typeof window === 'undefined') return {};
    const p = new URLSearchParams(window.location.search);
    return Object.fromEntries(
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref', 'sales_rep']
        .map((k) => [k, p.get(k) ?? undefined])
        .filter(([, v]) => v)
    );
  }, []);
  useEffect(() => {
    if (screen !== 'processing') return;
    const generated = createRecommendation(answers);
    const interval = window.setInterval(
      () => setTask((n) => Math.min(5, n + 1)),
      reduce ? 120 : 520
    );
    const timeout = window.setTimeout(
      () => {
        window.clearInterval(interval);
        setResult(generated);
        void saveLead(answers, generated, attribution)
          .then(() =>
            trackEvent('quote_generated', { plan: generated.plan, score: generated.score })
          )
          .catch(() => trackEvent('lead_save_failed'));
        setScreen('results');
      },
      reduce ? 700 : 3200
    );
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [answers, attribution, reduce, screen]);
  if (screen === 'diagnostic')
    return (
      <DiagnosticShell
        attribution={attribution}
        onExit={() => setScreen('home')}
        onComplete={(a) => {
          setAnswers(a);
          setTask(0);
          setScreen('processing');
        }}
      />
    );
  if (screen === 'processing') {
    const tasks = [
      'Analizando operación comercial',
      'Evaluando procesos manuales',
      'Definiendo automatizaciones',
      'Construyendo arquitectura',
      'Calculando inversión'
    ];
    return (
      <main className={styles.processing}>
        <VentureLogo />
        <div className={styles.processingOrb} />
        <h1>
          Estamos diseñando
          <br />
          tu infraestructura digital...
        </h1>
        <div>
          {tasks.map((label, i) => (
            <p key={label} className={task > i ? styles.done : ''}>
              <span>{task > i ? <Check size={14} /> : String(i + 1).padStart(2, '0')}</span>
              {label}
            </p>
          ))}
        </div>
      </main>
    );
  }
  if (screen === 'results' && result)
    return (
      <ResultsDashboard
        answers={answers}
        result={result}
        onRestart={() => {
          setAnswers({});
          setResult(null);
          setScreen('home');
        }}
      />
    );
  return (
    <main className={styles.landing}>
      <div className={styles.cursorGlow} />
      <header>
        <VentureLogo />
        <CivilWorkLogo />
      </header>
      <div className={styles.heroGrid}>
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.kicker}>
            VENTURE <span /> CIVIL WORK
          </p>
          <h1>
            Construyamos la
            <br />
            <em>infraestructura digital</em>
            <br />
            de tu empresa.
          </h1>
          <p className={styles.heroText}>
            Diagnostica tus procesos comerciales, atención al cliente, seguimiento de leads y
            automatizaciones.
            <br />
            <br />
            En pocos minutos construiremos una arquitectura digital adaptada a tu operación.
          </p>
          <button
            className={styles.primary}
            onClick={() => {
              trackEvent('diagnostic_started', { ...attribution });
              setScreen('diagnostic');
            }}
          >
            COMENZAR DIAGNÓSTICO <ArrowRight size={18} />
          </button>
          <div className={styles.meta}>
            <span>3–5 minutos</span>
            <span>Diagnóstico gratuito</span>
            <span>Resultado inmediato</span>
          </div>
        </motion.section>
        <aside>
          <div className={styles.orbitVisual}>
            <span />
            <span />
            <span />
            <div>
              VENTURE<small>DIAGNOSTIC ENGINE</small>
            </div>
          </div>
          <p>
            No implementamos herramientas aisladas.
            <br />
            <strong>Diseñamos infraestructura empresarial digital.</strong>
          </p>
        </aside>
      </div>
      <footer>
        <span>ESTRATEGIA · INGENIERÍA · TRANSFORMACIÓN</span>
        <CivilWorkLogo />
      </footer>
    </main>
  );
}
