import {
  ArrowRightOutlined,
  CheckCircleFilled,
  ExperimentOutlined,
  FallOutlined,
  RollbackOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  ThunderboltOutlined,
  WarningFilled,
} from '@ant-design/icons';
import { Badge, Button, Col, Collapse, Progress, Row, Space, Steps, Tag, Timeline } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Accented, ActionBar, SectionHead, Tagline } from '../components/ui';
import { useLang } from '../i18n';
import { palette } from '../theme';

const scrollToHow = () => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Stylised product window shown in the hero: an order, its options and the confirmation trail. */
function HeroPreview() {
  const { t } = useLang();
  const p = t.home.preview;
  return (
    <div className="preview-window">
      <div className="preview-bar">
        <span />
        <span />
        <span />
        <strong>{p.window}</strong>
      </div>
      <div className="preview-body">
        <div className="preview-order">
          <div>
            <div className="small muted">{p.order}</div>
            <div className="skeleton" style={{ width: 150 }} />
          </div>
          <Tag color="magenta" icon={<CheckCircleFilled />}>
            {p.looking}
          </Tag>
        </div>
        {p.options.map((o, i) => (
          <div key={o.name} className={`preview-option ${i === 0 ? 'on' : ''}`}>
            <span className="radio" />
            <div style={{ flex: 1 }}>
              <strong>{o.name}</strong>
              <div className="small muted">{o.meta}</div>
            </div>
            {o.rec && (
              <Tag color={palette.accent} style={{ color: palette.deep, fontWeight: 700, marginInlineEnd: 0 }}>
                <StarFilled /> {p.recommended}
              </Tag>
            )}
          </div>
        ))}
        <div className="preview-steps">
          {p.steps.map((s) => (
            <span key={s}>
              <CheckCircleFilled /> {s}
            </span>
          ))}
        </div>
      </div>
      <div className="preview-float">
        <SafetyCertificateOutlined /> {p.done}
      </div>
    </div>
  );
}

