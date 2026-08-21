import Image from 'next/image';
import Link from 'next/link';

export function CallToAction() {
  return (
    <>
      <section className='landingSplit'>
        <Image
          src='/landing/images/gibbor-portada.png'
          alt='Portada corporativa de GIBBOR con mensaje de ingeniería, supervisión y mantenimiento'
          width={1024}
          height={1536}
          sizes='(max-width: 1100px) 100vw, 40vw'
        />
        <div>
          <p className='landingEyebrow'>Imagen profesional</p>
          <h2>Un lenguaje visual sobrio, técnico y confiable.</h2>
          <p>
            Azul profundo para confianza, dorado para precisión y jerarquía, blanco técnico para
            limpieza visual. La marca debe sentirse lista para propuestas, uniformes, vehículos,
            informes y señalización de obra.
          </p>
          <ul>
            <li>Mensajes cortos con beneficio claro.</li>
            <li>Prueba operativa: registros, planes e indicadores.</li>
            <li>CTA directo a diagnóstico o mantenimiento programado.</li>
          </ul>
        </div>
      </section>
      <section id='contacto' className='landingCta'>
        <p className='landingEyebrow'>Contacto</p>
        <h2>Convirtamos el mantenimiento en un sistema controlado.</h2>
        <p>
          Agenda una revisión inicial y recibe una ruta de acción para tus equipos, instalaciones o
          proyecto.
        </p>
        <div className='landingActions'>
          <Link className='landingBtn landingPrimary' href='/gibbor'>
            Control y mantenimiento GIBBOR
          </Link>
          <a className='landingBtn landingSecondary' href='mailto:gibborsoluciones@gmail.com'>
            gibborsoluciones@gmail.com
          </a>
        </div>
      </section>
    </>
  );
}
