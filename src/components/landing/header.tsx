import Link from 'next/link';

export function Header() {
  return (
    <header className='landingNav'>
      <Link
        className='landingBrand'
        href='/gibbor'
        aria-label='Ir a GIBBOR Control y Mantenimiento'
      >
        <span className='landingBrandMark' aria-hidden='true'>
          G
        </span>
        <span>
          <strong>GIBBOR</strong>
          <small>Soluciones S.A.S.</small>
        </span>
      </Link>
      <nav className='landingNavLinks' aria-label='Navegación principal'>
        <a href='#servicios'>Servicios</a>
        <a href='#metodo'>Método</a>
        <a href='#contacto'>Contacto</a>
      </nav>
    </header>
  );
}
