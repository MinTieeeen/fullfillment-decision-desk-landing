import {
  AimOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  ExperimentOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import { Layout as AntLayout, Menu, Segmented, Typography } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLang, type Lang } from '../i18n';

const routes = ['/', '/business', '/demo', '/roadmap'] as const;
const icons = [<HomeOutlined />, <AppstoreOutlined />, <ExperimentOutlined />, <NodeIndexOutlined />];

function useNavLabels() {
  const { t } = useLang();
  const n = t.common.nav;
  return [n.home, n.business, n.demo, n.roadmap];
}

/** Three slanted bars, echoing the deck's mark. */
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

/** Word mark: "Opti" in white, "flo" in a coral-to-crimson gradient. */
export function BrandName() {
  return (
    <span className="brand-text">
      Opti<span className="brand-flo">flo</span>
    </span>
  );
}

export function Tagline() {
  return (
    <span className="tagline">
      PLAN<b>•</b>ANALYZE<b>•</b>DELIVER
    </span>
  );
}

/** Renders a headline with its last word in the accent colour. */
export function Accented({ text }: { text: string }) {
  const i = text.trimEnd().lastIndexOf(' ');
  if (i < 0) return <span className="hl">{text}</span>;
  return (
    <>
      {text.slice(0, i + 1)}
      <span className="hl">{text.slice(i + 1)}</span>
    </>
  );
}

export function Layout() {
  const { t, lang, setLang } = useLang();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const labels = useNavLabels();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <AntLayout.Header className={`app-header ${scrolled ? 'scrolled' : ''}`} style={{ padding: 0 }}>
        <div className="container inner">
          <Link to="/" className="brand" aria-label="Optiflo">
            <BrandMark />
            <BrandName />
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            onClick={(e) => navigate(e.key)}
            items={routes.map((r, i) => ({ key: r, icon: icons[i], label: labels[i] }))}
          />
          <Segmented<Lang>
            className="lang-switch"
            size="small"
            value={lang}
            onChange={setLang}
            options={[
              { label: 'VI', value: 'vi' },
              { label: 'EN', value: 'en' },
            ]}
          />
        </div>
      </AntLayout.Header>
      <AntLayout.Content>
        <main key={pathname} className={pathname === '/' ? 'page flush' : 'page'}>
          <span className="deco tl" />
          <span className="deco tr" />
          <Outlet />
          <NextPage />
        </main>
      </AntLayout.Content>
      <footer className="footer">
        <div className="container">
          <span>{t.common.footer}</span>
          <Tagline />
        </div>
      </footer>
    </AntLayout>
  );
}

interface ActionBarProps {
  to: string;
  title: string;
  sub: string;
  icon?: ReactNode;
}

/** Wide crimson bar with an icon, two lines of text and a round arrow, as on the deck's cover. */
export function ActionBar({ to, title, sub, icon }: ActionBarProps) {
  return (
    <Link to={to} className="action-bar">
      <span className="ab-icon">{icon ?? <AimOutlined />}</span>
      <span className="ab-text">
        <strong>{title}</strong>
        <span>{sub}</span>
      </span>
      <span className="ab-go">
        <ArrowRightOutlined />
      </span>
    </Link>
  );
}

function NextPage() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const labels = useNavLabels();
  const i = routes.indexOf(pathname as (typeof routes)[number]);
  // Home ends with its own call to action, so it gets no "next page" bar.
  if (i <= 0 || i === routes.length - 1) return null;
  return (
    <div className="container next-page">
      <ActionBar to={routes[i + 1]} title={labels[i + 1]} sub={t.common.next} />
    </div>
  );
}

interface BlockProps {
  q?: string;
  title: string;
  lead?: string;
  takeaway?: string;
  caveat?: string;
  children?: ReactNode;
}

/** Shared frame for every content block: question → one-line answer → explanation → evidence → takeaway. */
export function Block({ q, title, lead, takeaway, caveat, children }: BlockProps) {
  return (
    <section className="block">
      <div className="container">
        {q && <span className="eyebrow">{q}</span>}
        <h2 className="title">{title}</h2>
        {lead && <p className="lead">{lead}</p>}
        {children}
        {takeaway && (
          <div className="takeaway">
            <BulbOutlined style={{ marginTop: 3 }} />
            <span>{takeaway}</span>
          </div>
        )}
        {caveat && (
          <p className="caveat">
            <InfoCircleOutlined /> {caveat}
          </p>
        )}
      </div>
    </section>
  );
}

export function PageHead({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div className="container">
        <div className="head-top">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : <span />}
          <Tagline />
        </div>
        <Typography.Title level={1}>
          <Accented text={title} />
        </Typography.Title>
        <p className="lead">{lead}</p>
        {children}
      </div>
    </div>
  );
}

/** Heading block for landing-style sections: eyebrow, H2 and an optional lead. */
export function SectionHead({ q, title, lead, center }: { q: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div className={center ? 'section-head center' : 'section-head'}>
      <span className="eyebrow">{q}</span>
      <h2 className="title">{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

/** Small "click for details" affordance shown at the bottom of clickable cards. */
export function More({ children }: { children: ReactNode }) {
  return (
    <span className="more">
      {children} <ArrowRightOutlined />
    </span>
  );
}
