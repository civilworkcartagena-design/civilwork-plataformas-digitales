'use client';

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

type View =
  | 'Resumen'
  | 'Equipos'
  | 'Programacion'
  | 'Registro'
  | 'Calendario'
  | 'Hoja de Vida'
  | 'Personal';

type MaintenanceType = 'PREVENTIVO' | 'CORRECTIVO';
type StatusCode = 'E' | 'R' | 'N' | 'P';

type Equipment = {
  code: string;
  name: string;
  brand: string;
  client: string;
  features: string;
  model: string;
  location: string;
  capacity: string;
  address: string;
  phone: string;
  openedAt: string;
  frequencyDays: number;
  responsible: string;
};

type Maintenance = {
  id: string;
  date: string;
  code: string;
  type: MaintenanceType;
  description: string;
  value: number;
  laborCost: number;
  utility: number;
  personnel: string;
};

type CalendarMark = {
  id: string;
  code: string;
  date: string;
  status: StatusCode;
  note: string;
};

type Frequency = { days: number; label: string };

type Organization = {
  company: string;
  city: string;
  manager: string;
};

type MaintenanceState = {
  organization: Organization;
  equipment: Equipment[];
  maintenances: Maintenance[];
  calendarMarks: CalendarMark[];
  personnel: string[];
  frequencies: Frequency[];
};

type ImportedWorkbook = Partial<MaintenanceState> & { importedAt?: string };

const storageKey = 'gibbor-maintenance-v2';

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

const percent = new Intl.NumberFormat('es-CO', {
  style: 'percent',
  maximumFractionDigits: 0
});

const defaultFrequencies: Frequency[] = [
  { days: 7, label: 'Semanal' },
  { days: 15, label: 'Quincenal' },
  { days: 30, label: 'Mensual' },
  { days: 60, label: 'Bimestral' },
  { days: 90, label: 'Trimestral' },
  { days: 120, label: '4 meses' },
  { days: 180, label: 'Semestral' },
  { days: 240, label: '8 meses' },
  { days: 360, label: 'Anual' }
];

const emptyState: MaintenanceState = {
  organization: {
    company: 'GIBBOR Soluciones S.A.S.',
    city: 'Cartagena',
    manager: 'Jose Ceden'
  },
  equipment: [],
  maintenances: [],
  calendarMarks: [],
  personnel: [],
  frequencies: defaultFrequencies
};

const nav: { label: View; caption: string }[] = [
  { label: 'Resumen', caption: 'KPI' },
  { label: 'Equipos', caption: 'EQ' },
  { label: 'Programacion', caption: 'PR' },
  { label: 'Registro', caption: 'MT' },
  { label: 'Calendario', caption: 'E/R' },
  { label: 'Hoja de Vida', caption: 'HV' },
  { label: 'Personal', caption: 'PE' }
];

const statusLabels: Record<StatusCode, string> = {
  E: 'Ejecutado',
  R: 'Reprogramado',
  N: 'No ejecutado',
  P: 'Pendiente'
};

function todayInput() {
  return toInputDate(new Date());
}

function toInputDate(value: Date | string | null | undefined) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(value: string, days: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return toInputDate(date);
}

function differenceInDays(from: string, to = todayInput()) {
  const a = parseDate(from).getTime();
  const b = parseDate(to).getTime();
  return Math.ceil((a - b) / 86400000);
}

function dateLabel(value: string) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(parseDate(value));
}

function normalizeCode(value: FormDataEntryValue | string | null) {
  return String(value || '')
    .trim()
    .padStart(4, '0');
}

function asNumber(value: FormDataEntryValue | string | number | null | undefined) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uid(prefix: string) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function equipmentName(item?: Equipment) {
  if (!item) return 'Equipo no encontrado';
  return item.name || `Equipo ${item.code}`;
}

function lastPreventiveDate(code: string, maintenances: Maintenance[]) {
  return maintenances
    .filter((item) => item.code === code && item.type === 'PREVENTIVO')
    .map((item) => item.date)
    .toSorted()
    .at(-1);
}

function nextMaintenanceDate(equipment: Equipment, maintenances: Maintenance[]) {
  const base = lastPreventiveDate(equipment.code, maintenances) || equipment.openedAt;
  if (!base || !equipment.frequencyDays) return '';
  return addDays(base, equipment.frequencyDays);
}

function mergeImportedState(
  current: MaintenanceState,
  imported: ImportedWorkbook
): MaintenanceState {
  return {
    organization: {
      ...current.organization,
      ...imported.organization
    },
    equipment: imported.equipment || current.equipment,
    maintenances: imported.maintenances || current.maintenances,
    calendarMarks: imported.calendarMarks || current.calendarMarks,
    personnel: imported.personnel || current.personnel,
    frequencies: imported.frequencies?.length ? imported.frequencies : current.frequencies
  };
}

