'use client';
import type { AnswerValue, DiagnosticQuestion } from '@/types/venture';
import { ChoiceCard } from './choice-card';
import styles from '@/styles/venture.module.css';

interface Props {
  question: DiagnosticQuestion;
  value?: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string;
}
export function QuestionStep({ question, value, onChange, error }: Props) {
  if (question.type === 'text')
    return (
      <div className={styles.inputWrap}>
        <label className={styles.srOnly} htmlFor={question.id}>
          {question.title}
        </label>
        <input
          id={question.id}
          aria-label={question.title}
          className={styles.heroInput}
          placeholder={question.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          autoComplete='organization'
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  if (question.type === 'contact') {
    const contact = (value ?? {}) as Record<string, string>;
    const field = (key: string, label: string, type = 'text', autoComplete?: string) => (
      <label className={styles.field}>
        <span>{label}</span>
        <input
          aria-label={label}
          type={type}
          value={contact[key] ?? ''}
          autoComplete={autoComplete}
          onChange={(e) => onChange({ ...contact, [key]: e.target.value })}
        />
      </label>
    );
    return (
      <div className={styles.contactGrid}>
        {field('name', 'Nombre', 'text', 'name')}
        {field('position', 'Cargo', 'text', 'organization-title')}
        {field('email', 'Email corporativo', 'email', 'email')}
        {field('phone', 'Teléfono / WhatsApp', 'tel', 'tel')}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }
  const multiple = question.type === 'multi';
  const values = Array.isArray(value) ? value : [];
  return (
    <div
      className={`${styles.choices} ${question.type === 'transformation' ? styles.planChoices : ''}`}
      role={multiple ? 'group' : 'radiogroup'}
    >
      {question.options?.map((option, index) => {
        const selected = multiple ? values.includes(option.value) : value === option.value;
        return (
          <ChoiceCard
            key={option.value}
            option={option}
            index={index}
            selected={selected}
            onSelect={() =>
              onChange(
                multiple
                  ? selected
                    ? values.filter((v) => v !== option.value)
                    : [...values, option.value]
                  : option.value
              )
            }
          />
        );
      })}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
