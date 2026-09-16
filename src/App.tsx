import { HashRouter, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Diagnostico } from './pages/Diagnostico';
import { Mapa } from './pages/Mapa';
import { Explorar } from './pages/Explorar';
import { Plataforma } from './pages/Plataforma';
import { Comparar } from './pages/Comparar';
import { Otc } from './pages/Otc';

/**
 * HashRouter: funciona igual en Netlify, GitHub Pages, un preview estático
 * o abriendo el index.html — sin configurar redirects.
 */
export function App() {
  return (
    <ProfileProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/plataforma/:id" element={<Plataforma />} />
            <Route path="/comparar" element={<Comparar />} />
            <Route path="/otc" element={<Otc />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProfileProvider>
  );
}