function SeeVisual() {
  const { t } = useLang();
  const v = t.home.features.visuals;
  const rows = [
    { name: v.sources[0], pct: 70, live: true },
    { name: v.sources[1], pct: 45, live: true },
    { name: v.sources[2], pct: 85, live: false },
  ];
  return (
    <div className="visual-card">
      <div className="small muted" style={{ marginBottom: 12 }}>
        {v.allocatable}
      </div>
      {rows.map((r) => (
        <div key={r.name} className="visual-row" style={{ opacity: r.live ? 1 : 0.55 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <strong>{r.name}</strong>
            {r.live ? <Badge status="success" text={v.live} /> : <Badge status="warning" text={v.stale} />}
          </div>
          <Progress percent={r.pct} showInfo={false} strokeColor={r.live ? palette.primary : palette.greyLight} size="small" />
        </div>
      ))}
    </div>
  );
}

function ChooseVisual() {
  const { t } = useLang();
  const p = t.home.preview;
  return (
    <div className="visual-card">
      <div className="small muted" style={{ marginBottom: 12 }}>
        {t.home.features.visuals.customerScreen}
      </div>
      <Row gutter={10}>
        {p.options.map((o, i) => (
          <Col span={8} key={o.name}>
            <div className={`mini-option ${i === 0 ? 'on' : ''}`}>
              {i === 0 && <StarFilled style={{ color: palette.accent }} />}
              <strong>{o.name}</strong>
              <span className="small muted">{o.meta}</span>
              <div className="skeleton" style={{ width: '70%', marginTop: 'auto' }} />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

function ConfirmVisual() {
  const { t } = useLang();
  const steps = t.home.features.visuals.timeline;
  const icon = [<CheckCircleFilled />, <CheckCircleFilled />, <WarningFilled />, <RollbackOutlined />, <StarFilled />];
  const color = [palette.success, palette.success, palette.bad, palette.primary, palette.accent];
  return (
    <div className="visual-card">
      <Timeline
        style={{ marginTop: 6, marginBottom: -18 }}
        items={steps.map((s, i) => ({
          dot: <span style={{ color: color[i], fontSize: 16 }}>{icon[i]}</span>,
          children: <span style={i === 2 ? { color: palette.bad } : undefined}>{s}</span>,
        }))}
      />
    </div>
  );
}

const visuals: ReactNode[] = [<SeeVisual key="see" />, <ChooseVisual key="choose" />, <ConfirmVisual key="confirm" />];
const valueIcons = [<FallOutlined />, <SafetyCertificateOutlined />, <ThunderboltOutlined />];

export default function Home() {
  const { t } = useLang();
  const h = t.home;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="head-top" style={{ justifyContent: 'flex-end' }}>
            <Tagline />
          </div>
          <Row gutter={[{ xs: 16, lg: 48 }, 40]} align="middle">
            <Col xs={24} lg={13}>
              <div className="head-top">
                <span className="eyebrow">{h.hero.eyebrow}</span>
              </div>
              <h1>
                <Accented text={h.hero.title} />
              </h1>
              <p className="lead">{h.hero.lead}</p>
              <Space wrap size={12} style={{ marginTop: 28 }}>
                <Link to="/demo">
                  <Button type="primary" size="large" icon={<ExperimentOutlined />}>
                    {h.hero.ctaDemo}
                  </Button>
                </Link>
                <Button size="large" ghost onClick={scrollToHow}>
                  {h.hero.ctaHow}
                </Button>
              </Space>
              <div className="chip-row">
                {h.hero.chips.map((c) => (
                  <span key={c}>
                    <CheckCircleFilled /> {c}
                  </span>
                ))}
              </div>
            </Col>
            <Col xs={24} lg={11}>
              <HeroPreview />
            </Col>
          </Row>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Row gutter={[{ xs: 16, lg: 48 }, 32]} align="middle">
            <Col xs={24} lg={13}>
              <SectionHead q={h.problem.q} title={h.problem.title} />
              {h.problem.paras.map((p) => (
                <p key={p} className="prose">
                  {p}
                </p>
              ))}
            </Col>
            <Col xs={24} lg={11}>
              <blockquote className="quote-card">
                <span className="quote-mark">“</span>
                {h.problem.quote}
              </blockquote>
            </Col>
          </Row>
        </div>
      </section>

      <section className="section alt" id="how">
        <div className="container">
          <SectionHead q={h.features.q} title={h.features.title} lead={h.features.lead} center />
          {h.features.items.map((f, i) => (
            <Row key={f.title} gutter={[{ xs: 16, lg: 48 }, 28]} align="middle" className="feature-row" style={{ flexDirection: i % 2 ? 'row-reverse' : 'row' }}>
              <Col xs={24} lg={12}>
                <div className="step-num">
                  <span>0{i + 1}</span> {f.tag}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="prose">{f.body}</p>
              </Col>
              <Col xs={24} lg={12}>
                {visuals[i]}
              </Col>
            </Row>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Row gutter={[{ xs: 16, lg: 48 }, 32]} align="middle">
            <Col xs={24} lg={10}>
              <SectionHead q={h.fit.q} title={h.fit.title} />
              <p className="prose">{h.fit.body}</p>
            </Col>
            <Col xs={24} lg={14}>
              <div className="flow">
                <div className="flow-col">
                  {h.fit.inputs.map((x) => (
                    <span key={x} className="flow-node">
                      {x}
                    </span>
                  ))}
                </div>
                <ArrowRightOutlined className="flow-arrow" />
                <div className="flow-core">
                  <strong>{h.fit.core}</strong>
                  <span>{h.fit.coreSub}</span>
                </div>
                <ArrowRightOutlined className="flow-arrow" />
                <div className="flow-col">
                  {h.fit.outputs.map((x) => (
                    <span key={x} className="flow-node out">
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead q={h.value.q} title={h.value.title} center />
          <Row gutter={[20, 20]}>
            {h.value.items.map((v, i) => (
              <Col xs={24} md={8} key={v.title}>
                <div className="value-card">
                  <div className={`icon-badge ${i === 1 ? 'dark' : ''}`}>{valueIcons[i]}</div>
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="pilot-band">
            <Row gutter={[{ xs: 16, lg: 40 }, 28]} align="middle">
              <Col xs={24} lg={12}>
                <SectionHead q={h.pilot.q} title={h.pilot.title} />
                <p className="prose">{h.pilot.body}</p>
                <Link to="/roadmap">
                  <Button type="primary" icon={<ArrowRightOutlined />} iconPosition="end">
                    {h.pilot.cta}
                  </Button>
                </Link>
              </Col>
              <Col xs={24} lg={12}>
                <Steps direction="vertical" current={0} items={t.roadmap.phases.items.map((p) => ({ title: p.t, description: p.w }))} />
              </Col>
            </Row>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container" style={{ maxWidth: 860 }}>
          <SectionHead q={h.faq.q} title={h.faq.title} center />
          <Collapse
            accordion
            size="large"
            className="faq"
            defaultActiveKey={['0']}
            items={h.faq.items.map((f, i) => ({
              key: String(i),
              label: <strong>{f.q}</strong>,
              children: (
                <p className="prose" style={{ margin: 0 }}>
                  {f.a}
                </p>
              ),
            }))}
          />
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <ActionBar to="/demo" title={h.cta.title} sub={h.cta.body} icon={<ExperimentOutlined />} />
        </div>
      </section>
    </>
  );
}
