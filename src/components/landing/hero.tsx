import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section id='inicio' className='landingHero'>
      <div className='landingHeroCopy'>
        <p className='landingEyebrow'>Ingeniería • supervisión • mantenimiento</p>
        <h1>Mantenimiento integral con control, seguridad y trazabilidad.</h1>
        <p className='landingLead'>
          GIBBOR Soluciones S.A.S. ayuda a empresas, conjuntos y proyectos a mantener sus equipos e
          instalaciones operando con rutinas claras, personal técnico y seguimiento real.
        </p>
        <div className='landingActions'>
          <Link className='landingBtn landingPrimary' href='/venture'>
            Solicitar diagnóstico
          </Link>
          <a className='landingBtn landingSecondary' href='#servicios'>
            Ver servicios
          </a>
        </div>
        <div className='landingProof' aria-label='Indicadores principales'>
          <span>
            <strong>Preventivo</strong>Programación por frecuencia
          </span>
          <span>
            <strong>Correctivo</strong>Respuesta técnica
          </span>
          <span>
            <strong>Control</strong>Registro e indicadores
          </span>
        </div>
      </div>
      <div className='landingHeroMedia'>
        <Image
          src='/landing/images/gibbor-operacion.png'
          alt='Vehículo corporativo de GIBBOR frente a una obra'
          fill
          priority
          sizes='(max-width: 1100px) 100vw, 52vw'
        />
      </div>
    </section>
  );
}
