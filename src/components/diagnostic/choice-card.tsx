'use client';
import { Check } from 'lucide-react';
import type { ChoiceOption } from '@/types/venture';
import styles from '@/styles/venture.module.css';

export function ChoiceCard({
  option,
  index,
  selected,
  onSelect
}: {
  option: ChoiceOption;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      className={`${styles.choice} ${selected ? styles.choiceSelected : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={styles.choiceKey}>{index < 9 ? index + 1 : '·'}</span>
      <span className={styles.choiceCopy}>
        <strong>{option.label}</strong>
        {option.description && <small>{option.description}</small>}
      </span>
      {option.badge && <span className={styles.badge}>{option.badge}</span>}
      <span className={styles.check}>{selected && <Check size={15} strokeWidth={2.5} />}</span>
    </button>
  );
}
