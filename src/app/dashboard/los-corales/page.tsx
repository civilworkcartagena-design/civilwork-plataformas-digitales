const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

const kpis = [
  { label: 'Contrato protegido', value: 171542976, note: 'AIU 3/3/3 + IVA sobre utilidad' },
  { label: 'Costo directo', value: 156254703, note: 'Escenario mercado protegido' },
  { label: 'Holgura frente a 180M', value: 8457024, note: 'Margen comercial disponible' }
];

const chapters = [
  {
    name: 'Electrico',
    amount: 25000000,
    status: 'Cerrar alcance',
    scope:
      'Puntos de iluminacion, tomas, tomas zona humeda, circuitos dedicados, tableros, protecciones, alimentador, medicion independiente, puesta a tierra y pruebas.',
    decision: 'Separarlo como capitulo propio para evitar doble conteo con la base tecnica.'
  },
  {
    name: 'Fachada',
    amount: 12000000,
    status: 'Agregar',
    scope:
      'Resanes, preparacion, acabado exterior, pintura, remates visibles y adecuacion funcional del frente para dos viviendas.',
    decision: 'No debe quedar en cero; separar ventaneria y puerta principal si se cotizan aparte.'
  },
  {
    name: 'Ventaneria primer piso',
    amount: null,
    status: 'Por cotizar',
    scope:
      'Puerta-ventana corrediza piso-techo del primer piso segun render, perfileria, vidrio, instalacion, sellos y remates.',
    decision: 'Crear item independiente para que no quede escondido dentro de fachada.'
  },
  {
    name: 'Puerta principal primer piso',
    amount: null,
    status: 'Por definir',
    scope: 'Puerta principal de acceso, marco, cerradura, instalacion y remates contra fachada.',
    decision: 'Definir material: metalica, madera, aluminio o seguridad.'
  },
  {
    name: 'Patio y zona de labores',
    amount: null,
    status: 'Incluir alcance',
    scope:
      'Piso o afinado, drenaje, pendientes, lavadero, punto hidraulico/sanitario, enchape puntual, pintura, impermeabilizacion y puerta de acceso si aplica.',
    decision:
      'Debe quedar como capitulo visible porque requiere intervencion tecnica, no solo limpieza.'
  },
  {
    name: 'Cocinas acero inoxidable',
    amount: 12000000,
    status: 'Mantener',
    scope:
      'Dos cocinas basicas de 3.50 ml, acero inoxidable, meson, lavaplatos, herrajes y montaje.',
    decision: 'No usar valor anterior de RH.'
  },
  {
    name: 'Banos terminados',
    amount: 11200000,
    status: 'Subir',
    scope:
      'Cuatro banos basicos terminados con impermeabilizacion, enchape, aparatos, griferia y remates.',
    decision: 'Minimo 2.8M por bano.'
  },
  {
    name: 'Puertas y closets',
    amount: 14000000,
    status: 'Mantener',
    scope: 'Paquete basico de puertas interiores y closets para las dos viviendas.',
    decision: 'No dejar closets en cero.'
  }
];

export default function LosCoralesPage() {
  return (
    <main className='flex flex-1 flex-col gap-6 p-4 md:p-8'>
      <section>
        <p className='text-sm text-muted-foreground'>Civil Work Project Dashboard</p>
        <h1 className='text-3xl font-semibold tracking-tight'>Los Corales</h1>
        <p className='mt-2 max-w-3xl text-muted-foreground'>
          Analisis rapido de alcance, capitulos criticos y presupuesto protegido para dos viviendas
          independientes.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        {kpis.map((item) => (
          <div key={item.label} className='rounded-lg border bg-card p-4'>
            <p className='text-sm text-muted-foreground'>{item.label}</p>
            <p className='mt-2 text-2xl font-semibold'>{money.format(item.value)}</p>
            <p className='mt-1 text-sm text-muted-foreground'>{item.note}</p>
          </div>
        ))}
      </section>

      <section className='rounded-lg border bg-card'>
        <div className='border-b p-4'>
          <h2 className='text-xl font-semibold'>Capitulos de alcance</h2>
          <p className='text-sm text-muted-foreground'>
            Primera matriz para no perder partidas como electrico, fachada, ventaneria, puerta
            principal y patio.
          </p>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-[900px] text-sm'>
            <thead className='bg-muted/50 text-left'>
              <tr>
                <th className='p-3 font-medium'>Capitulo</th>
                <th className='p-3 font-medium'>Valor base</th>
                <th className='p-3 font-medium'>Estado</th>
                <th className='p-3 font-medium'>Incluye</th>
                <th className='p-3 font-medium'>Decision</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr key={chapter.name} className='border-t align-top'>
                  <td className='p-3 font-medium'>{chapter.name}</td>
                  <td className='p-3'>
                    {chapter.amount ? money.format(chapter.amount) : 'Por cotizar'}
                  </td>
                  <td className='p-3'>{chapter.status}</td>
                  <td className='p-3 text-muted-foreground'>{chapter.scope}</td>
                  <td className='p-3 text-muted-foreground'>{chapter.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
