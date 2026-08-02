'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type View = 'Resumen' | 'Proyectos' | 'Presupuesto' | 'Movimientos' | 'Avance' | 'Documentos';
type Movement = {
  id: number;
  type: 'Ingreso' | 'Gasto';
  concept: string;
  provider: string;
  amount: number;
  date: string;
};
type Project = {
  id: number;
  code: string;
  name: string;
  client: string;
  city: string;
  budget: number;
  progress: number;
  status: string;
};
type Chapter = { code: string; name: string; budget: number; executed: number; progress: number };

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});
const compact = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });

const initialProjects: Project[] = [
  {
    id: 1,
    code: 'GIB-025',
    name: 'Los Corales',
    client: 'Inversiones del Caribe',
    city: 'Barranquilla',
    budget: 171542976,
    progress: 68,
    status: 'En ejecución'
  },
  {
    id: 2,
    code: 'GIB-024',
    name: 'Bodega Malambo',
    client: 'Logística Norte S.A.S.',
    city: 'Malambo',
    budget: 284000000,
    progress: 42,
    status: 'En ejecución'
  },
  {
    id: 3,
    code: 'GIB-023',
    name: 'Adecuación Castellana',
    client: 'Grupo Castellana',
    city: 'Cartagena',
    budget: 96800000,
    progress: 100,
    status: 'Finalizado'
  },
  {
    id: 4,
    code: 'GIB-026',
    name: 'Oficinas Prado',
    client: 'Proyectos Prado',
    city: 'Barranquilla',
    budget: 128500000,
    progress: 12,
    status: 'Planeación'
  }
];

const initialChapters: Chapter[] = [
  {
    code: '01',
    name: 'Preliminares y demolición',
    budget: 8400000,
    executed: 7950000,
    progress: 100
  },
  {
    code: '02',
    name: 'Estructura y mampostería',
    budget: 35600000,
    executed: 30120000,
    progress: 82
  },
  {
    code: '03',
    name: 'Instalaciones eléctricas',
    budget: 25000000,
    executed: 26480000,
    progress: 74
  },
  { code: '04', name: 'Hidrosanitarias', budget: 18300000, executed: 12420000, progress: 65 },
  { code: '05', name: 'Acabados y pintura', budget: 41200000, executed: 22600000, progress: 48 },
  {
    code: '06',
    name: 'Carpintería y ventanería',
    budget: 26000000,
    executed: 8750000,
    progress: 31
  },
  {
    code: '07',
    name: 'Administración e imprevistos',
    budget: 17242976,
    executed: 9240000,
    progress: 68
  }
];

const initialMovements: Movement[] = [
  {
    id: 1,
    type: 'Ingreso',
    concept: 'Anticipo contractual 40%',
    provider: 'Inversiones del Caribe',
    amount: 68617190,
    date: '2026-07-02'
  },
  {
    id: 2,
    type: 'Ingreso',
    concept: 'Acta parcial de obra #1',
    provider: 'Inversiones del Caribe',
    amount: 42885744,
    date: '2026-07-22'
  },
  {
    id: 3,
    type: 'Gasto',
    concept: 'Cableado y protecciones',
    provider: 'ElectroCosta S.A.S.',
    amount: 12840000,
    date: '2026-07-29'
  },
  {
    id: 4,
    type: 'Gasto',
    concept: 'Nómina semanal cuadrilla',
    provider: 'Personal de obra',
    amount: 7850000,
    date: '2026-07-28'
  },
  {
    id: 5,
    type: 'Gasto',
    concept: 'Cemento y agregados',
    provider: 'Materiales El Prado',
    amount: 9420000,
    date: '2026-07-24'
  },
  {
    id: 6,
    type: 'Gasto',
    concept: 'Carpintería anticipo',
    provider: 'Aluminios del Norte',
    amount: 6500000,
    date: '2026-07-18'
  }
];