export function GibborApp() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>('Resumen');
  const [state, setState] = useState<MaintenanceState>(emptyState);
  const [selectedCode, setSelectedCode] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<
    'equipment' | 'maintenance' | 'status' | 'personnel' | 'import' | null
  >(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as MaintenanceState;
        setState({ ...emptyState, ...parsed });
        setSelectedCode(parsed.equipment?.[0]?.code || '');
      } catch {
        setState(emptyState);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify(state));
  }, [ready, state]);

  useEffect(() => {
    if (!selectedCode && state.equipment[0]) setSelectedCode(state.equipment[0].code);
  }, [selectedCode, state.equipment]);

  const selectedEquipment =
    state.equipment.find((item) => item.code === selectedCode) || state.equipment[0];
  const filteredEquipment = state.equipment.filter((item) =>
    [item.code, item.name, item.client, item.location, item.address]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const metrics = useMemo(() => {
    const executed = state.calendarMarks.filter((item) => item.status === 'E').length;
    const reprogrammed = state.calendarMarks.filter((item) => item.status === 'R').length;
    const notExecuted = state.calendarMarks.filter((item) => item.status === 'N').length;
    const pendingMarked = state.calendarMarks.filter((item) => item.status === 'P').length;
    const income = state.maintenances.reduce((sum, item) => sum + item.value, 0);
    const cost = state.maintenances.reduce((sum, item) => sum + item.laborCost, 0);
    const preventive = state.maintenances.filter((item) => item.type === 'PREVENTIVO').length;
    const corrective = state.maintenances.filter((item) => item.type === 'CORRECTIVO').length;
    const schedule = state.equipment.map((item) => {
      const next = nextMaintenanceDate(item, state.maintenances);
      return { equipment: item, next, days: next ? differenceInDays(next) : null };
    });
    const dueSoon = schedule.filter(
      (item) => item.days !== null && item.days >= 0 && item.days <= 15
    ).length;
    const overdue = schedule.filter((item) => item.days !== null && item.days < 0).length;

    return {
      executed,
      reprogrammed,
      notExecuted,
      pendingMarked,
      income,
      cost,
      utility: income - cost,
      preventive,
      corrective,
      dueSoon,
      overdue,
      compliance: executed + notExecuted ? executed / (executed + notExecuted) : 0,
      effectiveness: executed + reprogrammed ? executed / (executed + reprogrammed) : 0,
      schedule
    };
  }, [state]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }

  function upsertEquipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const item: Equipment = {
      code: normalizeCode(f.get('code')),
      name: String(f.get('name') || '').trim(),
      brand: String(f.get('brand') || '').trim(),
      client: String(f.get('client') || '').trim(),
      features: String(f.get('features') || '').trim(),
      model: String(f.get('model') || '').trim(),
      location: String(f.get('location') || '').trim(),
      capacity: String(f.get('capacity') || '').trim(),
      address: String(f.get('address') || '').trim(),
      phone: String(f.get('phone') || '').trim(),
      openedAt: String(f.get('openedAt') || todayInput()),
      frequencyDays: asNumber(f.get('frequencyDays')) || 120,
      responsible: String(f.get('responsible') || '').trim()
    };

    setState((current) => {
      const exists = current.equipment.some((equipment) => equipment.code === item.code);
      return {
        ...current,
        equipment: exists
          ? current.equipment.map((equipment) => (equipment.code === item.code ? item : equipment))
          : [...current.equipment, item].toSorted((a, b) => a.code.localeCompare(b.code))
      };
    });
    setSelectedCode(item.code);
    setEditingEquipment(null);
    setModal(null);
    notify(editingEquipment ? 'Equipo actualizado' : 'Equipo cargado');
  }

  function deleteEquipment(code: string) {
    setState((current) => ({
      ...current,
      equipment: current.equipment.filter((item) => item.code !== code),
      maintenances: current.maintenances.filter((item) => item.code !== code),
      calendarMarks: current.calendarMarks.filter((item) => item.code !== code)
    }));
    if (selectedCode === code) setSelectedCode('');
    notify('Equipo eliminado con su trazabilidad asociada');
  }

  function upsertMaintenance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const value = asNumber(f.get('value'));
    const laborCost = asNumber(f.get('laborCost'));
    const item: Maintenance = {
      id: editingMaintenance?.id || uid('mto'),
      date: String(f.get('date') || todayInput()),
      code: normalizeCode(f.get('code')),
      type: String(f.get('type') || 'PREVENTIVO') as MaintenanceType,
      description: String(f.get('description') || '').trim(),
      value,
      laborCost,
      utility: value - laborCost,
      personnel: String(f.get('personnel') || '').trim()
    };

    setState((current) => {
      const maintenances = editingMaintenance
        ? current.maintenances.map((entry) => (entry.id === item.id ? item : entry))
        : [item, ...current.maintenances];
      const calendarMarks =
        item.type === 'PREVENTIVO'
          ? upsertMark(current.calendarMarks, {
              id: uid('mark'),
              code: item.code,
              date: item.date,
              status: 'E',
              note: item.description || 'Mantenimiento preventivo ejecutado'
            })
          : current.calendarMarks;
      return { ...current, maintenances, calendarMarks };
    });
    setSelectedCode(item.code);
    setEditingMaintenance(null);
    setModal(null);
    notify(editingMaintenance ? 'Registro modificado' : 'Registro de mantenimiento guardado');
  }

  function deleteMaintenance(id: string) {
    setState((current) => ({
      ...current,
      maintenances: current.maintenances.filter((item) => item.id !== id)
    }));
    notify('Registro eliminado');
  }

  function registerStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const status = String(f.get('status') || 'P') as StatusCode;
    const code = normalizeCode(f.get('code'));
    const date = String(f.get('date') || todayInput());
    const description = String(f.get('note') || '').trim();
    const value = asNumber(f.get('value'));
    const laborCost = asNumber(f.get('laborCost'));
    const personnel = String(f.get('personnel') || '').trim();

    setState((current) => {
      const calendarMarks = upsertMark(current.calendarMarks, {
        id: uid('mark'),
        code,
        date,
        status,
        note: description
      });
      const maintenances =
        status === 'E'
          ? [
              {
                id: uid('mto'),
                code,
                date,
                type: 'PREVENTIVO' as const,
                description: description || 'Mantenimiento preventivo ejecutado desde calendario',
                value,
                laborCost,
                utility: value - laborCost,
                personnel
              },
              ...current.maintenances
            ]
          : current.maintenances;
      return { ...current, calendarMarks, maintenances };
    });
    setSelectedCode(code);
    setModal(null);
    notify(status === 'E' ? 'Ejecucion registrada' : 'Estado actualizado en calendario');
  }

  function upsertPersonnel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get('name') || '').trim();
    if (!name) return;
    setState((current) => ({
      ...current,
      personnel: Array.from(new Set([...current.personnel, name])).toSorted()
    }));
    setModal(null);
    notify('Personal agregado');
  }

  async function importWorkbook(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/gibbor/import-xlsm', { method: 'POST', body });
      if (!response.ok) throw new Error('No se pudo leer el archivo');
      const imported = (await response.json()) as ImportedWorkbook;
      setState((current) => mergeImportedState(current, imported));
      setSelectedCode(imported.equipment?.[0]?.code || selectedCode);
      setModal(null);
      notify('Macro importada y convertida en datos operativos');
    } catch {
      notify('No se pudo importar la macro. Revisa que sea el archivo GIBBOR .xlsm/.xlsx');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  }

  async function exportWorkbook() {
    const response = await fetch('/api/gibbor/export-xlsx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (!response.ok) {
      notify('No se pudo exportar el reporte');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gibbor-control-mantenimiento.xlsx';
    a.click();
    URL.revokeObjectURL(url);
    notify('Reporte Excel generado');
  }

  if (!ready) return null;

  return (
    <div className='g-shell'>
      <aside className='g-sidebar'>
        <div className='g-brand'>
          <span>G</span>
          <div>
            <strong>GIBBOR</strong>
            <small>MANTENIMIENTO</small>
          </div>
        </div>
        <nav>
          <p>MACRO WEB</p>
          {nav.map((item) => (
            <button
              key={item.label}
              className={view === item.label ? 'active' : ''}
              onClick={() => setView(item.label)}
            >
              <i>{item.caption}</i>
              {item.label}
              {item.label === 'Programacion' && metrics.dueSoon + metrics.overdue > 0 && (
                <b>{metrics.dueSoon + metrics.overdue}</b>
              )}
            </button>
          ))}
        </nav>
        <div className='g-sidebar-bottom'>
          <div>
            <span>JC</span>
            <p>
              <strong>{state.organization.manager}</strong>
              <small>Gerente · {state.organization.city}</small>
            </p>
          </div>
        </div>
      </aside>
      <main className='g-main'>
        <header className='g-topbar'>
          <button className='g-menu'>Menu</button>
          <div className='g-search'>
            <span>Buscar</span>
            <input
              aria-label='Buscar'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Codigo, cliente, equipo, direccion...'
            />
          </div>
          <div className='g-top-actions'>
            <button onClick={() => setModal('import')}>Importar macro</button>
            <button onClick={exportWorkbook}>Exportar Excel</button>
            <a href='https://wa.me/573016107912?text=Hola%20equipo%20GIBBOR' target='_blank'>
              WhatsApp
            </a>
          </div>
        </header>
        <div className='g-content'>
          <div className='g-heading'>
            <div>
              <p className='eyebrow'>
                {state.organization.company} · {state.organization.city}
              </p>
              <h1>{view === 'Resumen' ? 'Control de mantenimiento' : view}</h1>
              <p>
                La plataforma replica la macro: equipos, programacion, estados E/R/N/P, registros,
                hoja de vida, resumen y exportacion.
              </p>
            </div>
            <div className='g-actions'>
              {state.equipment.length > 0 && view !== 'Equipos' && (
                <select
                  aria-label='Equipo seleccionado'
                  value={selectedEquipment?.code || ''}
                  onChange={(event) => setSelectedCode(event.target.value)}
                >
                  {state.equipment.map((item) => (
                    <option value={item.code} key={item.code}>
                      {item.code} · {equipmentName(item)}
                    </option>
                  ))}
                </select>
              )}
              <button
                className='g-secondary'
                onClick={() => {
                  setEditingEquipment(null);
                  setModal('equipment');
                }}
              >
                Cargar equipo
              </button>
              <button
                className='g-primary'
                onClick={() => {
                  setEditingMaintenance(null);
                  setModal(view === 'Calendario' ? 'status' : 'maintenance');
                }}
              >
                {view === 'Calendario' ? 'Registrar ejecucion' : 'Nuevo registro'}
              </button>
            </div>
          </div>

          {state.equipment.length === 0 ? (
            <EmptyState
              onImport={() => setModal('import')}
              onNewEquipment={() => setModal('equipment')}
            />
          ) : (
            <>
              {view === 'Resumen' && (
                <Summary
                  state={state}
                  metrics={metrics}
                  setView={setView}
                  onStatus={() => setModal('status')}
                />
              )}
              {view === 'Equipos' && (
                <EquipmentTable
                  equipment={filteredEquipment}
                  onSelect={(code) => {
                    setSelectedCode(code);
                    setView('Hoja de Vida');
                  }}
                  onEdit={(item) => {
                    setEditingEquipment(item);
                    setModal('equipment');
                  }}
                  onDelete={deleteEquipment}
                />
              )}
              {view === 'Programacion' && (
                <ProgrammingTable
                  schedule={metrics.schedule}
                  maintenances={state.maintenances}
                  onSelect={(code) => {
                    setSelectedCode(code);
                    setView('Hoja de Vida');
                  }}
                  onRegister={(code) => {
                    setSelectedCode(code);
                    setModal('status');
                  }}
                />
              )}
              {view === 'Registro' && (
                <MaintenanceTable
                  equipment={state.equipment}
                  maintenances={state.maintenances}
                  onEdit={(item) => {
                    setEditingMaintenance(item);
                    setModal('maintenance');
                  }}
                  onDelete={deleteMaintenance}
                />
              )}
              {view === 'Calendario' && (
                <CalendarView
                  equipment={filteredEquipment}
                  maintenances={state.maintenances}
                  marks={state.calendarMarks}
                  onRegister={(code) => {
                    setSelectedCode(code);
                    setModal('status');
                  }}
                />
              )}
              {view === 'Hoja de Vida' && selectedEquipment && (
                <LifeSheet
                  equipment={selectedEquipment}
                  maintenances={state.maintenances.filter(
                    (item) => item.code === selectedEquipment.code
                  )}
                  marks={state.calendarMarks.filter((item) => item.code === selectedEquipment.code)}
                />
              )}
              {view === 'Personal' && (
                <PersonnelView personnel={state.personnel} onNew={() => setModal('personnel')} />
              )}
            </>
          )}
        </div>
      </main>
      {toast && <div className='g-toast'>{toast}</div>}
      {modal && (
        <div className='g-modal-backdrop' role='presentation'>
          <div
            className='g-modal g-modal-wide'
            role='dialog'
            aria-modal='true'
            aria-label='Formulario'
          >
            <button
              className='g-close'
              onClick={() => {
                setModal(null);
                setEditingEquipment(null);
                setEditingMaintenance(null);
              }}
            >
              x
            </button>
            {modal === 'import' && (
              <Panel title='Importar macro GIBBOR'>
                <div className='g-import-box'>
                  <strong>Sube el archivo .xlsm o .xlsx</strong>
                  <p>
                    La app lee equipos, personal, registros de mantenimiento, programacion y estados
                    E/R/N/P. Despues puedes seguir trabajando desde la plataforma.
                  </p>
                  <input
                    aria-label='Importar macro'
                    type='file'
                    accept='.xlsm,.xlsx'
                    onChange={importWorkbook}
                    disabled={importing}
                  />
                  {importing && <small>Convirtiendo macro en datos...</small>}
                </div>
              </Panel>
            )}
            {modal === 'equipment' && (
              <EquipmentForm
                equipment={editingEquipment}
                frequencies={state.frequencies}
                personnel={state.personnel}
                onSubmit={upsertEquipment}
              />
            )}
            {modal === 'maintenance' && (
              <MaintenanceForm
                entry={editingMaintenance}
                selectedCode={selectedEquipment?.code || ''}
                equipment={state.equipment}
                personnel={state.personnel}
                onSubmit={upsertMaintenance}
              />
            )}
            {modal === 'status' && (
              <StatusForm
                selectedCode={selectedEquipment?.code || ''}
                equipment={state.equipment}
                personnel={state.personnel}
                onSubmit={registerStatus}
              />
            )}
            {modal === 'personnel' && (
              <Panel title='Nuevo tecnico / responsable'>
                <form onSubmit={upsertPersonnel}>
                  <label>
                    Nombre
                    <input aria-label='Nombre del personal' name='name' required />
                  </label>
                  <div className='g-form-actions'>
                    <button className='g-primary'>Guardar</button>
                  </div>
                </form>
              </Panel>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function upsertMark(marks: CalendarMark[], mark: CalendarMark) {
  const exists = marks.some((item) => item.code === mark.code && item.date === mark.date);
  return exists
    ? marks.map((item) =>
        item.code === mark.code && item.date === mark.date
          ? { ...item, status: mark.status, note: mark.note }
          : item
      )
    : [mark, ...marks];
}

function EmptyState({
  onImport,
  onNewEquipment
}: {
  onImport: () => void;
  onNewEquipment: () => void;
}) {
  return (
    <section className='g-card g-empty-state'>
      <p className='eyebrow'>SIN DATOS DEMO</p>
      <h2>La plataforma esta lista para operar con datos reales.</h2>
      <p>
        Importa la macro existente o carga el primer equipo manualmente. Desde ese momento la app
        calcula programacion, dias faltantes, estados, utilidad y hoja de vida.
      </p>
      <div className='g-actions'>
        <button className='g-primary' onClick={onImport}>
          Importar macro
        </button>
        <button className='g-secondary' onClick={onNewEquipment}>
          Cargar equipo manual
        </button>
      </div>
    </section>
  );
}

function Summary({
  state,
  metrics,
  setView,
  onStatus
}: {
  state: MaintenanceState;
  metrics: ReturnType<typeof buildMetricsPlaceholder>;
  setView: (view: View) => void;
  onStatus: () => void;
}) {
  const cards = [
    ['Equipos activos', state.equipment.length, 'Base de equipos y clientes', 'navy'],
    ['Mantenimientos', state.maintenances.length, 'Preventivos y correctivos', 'green'],
    ['Por vencer', metrics.dueSoon, 'Proximos 15 dias', 'orange'],
    ['Vencidos', metrics.overdue, 'Requieren gestion', 'blue']
  ];

  return (
    <>
      <section className='g-kpis'>
        {cards.map((card) => (
          <article key={card[0]}>
            <div className={'g-kpi-icon ' + card[3]}>{card[0].toString().slice(0, 2)}</div>
            <div>
              <p>{card[0]}</p>
              <h2>{card[1]}</h2>
              <small>{card[2]}</small>
            </div>
          </article>
        ))}
      </section>
      <section className='g-dashboard-grid'>
        <article className='g-card'>
          <div className='g-card-head'>
            <div>
              <h3>Indicadores de la macro</h3>
              <p>Cumplimiento, efectividad y estados E/R/N/P</p>
            </div>
            <button onClick={onStatus}>Registrar ejecucion</button>
          </div>
          <div className='g-mini-kpis'>
            <div>
              <p>Cumplimiento</p>
              <strong>{percent.format(metrics.compliance)}</strong>
            </div>
            <div>
              <p>Efectividad</p>
              <strong>{percent.format(metrics.effectiveness)}</strong>
            </div>
            <div>
              <p>Ejecutados</p>
              <strong className='positive'>{metrics.executed}</strong>
            </div>
            <div>
              <p>No ejecutados</p>
              <strong className='negative'>{metrics.notExecuted}</strong>
            </div>
          </div>
          <div className='g-status-row'>
            {(['E', 'R', 'N', 'P'] as StatusCode[]).map((status) => (
              <span className={'g-status ' + statusClass(status)} key={status}>
                {status} · {statusLabels[status]}
              </span>
            ))}
          </div>
        </article>
        <article className='g-card'>
          <div className='g-card-head'>
            <div>
              <h3>Resumen economico</h3>
              <p>Replica Registro Mto y RESUMEN</p>
            </div>
            <button onClick={() => setView('Registro')}>Ver registro</button>
          </div>
          <div className='g-mini-kpis'>
            <div>
              <p>Ingresos</p>
              <strong>{money.format(metrics.income)}</strong>
            </div>
            <div>
              <p>MO + insumos</p>
              <strong>{money.format(metrics.cost)}</strong>
            </div>
            <div>
              <p>Utilidad</p>
              <strong className={metrics.utility >= 0 ? 'positive' : 'negative'}>
                {money.format(metrics.utility)}
              </strong>
            </div>
            <div>
              <p>Correctivos</p>
              <strong>{metrics.corrective}</strong>
            </div>
          </div>
        </article>
      </section>
      <section className='g-bottom-grid'>
        <article className='g-card'>
          <div className='g-card-head'>
            <div>
              <h3>Proximos mantenimientos</h3>
              <p>Calculados desde ultimo preventivo + frecuencia</p>
            </div>
            <button onClick={() => setView('Programacion')}>Abrir programacion</button>
          </div>
          <SchedulePreview schedule={metrics.schedule.slice(0, 7)} />
        </article>
        <article className='g-card g-alert'>
          <div className='g-card-head'>
            <div>
              <h3>Distribucion utilidad</h3>
              <p>Segun porcentajes de la macro RESUMEN</p>
            </div>
          </div>
          {[
            ['GIBBOR Soluciones', 0.3],
            ['Representante legal', 0.4],
            ['Coordinacion administrativa', 0.15],
            ['Gerente', 0.075],
            ['Analista RRHH', 0.075]
          ].map(([label, rate]) => (
            <div className='g-alert-row info' key={String(label)}>
              <span>{Math.round(Number(rate) * 100)}%</span>
              <div>
                <strong>{label}</strong>
                <p>{money.format(metrics.utility * Number(rate))}</p>
              </div>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}

function buildMetricsPlaceholder() {
  return {
    executed: 0,
    reprogrammed: 0,
    notExecuted: 0,
    pendingMarked: 0,
    income: 0,
    cost: 0,
    utility: 0,
    preventive: 0,
    corrective: 0,
    dueSoon: 0,
    overdue: 0,
    compliance: 0,
    effectiveness: 0,
    schedule: [] as { equipment: Equipment; next: string; days: number | null }[]
  };
}

function SchedulePreview({
  schedule
}: {
  schedule: { equipment: Equipment; next: string; days: number | null }[];
}) {
  return (
    <div className='g-project-list'>
      {schedule.map((item) => (
        <div key={item.equipment.code}>
          <div className='g-project-row'>
            <span className='g-project-icon'>{item.equipment.code}</span>
            <p>
              <strong>{equipmentName(item.equipment)}</strong>
              <small>
                {dateLabel(item.next)} · {item.days === null ? 'sin calculo' : item.days + ' dias'}
              </small>
            </p>
            <b className={item.days !== null && item.days < 0 ? 'negative' : ''}>
              {item.days !== null && item.days < 0 ? 'Vencido' : 'OK'}
            </b>
          </div>
        </div>
      ))}
    </div>
  );
}

function EquipmentTable({
  equipment,
  onSelect,
  onEdit,
  onDelete
}: {
  equipment: Equipment[];
  onSelect: (code: string) => void;
  onEdit: (item: Equipment) => void;
  onDelete: (code: string) => void;
}) {
  return (
    <section className='g-card g-table-card'>
      <table>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Equipo</th>
            <th>Cliente</th>
            <th>Ubicacion</th>
            <th>Frecuencia</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item.code}>
              <td>
                <strong>{item.code}</strong>
              </td>
              <td>
                <strong>{equipmentName(item)}</strong>
                <small>
                  {item.brand} · {item.capacity}
                </small>
              </td>
              <td>{item.client}</td>
              <td>
                {item.location}
                <small>{item.address}</small>
              </td>
              <td>{item.frequencyDays} dias</td>
              <td>{item.phone}</td>
              <td>
                <div className='g-row-actions'>
                  <button
                    type='button'
                    aria-label={`Abrir hoja de vida del equipo ${item.code}`}
                    onClick={() => onSelect(item.code)}
                  >
                    HV
                  </button>
                  <button
                    type='button'
                    aria-label={`Modificar equipo ${item.code}`}
                    onClick={() => onEdit(item)}
                  >
                    Modificar
                  </button>
                  <button
                    type='button'
                    aria-label={`Eliminar equipo ${item.code}`}
                    onClick={() => onDelete(item.code)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProgrammingTable({
  schedule,
  maintenances,
  onSelect,
  onRegister
}: {
  schedule: { equipment: Equipment; next: string; days: number | null }[];
  maintenances: Maintenance[];
  onSelect: (code: string) => void;
  onRegister: (code: string) => void;
}) {
  return (
    <section className='g-card g-table-card'>
      <table>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Equipo</th>
            <th>Ultimo preventivo</th>
            <th>Frecuencia</th>
            <th>Proximo M/to</th>
            <th>Dias faltantes</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item) => {
            const last = lastPreventiveDate(item.equipment.code, maintenances);
            const overdue = item.days !== null && item.days < 0;
            const dueSoon = item.days !== null && item.days >= 0 && item.days <= 15;
            return (
              <tr key={item.equipment.code}>
                <td>
                  <strong>{item.equipment.code}</strong>
                </td>
                <td>{equipmentName(item.equipment)}</td>
                <td>{last ? dateLabel(last) : 'Sin preventivo'}</td>
                <td>{item.equipment.frequencyDays} dias</td>
                <td>{item.next ? dateLabel(item.next) : 'Sin fecha'}</td>
                <td>{item.days ?? '-'}</td>
                <td>
                  <span className={'g-status ' + (overdue ? 'danger' : dueSoon ? 'plan' : 'done')}>
                    {overdue ? 'Vencido' : dueSoon ? 'Pendiente' : 'Al dia'}
                  </span>
                </td>
                <td>
                  <div className='g-row-actions'>
                    <button
                      type='button'
                      aria-label={`Registrar ejecucion del equipo ${item.equipment.code}`}
                      onClick={() => onRegister(item.equipment.code)}
                    >
                      Registrar
                    </button>
                    <button
                      type='button'
                      aria-label={`Abrir hoja de vida del equipo ${item.equipment.code}`}
                      onClick={() => onSelect(item.equipment.code)}
                    >
                      HV
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function MaintenanceTable({
  equipment,
  maintenances,
  onEdit,
  onDelete
}: {
  equipment: Equipment[];
  maintenances: Maintenance[];
  onEdit: (item: Maintenance) => void;
  onDelete: (id: string) => void;
}) {
  const byCode = new Map(equipment.map((item) => [item.code, item]));
  return (
    <section className='g-card g-table-card'>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Codigo</th>
            <th>Equipo</th>
            <th>Tipo</th>
            <th>Descripcion</th>
            <th>Valor</th>
            <th>MO + insumos</th>
            <th>Utilidad</th>
            <th>Personal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {maintenances.map((item) => (
            <tr key={item.id}>
              <td>{dateLabel(item.date)}</td>
              <td>
                <strong>{item.code}</strong>
              </td>
              <td>{equipmentName(byCode.get(item.code))}</td>
              <td>
                <span className={'g-status ' + (item.type === 'PREVENTIVO' ? 'done' : 'plan')}>
                  {item.type}
                </span>
              </td>
              <td>{item.description}</td>
              <td>{money.format(item.value)}</td>
              <td>{money.format(item.laborCost)}</td>
              <td className={item.utility >= 0 ? 'positive' : 'negative'}>
                {money.format(item.utility)}
              </td>
              <td>{item.personnel}</td>
              <td>
                <div className='g-row-actions'>
                  <button
                    type='button'
                    aria-label={`Modificar mantenimiento ${item.id}`}
                    onClick={() => onEdit(item)}
                  >
                    Modificar
                  </button>
                  <button
                    type='button'
                    aria-label={`Eliminar mantenimiento ${item.id}`}
                    onClick={() => onDelete(item.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function CalendarView({
  equipment,
  maintenances,
  marks,
  onRegister
}: {
  equipment: Equipment[];
  maintenances: Maintenance[];
  marks: CalendarMark[];
  onRegister: (code: string) => void;
}) {
  const weeks = useMemo(() => {
    const start = parseDate(todayInput());
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index * 7);
      return toInputDate(date);
    });
  }, []);

  return (
    <section className='g-card g-table-card g-calendar-card'>
      <table>
        <thead>
          <tr>
            <th>Equipo</th>
            {weeks.map((week) => (
              <th key={week}>{dateLabel(week)}</th>
            ))}
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item.code}>
              <td>
                <strong>{item.code}</strong>
                <small>{equipmentName(item)}</small>
              </td>
              {weeks.map((week) => {
                const status = weeklyStatus(item, week, marks, maintenances);
                return (
                  <td key={week}>
                    {status ? (
                      <span className={'g-status g-status-cell ' + statusClass(status)}>
                        {status}
                      </span>
                    ) : (
                      <span className='g-muted-cell'>-</span>
                    )}
                  </td>
                );
              })}
              <td>
                <button onClick={() => onRegister(item.code)}>Registrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function weeklyStatus(
  equipment: Equipment,
  weekStart: string,
  marks: CalendarMark[],
  maintenances: Maintenance[]
) {
  const start = parseDate(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const explicit = marks.find((mark) => {
    if (mark.code !== equipment.code) return false;
    const date = parseDate(mark.date);
    return date >= start && date <= end;
  });
  if (explicit) return explicit.status;

  const next = nextMaintenanceDate(equipment, maintenances);
  if (!next) return null;
  const nextDate = parseDate(next);
  if (nextDate >= start && nextDate <= end) return differenceInDays(next) < 0 ? 'N' : 'P';
  return null;
}

function LifeSheet({
  equipment,
  maintenances,
  marks
}: {
  equipment: Equipment;
  maintenances: Maintenance[];
  marks: CalendarMark[];
}) {
  const next = nextMaintenanceDate(equipment, maintenances);
  return (
    <>
      <section className='g-card g-life-sheet'>
        <div className='g-card-head'>
          <div>
            <h3>Formato hoja de vida de equipos</h3>
            <p>Procedimiento de mantenimiento de instalaciones y equipos</p>
          </div>
          <span className='g-status done'>Version 01</span>
        </div>
        <div className='g-life-grid'>
          <Info label='Codigo' value={equipment.code} />
          <Info label='Equipo' value={equipmentName(equipment)} />
          <Info label='Fecha apertura' value={dateLabel(equipment.openedAt)} />
          <Info label='Marca' value={equipment.brand} />
          <Info label='Capacidad' value={equipment.capacity} />
          <Info label='Cliente' value={equipment.client} />
          <Info label='Direccion' value={equipment.address} />
          <Info label='Ubicacion' value={equipment.location} />
          <Info label='Telefono' value={equipment.phone} />
          <Info label='Caracteristicas' value={equipment.features} />
          <Info label='Frecuencia' value={`${equipment.frequencyDays} dias`} />
          <Info label='Proximo mantenimiento' value={next ? dateLabel(next) : 'Sin calculo'} />
        </div>
      </section>
      <section className='g-card g-table-card'>
        <div className='g-card-head'>
          <div>
            <h3>Historial</h3>
            <p>Preventivos, correctivos y estados del calendario</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>P</th>
              <th>C</th>
              <th>Descripcion</th>
              <th>Personal</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {maintenances.map((item) => (
              <tr key={item.id}>
                <td>{dateLabel(item.date)}</td>
                <td>{item.type === 'PREVENTIVO' ? 'X' : ''}</td>
                <td>{item.type === 'CORRECTIVO' ? 'X' : ''}</td>
                <td>{item.description}</td>
                <td>{item.personnel}</td>
                <td>{money.format(item.value)}</td>
              </tr>
            ))}
            {marks
              .filter((mark) => mark.status !== 'E')
              .map((mark) => (
                <tr key={mark.id}>
                  <td>{dateLabel(mark.date)}</td>
                  <td>{mark.status}</td>
                  <td aria-label='Sin correctivo'>-</td>
                  <td>{mark.note || statusLabels[mark.status]}</td>
                  <td aria-label='Sin personal'>-</td>
                  <td aria-label='Sin valor'>-</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function PersonnelView({ personnel, onNew }: { personnel: string[]; onNew: () => void }) {
  return (
    <section className='g-card'>
      <div className='g-card-head'>
        <div>
          <h3>Personal autorizado</h3>
          <p>Lista que alimenta el registro de mantenimiento</p>
        </div>
        <button onClick={onNew}>Nuevo</button>
      </div>
      <div className='g-chip-list'>
        {personnel.length ? (
          personnel.map((name) => <span key={name}>{name}</span>)
        ) : (
          <p>No hay personal cargado.</p>
        )}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p>{label}</p>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className='eyebrow'>GIBBOR MACRO WEB</p>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function EquipmentForm({
  equipment,
  frequencies,
  personnel,
  onSubmit
}: {
  equipment: Equipment | null;
  frequencies: Frequency[];
  personnel: string[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Panel title={equipment ? 'Modificar equipo' : 'Cargar equipo'}>
      <form onSubmit={onSubmit}>
        <div className='g-fields'>
          <label>
            Codigo
            <input name='code' defaultValue={equipment?.code || ''} required />
          </label>
          <label>
            Equipo / actividad
            <input name='name' defaultValue={equipment?.name || ''} required />
          </label>
        </div>
        <div className='g-fields'>
          <label>
            Marca
            <input name='brand' defaultValue={equipment?.brand || ''} />
          </label>
          <label>
            Cliente
            <input name='client' defaultValue={equipment?.client || ''} />
          </label>
        </div>
        <label>
          Caracteristicas del equipo intervenido
          <textarea name='features' rows={3} defaultValue={equipment?.features || ''} />
        </label>
        <div className='g-fields'>
          <label>
            Modelo
            <input name='model' defaultValue={equipment?.model || ''} />
          </label>
          <label>
            Ubicacion
            <input name='location' defaultValue={equipment?.location || ''} />
          </label>
        </div>
        <div className='g-fields'>
          <label>
            Capacidad
            <input name='capacity' defaultValue={equipment?.capacity || ''} />
          </label>
          <label>
            Telefono
            <input name='phone' defaultValue={equipment?.phone || ''} />
          </label>
        </div>
        <label>
          Direccion
          <input name='address' defaultValue={equipment?.address || ''} />
        </label>
        <div className='g-fields'>
          <label>
            Fecha apertura
            <input name='openedAt' type='date' defaultValue={equipment?.openedAt || todayInput()} />
          </label>
          <label>
            Frecuencia
            <select name='frequencyDays' defaultValue={equipment?.frequencyDays || 120}>
              {frequencies.map((frequency) => (
                <option value={frequency.days} key={frequency.days}>
                  {frequency.days} dias · {frequency.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Quien realiza
          <input
            name='responsible'
            list='personnel-list'
            defaultValue={equipment?.responsible || ''}
          />
        </label>
        <datalist id='personnel-list'>
          {personnel.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </datalist>
        <div className='g-form-actions'>
          <button className='g-primary'>Guardar equipo</button>
        </div>
      </form>
    </Panel>
  );
}

function MaintenanceForm({
  entry,
  selectedCode,
  equipment,
  personnel,
  onSubmit
}: {
  entry: Maintenance | null;
  selectedCode: string;
  equipment: Equipment[];
  personnel: string[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Panel title={entry ? 'Modificar registro' : 'Nuevo registro de mantenimiento'}>
      <form onSubmit={onSubmit}>
        <div className='g-fields'>
          <label>
            Fecha
            <input name='date' type='date' defaultValue={entry?.date || todayInput()} required />
          </label>
          <label>
            Codigo
            <select name='code' defaultValue={entry?.code || selectedCode} required>
              {equipment.map((item) => (
                <option value={item.code} key={item.code}>
                  {item.code} · {equipmentName(item)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className='g-fields'>
          <label>
            Tipo de M/to
            <select name='type' defaultValue={entry?.type || 'PREVENTIVO'}>
              <option value='PREVENTIVO'>PREVENTIVO</option>
              <option value='CORRECTIVO'>CORRECTIVO</option>
            </select>
          </label>
          <label>
            Personal
            <input name='personnel' list='personnel-list' defaultValue={entry?.personnel || ''} />
          </label>
        </div>
        <label>
          Descripcion M/to
          <textarea name='description' rows={4} defaultValue={entry?.description || ''} required />
        </label>
        <div className='g-fields'>
          <label>
            Valor M/to
            <input name='value' type='number' defaultValue={entry?.value || 0} />
          </label>
          <label>
            MO + insumos
            <input name='laborCost' type='number' defaultValue={entry?.laborCost || 0} />
          </label>
        </div>
        <datalist id='personnel-list'>
          {personnel.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </datalist>
        <div className='g-form-actions'>
          <button className='g-primary'>Guardar registro</button>
        </div>
      </form>
    </Panel>
  );
}

function StatusForm({
  selectedCode,
  equipment,
  personnel,
  onSubmit
}: {
  selectedCode: string;
  equipment: Equipment[];
  personnel: string[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Panel title='Registrar ejecucion / estado'>
      <form onSubmit={onSubmit}>
        <div className='g-fields'>
          <label>
            Codigo
            <select name='code' defaultValue={selectedCode} required>
              {equipment.map((item) => (
                <option value={item.code} key={item.code}>
                  {item.code} · {equipmentName(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input name='date' type='date' defaultValue={todayInput()} required />
          </label>
        </div>
        <label>
          Estado
          <select name='status' defaultValue='E'>
            <option value='E'>E · Ejecutado</option>
            <option value='R'>R · Reprogramado</option>
            <option value='N'>N · No ejecutado</option>
            <option value='P'>P · Pendiente</option>
          </select>
        </label>
        <label>
          Observacion
          <textarea name='note' rows={3} />
        </label>
        <div className='g-fields'>
          <label>
            Valor M/to si fue ejecutado
            <input name='value' type='number' defaultValue={0} />
          </label>
          <label>
            MO + insumos
            <input name='laborCost' type='number' defaultValue={0} />
          </label>
        </div>
        <label>
          Personal
          <input name='personnel' list='personnel-list' />
        </label>
        <datalist id='personnel-list'>
          {personnel.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </datalist>
        <div className='g-form-actions'>
          <button className='g-primary'>Registrar</button>
        </div>
      </form>
    </Panel>
  );
}

function statusClass(status: StatusCode) {
  if (status === 'E') return 'done';
  if (status === 'R') return 'plan';
  if (status === 'N') return 'danger';
  return 'pending';
}
