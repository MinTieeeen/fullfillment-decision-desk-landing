import { App as AntApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/ui';
import { LangProvider, useLang } from './i18n';
import Business from './pages/Business';
import Demo from './pages/Demo';
import Home from './pages/Home';
import Roadmap from './pages/Roadmap';
import './styles.css';
import { antTheme } from './theme';

function Themed({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  return (
    <ConfigProvider theme={antTheme} locale={lang === 'vi' ? viVN : enUS}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <Themed>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="business" element={<Business />} />
              <Route path="demo" element={<Demo />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </HashRouter>
      </Themed>
    </LangProvider>
  </StrictMode>,
);