const nav: { label: View; icon: string }[] = [
  { label: 'Resumen', icon: '¦' },
  { label: 'Proyectos', icon: '?' },
  { label: 'Presupuesto', icon: '?' },
  { label: 'Movimientos', icon: '?' },
  { label: 'Avance', icon: '?' },
  { label: 'Documentos', icon: '?' }
];

function Login({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('email') === 'admin@gibbor.com.co' && form.get('password') === 'Gibbor2026!') {
      localStorage.setItem('gibbor-session', 'active');
      onLogin();
    } else setError('Los datos no coinciden. Usa las credenciales de demostración.');
  }
  return (
    <main className='g-login'>
      <section className='g-login-art'>
        <div className='g-login-brand'>
          <span>G</span>
          <div>
            <strong>GIBBOR</strong>
            <small>INGENIERÍA · CONSTRUCCIÓN</small>
          </div>
        </div>
        <div className='g-login-copy'>
          <p>CONTROL DE OBRAS</p>
          <h1>
            Decisiones claras.
            <br />
            Obras rentables.
          </h1>
          <p className='muted'>Presupuesto, ejecución y trazabilidad en un solo lugar.</p>
        </div>
        <div className='g-building' aria-hidden='true'>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <p className='g-login-foot'>GIBBOR S.A.S. · Barranquilla, Colombia</p>
      </section>
      <section className='g-login-form'>
        <form onSubmit={submit}>
          <div className='g-mobile-brand'>
            <b>G</b>
            <strong>GIBBOR</strong>
          </div>
          <p className='eyebrow'>BIENVENIDO</p>
          <h2>Inicia sesión</h2>
          <p className='muted'>Ingresa al centro de control de tus proyectos.</p>
          <label>
            Correo corporativo
            <input
              aria-label='Campo de formulario'
              name='email'
              type='email'
              defaultValue='admin@gibbor.com.co'
              required
            />
          </label>
          <label>
            Contraseña
            <input
              aria-label='Campo de formulario'
              name='password'
              type='password'
              defaultValue='Gibbor2026!'
              required
            />
          </label>
          {error && <p className='g-error'>{error}</p>}
          <button className='g-primary' type='submit'>
            Ingresar al sistema <span>?</span>
          </button>
          <p className='g-demo'>Demo: admin@gibbor.com.co · Gibbor2026!</p>
        </form>
      </section>
    </main>
  );
}

