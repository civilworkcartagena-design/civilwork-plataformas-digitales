import type { Metadata } from 'next';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Solutions } from '@/components/landing/solutions';
import { Benefits } from '@/components/landing/benefits';
import { CallToAction } from '@/components/landing/call-to-action';
import { Footer } from '@/components/landing/footer';
import '@/styles/landing-page.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://transformaciondigital.civilwork.com.co'),
  title: 'GIBBOR Soluciones S.A.S. | Ingeniería, supervisión y mantenimiento',
  description:
    'Mantenimiento integral con control, seguridad y trazabilidad para equipos, instalaciones y proyectos.',
  alternates: {
    canonical: 'https://transformaciondigital.civilwork.com.co'
  },
  openGraph: {
    title: 'GIBBOR Soluciones S.A.S. | Ingeniería, supervisión y mantenimiento',
    description:
      'Mantenimiento integral con control, seguridad y trazabilidad para equipos, instalaciones y proyectos.',
    url: 'https://transformaciondigital.civilwork.com.co',
    type: 'website',
    images: [
      {
        url: '/landing/images/gibbor-operacion.png',
        alt: 'GIBBOR Soluciones: ingeniería, supervisión y mantenimiento'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GIBBOR Soluciones S.A.S.',
    description: 'Mantenimiento integral con control, seguridad y trazabilidad.',
    images: ['/landing/images/gibbor-operacion.png']
  }
};

export default function HomePage() {
  return (
    <main className='gibborLanding'>
      <Header />
      <Hero />
      <Benefits />
      <Solutions />
      <CallToAction />
      <Footer />
    </main>
  );
}
