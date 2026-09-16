import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { META } from '../data/meta';
import { BrandMark, IconCompare, IconGrid, IconHome, IconRadar } from './Icons';
import { Brand } from './Brand';
import { useProfile } from '../context/ProfileContext';

const links = [
  { to: '/', label: 'Inicio', icon: <IconHome />, end: true },
  { to: '/diagnostico', label: 'Diagnóstico', icon: <IconRadar /> },
  { to: '/explorar', label: 'Explorar', icon: <IconGrid /> },
  { to: '/comparar', label: 'Comparar', icon: <IconCompare /> },
];

export function Layout() {
  const { pathname } = useLocation();
  const { profile } = useProfile();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);

  const diagTo = profile.completado ? '/mapa' : '/diagnostico';
  const diagLabel = profile.completado ? 'Mi mapa' : 'Diagnóstico';

  return (
    <>
      <header className="topbar">
        <div className="container">
          <NavLink to="/" className="brand" aria-label="rADAr-P2P, inicio">
            <BrandMark />
            <span>
              <span className="brand-name"><Brand size="sm" /></span>
              <span className="brand-sub"><b>A</b>cademia <b>D</b>e <b>A</b>rbitraje</span>
            </span>
          </NavLink>
          <nav className="topnav" aria-label="Principal">
            <NavLink to="/" end>Inicio</NavLink>
            <NavLink to={diagTo} className={({ isActive }) => (isActive || pathname.startsWith('/diagnostico') || pathname.startsWith('/mapa') ? 'active' : '')}>{diagLabel}</NavLink>
            <NavLink to="/explorar" className={({ isActive }) => (isActive || pathname.startsWith('/plataforma') ? 'active' : '')}>Explorar</NavLink>
            <NavLink to="/otc">OTC</NavLink>
            <NavLink to="/comparar">Comparar</NavLink>
          </nav>
          <span className="rev-pill">Última revisión{' '}<b>{META.ultimaRevision}</b></span>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <span><Brand size="sm" /> · {META.organizacion} · Última revisión: <b>{META.ultimaRevision}</b></span>
          <span>Guía de referencia y recomendador operativo. Los límites, comisiones y requisitos cambian: verificá siempre en cada plataforma. No es asesoría contable ni legal.</span>
        </div>
      </footer>

      <nav className="tabbar" aria-label="Navegación móvil">
        {links.map((l) => {
          const to = l.to === '/diagnostico' ? diagTo : l.to;
          const label = l.to === '/diagnostico' ? diagLabel : l.label;
          return (
            <NavLink key={l.to} to={to} end={l.end} className={({ isActive }) => (isActive || (l.to === '/diagnostico' && (pathname.startsWith('/diagnostico') || pathname.startsWith('/mapa'))) || (l.to === '/explorar' && (pathname.startsWith('/plataforma') || pathname.startsWith('/otc'))) ? 'active' : '')}>
              {l.icon}
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