export function GibborApp() {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);
  const [view, setView] = useState<View>('Resumen');
  const [projects, setProjects] = useState(initialProjects);
  const [selected, setSelected] = useState(1);
  const [chapters, setChapters] = useState(initialChapters);
  const [movements, setMovements] = useState(initialMovements);
  const [modal, setModal] = useState<'project' | 'movement' | 'progress' | 'document' | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLogged(localStorage.getItem('gibbor-session') === 'active');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const raw = localStorage.getItem('gibbor-data');
    if (raw) {
      try {
        const d = JSON.parse(raw);
        setProjects(d.projects || initialProjects);
        setMovements(d.movements || initialMovements);
        setChapters(d.chapters || initialChapters);
      } catch {}
    }
  }, [ready]);
  useEffect(() => {
    if (ready)
      localStorage.setItem('gibbor-data', JSON.stringify({ projects, movements, chapters }));
  }, [projects, movements, chapters, ready]);

  const project = projects.find((item) => item.id === selected) || projects[0];
  const totals = useMemo(() => {
    const income = movements.filter((x) => x.type === 'Ingreso').reduce((s, x) => s + x.amount, 0);
    const expense = movements.filter((x) => x.type === 'Gasto').reduce((s, x) => s + x.amount, 0);
    const committed = chapters.reduce((s, x) => s + x.executed, 0);
    const budget = chapters.reduce((s, x) => s + x.budget, 0);
    return {
      income,
      expense,
      committed,
      budget,
      balance: income - expense,
      utility: project.budget - committed
    };
  }, [movements, chapters, project]);
  function notify(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  }

  if (!ready) return null;
  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const item: Project = {
      id: Date.now(),
      code: String(f.get('code')),
      name: String(f.get('name')),
      client: String(f.get('client')),
      city: String(f.get('city')),
      budget: Number(f.get('budget')),
      progress: 0,
      status: 'Planeación'
    };
    setProjects((p) => [...p, item]);
    setSelected(item.id);
    setModal(null);
    setView('Proyectos');
    notify('Proyecto creado correctamente');
  }
  function addMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setMovements((p) => [
      {
        id: Date.now(),
        type: String(f.get('type')) as Movement['type'],
        concept: String(f.get('concept')),
        provider: String(f.get('provider')),
        amount: Number(f.get('amount')),
        date: String(f.get('date'))
      },
      ...p
    ]);
    setModal(null);
    notify('Movimiento registrado');
  }
  function addProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const value = Number(f.get('progress'));
    setProjects((p) =>
      p.map((x) =>
        x.id === selected
          ? { ...x, progress: value, status: value === 100 ? 'Finalizado' : 'En ejecución' }
          : x
      )
    );
    setModal(null);
    notify('Avance actualizado');
  }
  function logout() {
    localStorage.removeItem('gibbor-session');
    setLogged(false);
  }

  const title = view === 'Resumen' ? 'Centro de control' : view;
  const subtitle =
    view === 'Resumen'
      ? 'Visión general de la operación de GIBBOR S.A.S.'
      : 'Proyecto activo: ' + project.name;

  return (
    <div className='g-shell'>
      <aside className='g-sidebar'>
        <div className='g-brand'>
          <span>G</span>
          <div>
            <strong>GIBBOR</strong>
            <small>CONTROL OBRAS</small>
          </div>
        </div>
        <nav>
          <p>GESTIÓN</p>
          {nav.map((item) => (
            <button
              key={item.label}
              className={view === item.label ? 'active' : ''}
              onClick={() => setView(item.label)}
            >
              <i>{item.icon}</i>
              {item.label}
              {item.label === 'Presupuesto' && <b>1</b>}
            </button>
          ))}
        </nav>
        <div className='g-sidebar-bottom'>
          <div>
            <span>AM</span>
            <p>
              <strong>Andrés Martínez</strong>
              <small>Administrador</small>
            </p>
          </div>
          <button onClick={logout} title='Cerrar sesión'>
            ?
          </button>
        </div>
      </aside>
      <main className='g-main'>
        <header className='g-topbar'>
          <button className='g-menu'>?</button>
          <div className='g-search'>
            ?
            <input
              aria-label='Campo de formulario'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar proyectos, documentos...'
            />
          </div>
          <div className='g-top-actions'>
            <button>?</button>
            <button className='bell'>
              ?<i />
            </button>
            <a href='https://wa.me/573001234567?text=Hola%20equipo%20GIBBOR' target='_blank'>
              WhatsApp
            </a>
          </div>
        </header>
        <div className='g-content'>
          <div className='g-heading'>
            <div>
              <p className='eyebrow'>DOMINGO, 2 DE AGOSTO DE 2026</p>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className='g-actions'>
              {view !== 'Resumen' && (
                <select
                  aria-label='Selector de formulario'
                  value={selected}
                  onChange={(e) => setSelected(Number(e.target.value))}
                >
                  {projects.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.code} · {p.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                className='g-secondary'
                onClick={() => notify('Reporte preparado para exportación')}
              >
                ? Exportar
              </button>
              <button
                className='g-primary'
                onClick={() =>
                  setModal(
                    view === 'Proyectos'
                      ? 'project'
                      : view === 'Avance'
                        ? 'progress'
                        : view === 'Documentos'
                          ? 'document'
                          : 'movement'
                  )
                }
              >
                +{' '}
                {view === 'Proyectos'
                  ? 'Nuevo proyecto'
                  : view === 'Avance'
                    ? 'Registrar avance'
                    : view === 'Documentos'
                      ? 'Subir soporte'
                      : 'Registrar movimiento'}
              </button>
            </div>
          </div>
          {view === 'Resumen' && (
            <Dashboard projects={projects} totals={totals} setView={setView} />
          )}
          {view === 'Proyectos' && (
            <Projects
              projects={projects.filter((p) =>
                (p.name + p.client + p.code).toLowerCase().includes(search.toLowerCase())
              )}
              onSelect={(id) => {
                setSelected(id);
                setView('Presupuesto');
              }}
            />
          )}
          {view === 'Presupuesto' && <Budget chapters={chapters} />}
          {view === 'Movimientos' && <Movements movements={movements} />}
          {view === 'Avance' && <Progress project={project} chapters={chapters} />}
          {view === 'Documentos' && <Documents onUpload={() => setModal('document')} />}
        </div>
      </main>
      {toast && <div className='g-toast'>? {toast}</div>}
      {modal && (
        <div className='g-modal-backdrop' role='presentation'>
          <div className='g-modal' role='dialog' aria-modal='true' aria-label='Formulario'>
            <button className='g-close' onClick={() => setModal(null)}>
              ×
            </button>
            {modal === 'project' && (
              <Form title='Nuevo proyecto' onSubmit={addProject}>
                <label>
                  Código
                  <input
                    aria-label='Campo de formulario'
                    name='code'
                    defaultValue={'GIB-0' + (projects.length + 23)}
                    required
                  />
                </label>
                <label>
                  Nombre del proyecto
                  <input aria-label='Campo de formulario' name='name' required />
                </label>
                <label>
                  Cliente
                  <input aria-label='Campo de formulario' name='client' required />
                </label>
                <div className='g-fields'>
                  <label>
                    Ciudad
                    <input aria-label='Campo de formulario' name='city' required />
                  </label>
                  <label>
                    Valor contrato
                    <input aria-label='Campo de formulario' name='budget' type='number' required />
                  </label>
                </div>
              </Form>
            )}
            {modal === 'movement' && (
              <Form title='Registrar movimiento' onSubmit={addMovement}>
                <label>
                  Tipo
                  <select aria-label='Selector de formulario' name='type'>
                    <option>Gasto</option>
                    <option>Ingreso</option>
                  </select>
                </label>
                <label>
                  Concepto
                  <input aria-label='Campo de formulario' name='concept' required />
                </label>
                <label>
                  Tercero / proveedor
                  <input aria-label='Campo de formulario' name='provider' required />
                </label>
                <div className='g-fields'>
                  <label>
                    Valor
                    <input aria-label='Campo de formulario' name='amount' type='number' required />
                  </label>
                  <label>
                    Fecha
                    <input
                      aria-label='Campo de formulario'
                      name='date'
                      type='date'
                      defaultValue='2026-08-02'
                      required
                    />
                  </label>
                </div>
              </Form>
            )}
            {modal === 'progress' && (
              <Form title='Registrar avance físico' onSubmit={addProgress}>
                <p className='muted'>
                  {project.name} · avance actual {project.progress}%
                </p>
                <label>
                  Nuevo avance (%)
                  <input
                    aria-label='Campo de formulario'
                    name='progress'
                    type='number'
                    min='0'
                    max='100'
                    defaultValue={project.progress}
                    required
                  />
                </label>
                <label>
                  Observación
                  <textarea
                    aria-label='Descripci�n'
                    name='note'
                    rows={3}
                    placeholder='Actividades ejecutadas, novedades...'
                  />
                </label>
              </Form>
            )}
            {modal === 'document' && (
              <Form
                title='Subir soporte'
                onSubmit={(e) => {
                  e.preventDefault();
                  setModal(null);
                  notify('Soporte agregado a la trazabilidad');
                }}
              >
                <label>
                  Tipo
                  <select aria-label='Selector de formulario'>
                    <option>Factura</option>
                    <option>Comprobante de egreso</option>
                    <option>Acta de obra</option>
                    <option>Fotografía</option>
                    <option>Contrato</option>
                  </select>
                </label>
                <label>
                  Archivo
                  <input aria-label='Campo de formulario' type='file' required />
                </label>
                <label>
                  Descripción
                  <textarea aria-label='Descripci�n' rows={3} />
                </label>
              </Form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Form({
  title,
  onSubmit,
  children
}: {
  title: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <form onSubmit={onSubmit}>
      <p className='eyebrow'>GIBBOR CONTROL OBRAS</p>
      <h2>{title}</h2>
      {children}
      <div className='g-form-actions'>
        <button type='button' className='g-secondary' onClick={() => history.back()}>
          Cancelar
        </button>
        <button className='g-primary'>Guardar registro</button>
      </div>
    </form>
  );
}

function Dashboard({
  projects,
  totals,
  setView
}: {
  projects: Project[];
  totals: {
    income: number;
    expense: number;
    committed: number;
    budget: number;
    balance: number;
    utility: number;
  };
  setView: (v: View) => void;
}) {
  const cards = [
    [
      'Valor contratado',
      projects.reduce((s, p) => s + p.budget, 0),
      '4 proyectos en portafolio',
      'navy'
    ],
    ['Ingresos recibidos', totals.income, '65% del contrato activo', 'green'],
    ['Egresos pagados', totals.expense, '35% de los ingresos', 'orange'],
    ['Saldo disponible', totals.balance, 'Caja del proyecto activo', 'blue']
  ];
  return (
    <>
      <section className='g-kpis'>
        {cards.map((c) => (
          <article key={c[0]}>
            <div className={'g-kpi-icon ' + c[3]}>$</div>
            <div>
              <p>{c[0]}</p>
              <h2>{money.format(Number(c[1]))}</h2>
              <small>{c[2]}</small>
            </div>
          </article>
        ))}
      </section>
      <section className='g-dashboard-grid'>
        <article className='g-card g-chart'>
          <div className='g-card-head'>
            <div>
              <h3>Flujo financiero</h3>
              <p>Ingresos vs. egresos últimos 6 meses</p>
            </div>
            <button>Últimos 6 meses?</button>
          </div>
          <div className='g-chart-area'>
            <div className='g-axis'>
              <span>$120M</span>
              <span>$90M</span>
              <span>$60M</span>
              <span>$30M</span>
              <span>$0</span>
            </div>
            <svg viewBox='0 0 620 210' preserveAspectRatio='none'>
              <defs>
                <linearGradient id='area' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0' stopColor='#1d5f91' stopOpacity='.25' />
                  <stop offset='1' stopColor='#1d5f91' stopOpacity='0' />
                </linearGradient>
              </defs>
              <path
                className='area'
                d='M0,175 C55,150 70,120 120,128 S190,83 245,96 S315,47 365,67 S435,32 490,45 S555,12 620,28 L620,210 L0,210Z'
              />
              <path
                className='line income'
                d='M0,175 C55,150 70,120 120,128 S190,83 245,96 S315,47 365,67 S435,32 490,45 S555,12 620,28'
              />
              <path
                className='line expense'
                d='M0,191 C70,180 65,155 120,168 S190,125 245,141 S310,108 365,115 S430,89 490,96 S560,70 620,78'
              />
            </svg>
            <div className='g-months'>
              <span>Mar</span>
              <span>Abr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Ago</span>
            </div>
          </div>
          <div className='g-legend'>
            <span>
              <i className='in' />
              Ingresos
            </span>
            <span>
              <i className='out' />
              Egresos
            </span>
          </div>
        </article>
        <article className='g-card'>
          <div className='g-card-head'>
            <div>
              <h3>Estado de proyectos</h3>
              <p>Avance físico consolidado</p>
            </div>
            <button onClick={() => setView('Proyectos')}>Ver todos ?</button>
          </div>
          <div className='g-project-list'>
            {projects.map((p) => (
              <div key={p.id}>
                <div className='g-project-row'>
                  <span className='g-project-icon'>?</span>
                  <p>
                    <strong>{p.name}</strong>
                    <small>
                      {p.city} · {p.code}
                    </small>
                  </p>
                  <b>{p.progress}%</b>
                </div>
                <div className='g-progress'>
                  <i style={{ width: p.progress + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className='g-bottom-grid'>
        <article className='g-card'>
          <div className='g-card-head'>
            <div>
              <h3>Indicadores del proyecto activo</h3>
              <p>Los Corales · corte al 2 de agosto</p>
            </div>
          </div>
          <div className='g-mini-kpis'>
            <div>
              <p>Presupuesto</p>
              <strong>{compact.format(totals.budget)}</strong>
            </div>
            <div>
              <p>Comprometido</p>
              <strong>{compact.format(totals.committed)}</strong>
            </div>
            <div>
              <p>Utilidad estimada</p>
              <strong className='positive'>{compact.format(totals.utility)}</strong>
            </div>
            <div>
              <p>Avance físico</p>
              <strong>68%</strong>
            </div>
          </div>
        </article>
        <article className='g-card g-alert'>
          <div className='g-card-head'>
            <div>
              <h3>Alertas y novedades</h3>
              <p>Requieren tu atención</p>
            </div>
            <b>2</b>
          </div>
          <div className='g-alert-row'>
            <span>!</span>
            <div>
              <strong>Sobrecosto en instalaciones eléctricas</strong>
              <p>Ejecución al 105,9% · excede $1.480.000</p>
            </div>
          </div>
          <div className='g-alert-row info'>
            <span>i</span>
            <div>
              <strong>Acta parcial pendiente de soporte</strong>
              <p>Ingreso del 22 de julio · $42.885.744</p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

function Projects({ projects, onSelect }: { projects: Project[]; onSelect: (id: number) => void }) {
  return (
    <section className='g-card g-table-card'>
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Cliente</th>
            <th>Ubicación</th>
            <th>Contrato</th>
            <th>Avance</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <strong>{p.name}</strong>
                <small>{p.code}</small>
              </td>
              <td>{p.client}</td>
              <td>{p.city}</td>
              <td>{money.format(p.budget)}</td>
              <td>
                <div className='g-cell-progress'>
                  <div
                    className='track'
                    role='progressbar'
                    aria-label='Avance del proyecto'
                    aria-valuenow={p.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <b style={{ width: p.progress + '%' }} />
                  </div>
                  <span>{p.progress}%</span>
                </div>
              </td>
              <td>
                <span
                  className={
                    'g-status ' +
                    (p.status === 'Finalizado' ? 'done' : p.status === 'Planeación' ? 'plan' : '')
                  }
                >
                  {p.status}
                </span>
              </td>
              <td>
                <button onClick={() => onSelect(p.id)}>Ver ?</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Budget({ chapters }: { chapters: Chapter[] }) {
  const total = chapters.reduce((s, c) => s + c.budget, 0),
    used = chapters.reduce((s, c) => s + c.executed, 0);
  return (
    <>
      <section className='g-summary-strip'>
        <div>
          <p>Presupuesto total</p>
          <strong>{money.format(total)}</strong>
        </div>
        <div>
          <p>Ejecutado / comprometido</p>
          <strong>{money.format(used)}</strong>
        </div>
        <div>
          <p>Disponible</p>
          <strong className='positive'>{money.format(total - used)}</strong>
        </div>
        <div>
          <p>Ejecución presupuestal</p>
          <strong>{Math.round((used / total) * 100)}%</strong>
        </div>
      </section>
      <section className='g-card g-table-card'>
        <table>
          <thead>
            <tr>
              <th>Capítulo</th>
              <th>Presupuesto</th>
              <th>Ejecutado</th>
              <th>Disponible</th>
              <th>Avance físico</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((c) => {
              const over = c.executed > c.budget;
              return (
                <tr key={c.code}>
                  <td>
                    <strong>
                      {c.code}. {c.name}
                    </strong>
                  </td>
                  <td>{money.format(c.budget)}</td>
                  <td>{money.format(c.executed)}</td>
                  <td className={over ? 'negative' : ''}>{money.format(c.budget - c.executed)}</td>
                  <td>{c.progress}%</td>
                  <td>
                    {over ? (
                      <span className='g-status danger'>Sobrecosto</span>
                    ) : (
                      <span className='g-status done'>Controlado</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

function Movements({ movements }: { movements: Movement[] }) {
  return (
    <section className='g-card g-table-card'>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Concepto</th>
            <th>Tercero</th>
            <th>Valor</th>
            <th>Soporte</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{m.date}</td>
              <td>
                <span className={'g-status ' + (m.type === 'Ingreso' ? 'done' : 'plan')}>
                  {m.type}
                </span>
              </td>
              <td>
                <strong>{m.concept}</strong>
              </td>
              <td>{m.provider}</td>
              <td className={m.type === 'Ingreso' ? 'positive' : ''}>
                <strong>
                  {m.type === 'Ingreso' ? '+ ' : '- '}
                  {money.format(m.amount)}
                </strong>
              </td>
              <td>
                <button>? Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Progress({ project, chapters }: { project: Project; chapters: Chapter[] }) {
  return (
    <>
      <section className='g-progress-hero'>
        <div>
          <p>AVANCE GENERAL DEL PROYECTO</p>
          <strong>{project.progress}%</strong>
          <span>Meta programada: 72%</span>
        </div>
        <div
          className='g-ring'
          style={{ background: `conic-gradient(#c99a2e ${project.progress}%, #e8edf2 0)` }}
        >
          <i>{project.progress}%</i>
        </div>
      </section>
      <section className='g-card g-table-card'>
        <table>
          <thead>
            <tr>
              <th>Actividad / capítulo</th>
              <th>Avance</th>
              <th>Estado</th>
              <th>Última actualización</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((c) => (
              <tr key={c.code}>
                <td>
                  <strong>{c.name}</strong>
                </td>
                <td>
                  <div className='g-cell-progress'>
                    <div
                      className='track'
                      role='progressbar'
                      aria-label='Avance de la actividad'
                      aria-valuenow={c.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <b style={{ width: c.progress + '%' }} />
                    </div>
                    <span>{c.progress}%</span>
                  </div>
                </td>
                <td>
                  <span className='g-status done'>
                    {c.progress === 100 ? 'Completado' : 'En curso'}
                  </span>
                </td>
                <td>02 ago 2026</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function Documents({ onUpload }: { onUpload: () => void }) {
  const docs = [
    ['ACTA-001.pdf', 'Acta de obra', '02 ago 2026', '2,4 MB'],
    ['Factura_ElectroCosta.pdf', 'Factura', '29 jul 2026', '840 KB'],
    ['Avance_semana_12.zip', 'Registro fotográfico', '28 jul 2026', '14,2 MB'],
    ['Contrato_Los_Corales.pdf', 'Contrato', '02 jul 2026', '5,1 MB']
  ];
  return (
    <section className='g-doc-grid'>
      <button className='g-upload' onClick={onUpload}>
        <span>?</span>
        <strong>Subir nuevo soporte</strong>
        <small>PDF, imágenes, Excel o ZIP · máx. 20 MB</small>
      </button>
      {docs.map((d) => (
        <article className='g-card g-doc' key={d[0]}>
          <span>?</span>
          <div>
            <strong>{d[0]}</strong>
            <p>
              {d[1]} · {d[2]}
            </p>
            <small>{d[3]}</small>
          </div>
          <button>•••</button>
        </article>
      ))}
    </section>
  );
}
