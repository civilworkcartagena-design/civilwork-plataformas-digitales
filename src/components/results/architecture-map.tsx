import { Database, MessageSquare, Orbit, Sparkles } from 'lucide-react';
import styles from '@/styles/venture.module.css';
export function ArchitectureMap({ tools, modules }: { tools: string[]; modules: string[] }) {
  const nodes = [...tools.slice(0, 4), ...modules.slice(0, 5)].filter(
    (v, i, a) => a.indexOf(v) === i
  );
  return (
    <div className={styles.architecture}>
      <div className={styles.archCore}>
        <Orbit />
        <span>MOTOR VENTURE</span>
        <strong>OPERACIÓN CONECTADA</strong>
      </div>
      <div className={styles.archNodes}>
        {nodes.map((node, index) => (
          <div key={node} className={styles.archNode}>
            {index % 3 === 0 ? <Database /> : index % 3 === 1 ? <MessageSquare /> : <Sparkles />}
            <span>{node}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
