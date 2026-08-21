interface FunnelItem {
  step: string;
  offer: string;
  goal: string;
}

const process: string[] = [
  'Diagnóstico inicial',
  'Plan de mantenimiento',
  'Ejecución segura',
  'Registro y trazabilidad',
  'Seguimiento por indicadores'
];

const funnels: FunnelItem[] = [
  {
    step: 'Entrada',
    offer: 'Revisión o diagnóstico técnico',
    goal: 'Abrir conversación con bajo riesgo para el cliente.'
  },
  {
    step: 'Servicio base',
    offer: 'Mantenimiento preventivo por equipo',
    goal: 'Resolver la necesidad inmediata y demostrar cumplimiento.'
  },
  {
    step: 'Continuidad',
    offer: 'Plan mensual o trimestral de mantenimiento',
    goal: 'Convertir intervenciones sueltas en operación controlada.'
  },
  {
    step: 'Alto valor',
    offer: 'Gestión integral de mantenimiento + supervisión',
    goal: 'Ser aliado técnico permanente para activos, sedes y proyectos.'
  }
];

export function Benefits() {
  return (
    <>
      <section className='landingBrief'>
        <div>
          <p className='landingEyebrow'>Brief estratégico</p>
          <h2>La promesa debe vender tranquilidad operativa.</h2>
        </div>
        <p>
          El sitio debe posicionar a GIBBOR como una empresa de mantenimiento que no solo ejecuta,
          sino que controla: identifica equipos, programa frecuencias, registra intervenciones y
          convierte cada servicio en información útil para el cliente.
        </p>
      </section>
      <section id='metodo' className='landingMethod'>
        <div className='landingMethodCopy'>
          <p className='landingEyebrow'>Método GIBBOR</p>
          <h2>Del diagnóstico al indicador.</h2>
          <p>
            El diferencial comercial está en mostrar orden: cada equipo tiene datos, historial,
            frecuencia, responsable e intervención registrada. Esa trazabilidad vuelve más fácil
            decidir, presupuestar y prevenir fallas.
          </p>
        </div>
        <ol className='landingTimeline'>
          {process.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
      <section className='landingValueLadder'>
        <div className='landingSectionHead'>
          <p className='landingEyebrow'>Ruta comercial</p>
          <h2>Escalera de valor para convertir visitas en clientes.</h2>
        </div>
        <div className='landingLadderGrid'>
          {funnels.map((item) => (
            <article key={item.step}>
              <small>{item.step}</small>
              <h3>{item.offer}</h3>
              <p>{item.goal}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
