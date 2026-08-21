interface Service {
  title: string;
  text: string;
}

const services: Service[] = [
  {
    title: 'Mantenimiento preventivo y correctivo',
    text: 'Rutinas programadas, lavado técnico, verificación de parámetros eléctricos y de refrigeración, ajustes y reportes de intervención.'
  },
  {
    title: 'Aires acondicionados y equipos',
    text: 'Control de equipos, capacidades, ubicaciones, frecuencias y hoja de vida para clientes residenciales, comerciales e industriales.'
  },
  {
    title: 'Ingeniería y obras de soporte',
    text: 'Adecuaciones, montajes, reparaciones, actividades civiles menores y apoyo técnico para mantener la operación en marcha.'
  },
  {
    title: 'Supervisión técnica y HSE',
    text: 'Acompañamiento en campo, control de calidad, seguridad operativa y cumplimiento en actividades de mantenimiento y obra.'
  }
];

export function Solutions() {
  return (
    <section id='servicios' className='landingSection'>
      <div className='landingSectionHead'>
        <p className='landingEyebrow'>Portafolio</p>
        <h2>Servicios diseñados para activos que no pueden detenerse.</h2>
      </div>
      <div className='landingServiceGrid'>
        {services.map((service, index) => (
          <article className='landingServiceCard' key={service.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
