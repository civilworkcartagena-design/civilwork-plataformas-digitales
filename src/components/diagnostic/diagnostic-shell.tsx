'use client';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getVisibleQuestions } from '@/config/venture-questions';
import { trackEvent } from '@/lib/analytics';
import { clearSession, readSession, saveSession } from '@/lib/venture-storage';
import type { Attribution, DiagnosticAnswers } from '@/types/venture';
import { CivilWorkLogo, VentureLogo } from '../branding/venture-logo';
import { ProgressBar } from './progress-bar';
import { QuestionStep } from './question-step';
import styles from '@/styles/venture.module.css';

export function DiagnosticShell({
  attribution,
  onComplete,
  onExit
}: {
  attribution: Attribution;
  onComplete: (answers: DiagnosticAnswers) => void;
  onExit: () => void;
}) {
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const [resume, setResume] = useState(false);
  const reduce = useReducedMotion();
  const visible = useMemo(() => getVisibleQuestions(answers), [answers]);
  const question = visible[index] ?? visible[visible.length - 1];
  const progress = Math.round(((index + 1) / visible.length) * 100);
  useEffect(() => {
    const saved = readSession();
    if (saved && Object.keys(saved.answers).length) setResume(true);
  }, []);
  const restore = () => {
    const saved = readSession();
    if (!saved) return;
    setAnswers(saved.answers);
    const list = getVisibleQuestions(saved.answers);
    setIndex(
      Math.max(
        0,
        list.findIndex((q) => q.id === saved.currentQuestionId)
      )
    );
    setResume(false);
  };
  const restart = () => {
    clearSession();
    setAnswers({});
    setIndex(0);
    setResume(false);
  };
  const valid = useCallback(() => {
    const value = answers[question.id];
    if (!question.required) return true;
    if (question.type === 'contact') {
      const c = (value ?? {}) as Record<string, string>;
      return Boolean(c.name?.trim() && c.email?.includes('@') && c.phone?.trim());
    }
    return Array.isArray(value) ? value.length > 0 : Boolean(String(value ?? '').trim());
  }, [answers, question]);
  const next = useCallback(() => {
    if (!valid()) {
      setError('Completa esta respuesta para continuar.');
      return;
    }
    setError('');
    trackEvent('question_answered', { questionId: question.id });
    if (index >= visible.length - 1) {
      trackEvent('diagnostic_completed');
      onComplete(answers);
      clearSession();
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    saveSession({
      answers,
      currentQuestionId: visible[nextIndex].id,
      updatedAt: new Date().toISOString(),
      attribution
    });
    [25, 50, 75].forEach((mark) => {
      if (progress >= mark && progress < mark + 8)
        trackEvent(`diagnostic_${mark}` as 'diagnostic_25');
    });
  }, [answers, attribution, index, onComplete, progress, question.id, valid, visible]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) next();
      if (e.key === 'Escape')
        saveSession({
          answers,
          currentQuestionId: question.id,
          updatedAt: new Date().toISOString(),
          attribution
        });
      if (/^[1-9]$/.test(e.key) && question.options) {
        const option = question.options[Number(e.key) - 1];
        if (option) {
          const current = answers[question.id];
          const vals = Array.isArray(current) ? current : [];
          setAnswers((a) => ({
            ...a,
            [question.id]:
              question.type === 'multi'
                ? vals.includes(option.value)
                  ? vals.filter((x) => x !== option.value)
                  : [...vals, option.value]
                : option.value
          }));
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answers, attribution, next, question]);
  if (resume)
    return (
      <main className={styles.resume}>
        <VentureLogo />
        <div>
          <p className={styles.kicker}>SESIÓN GUARDADA</p>
          <h1>Encontramos un diagnóstico sin terminar.</h1>
          <p>Tu progreso permanece seguro en este dispositivo.</p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={restore}>
              CONTINUAR <ArrowRight size={17} />
            </button>
            <button className={styles.secondary} onClick={restart}>
              EMPEZAR DE NUEVO
            </button>
          </div>
        </div>
      </main>
    );
  return (
    <main className={styles.diagnostic}>
      <header className={styles.diagHeader}>
        <VentureLogo compact />
        <span>{progress}%</span>
        <ProgressBar value={progress} />
      </header>
      <div className={styles.questionFrame}>
        <AnimatePresence mode='wait'>
          <motion.section
            key={question.id}
            className={styles.question}
            initial={reduce ? false : { opacity: 0, y: 26, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? undefined : { opacity: 0, y: -20, filter: 'blur(4px)' }}
            transition={{ duration: reduce ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className={styles.sectionLabel}>
              <span>{String(index + 1).padStart(2, '0')}</span> {question.section}
            </p>
            <h1>{question.title}</h1>
            {question.description && <p className={styles.description}>{question.description}</p>}
            <QuestionStep
              question={question}
              value={answers[question.id]}
              error={error}
              onChange={(value) => {
                setAnswers((a) => ({ ...a, [question.id]: value }));
                setError('');
              }}
            />
          </motion.section>
        </AnimatePresence>
      </div>
      <footer className={styles.diagFooter}>
        <button className={styles.back} onClick={() => (index ? setIndex(index - 1) : onExit())}>
          <ArrowLeft size={16} /> Atrás
        </button>
        <CivilWorkLogo />
        <div>
          <span className={styles.enterHint}>Presiona Enter ↵</span>
          <button className={styles.next} onClick={next}>
            {index === visible.length - 1 ? 'DISEÑAR PROPUESTA' : 'CONTINUAR'}{' '}
            <ArrowRight size={17} />
          </button>
        </div>
      </footer>
    </main>
  );
}
