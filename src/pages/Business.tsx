import { ApartmentOutlined, CheckCircleFilled, CloseCircleFilled, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { Col, Descriptions, Drawer, List, Row, Segmented, Space, Steps, Switch, Table, Tag, Timeline } from 'antd';
import { useState, type ReactNode } from 'react';
import { More, PageHead, SectionHead } from '../components/ui';
import { activityGroups, deepDives } from '../data/business';
import { useLang } from '../i18n';
import { palette } from '../theme';

export default function Business() {
  const { t, lang } = useLang();
  const b = t.business;
  const [detail, setDetail] = useState<{ title: string; body: ReactNode } | null>(null);
  const [onlyHits, setOnlyHits] = useState(false);
  const [view, setView] = useState<'asis' | 'tobe'>('tobe');

  const openGroup = (gi: number) => {
    const g = activityGroups[gi];
    setDetail({
      title: `${g.letter} · ${g.name[lang]}`,
      body: (
        <List
          size="small"
          dataSource={g.items.map((it, i) => ({ ...it, i }))}
          renderItem={(it) => (
            <List.Item style={{ opacity: onlyHits && !it.hit ? 0.35 : 1 }} extra={it.hit ? <Tag color="magenta">{b.ops.tag}</Tag> : null}>
              <span>
                <span className="muted num">
                  {g.letter}.{it.i + 1}
                </span>{' '}
                {it.text[lang]}
              </span>
            </List.Item>
          )}
        />
      ),
    });
  };

  const openDeep = (di: number) => {
    const d = deepDives[di];
    setDetail({
      title: d.title[lang],
      body: (
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <p className="prose" style={{ margin: 0 }}>
            {d.why[lang]}
          </p>
          <div>
            <strong>{b.ops.investigate}</strong>
            <ul className="ticks todo">
              {d.investigate.map((x) => (
                <li key={x.en}>{x[lang]}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>{b.ops.chain}</strong>
            <Timeline
              style={{ marginTop: 12, marginBottom: -18 }}
              items={d.chain.map((x, i) => ({ children: x[lang], color: i === d.chain.length - 1 ? 'red' : 'gray' }))}
            />
          </div>
          <Descriptions
            column={1}
            size="small"
            bordered
            items={[
              { key: 'kpi', label: b.ops.kpi, children: d.kpi[lang] },
              { key: 'note', label: b.ops.note, children: <span className="muted">{d.note[lang]}</span> },
            ]}
          />
          <div className="takeaway" style={{ marginTop: 0 }}>
            {b.ops.link}: {d.link[lang]}
          </div>
        </Space>
      ),
    });
  };

  const openStep = (i: number) => {
    const s = b.journey.steps[i];
    setDetail({
      title: `0${i + 1} · ${s.t}`,
      body: (
        <Descriptions
          column={1}
          bordered
          size="small"
          items={[
            { key: 'who', label: <UserOutlined />, children: s.who },
            { key: 'data', label: <ApartmentOutlined />, children: s.data },
            { key: 'issue', label: <WarningOutlined style={{ color: palette.bad }} />, children: <span style={{ color: palette.bad }}>{s.issue}</span> },
          ]}
        />
      ),
    });
  };

  return (
    <>
      <PageHead eyebrow={t.common.nav.business} title={b.title} lead={b.lead} />

      {/* Who they are */}
      <section className="section">
        <div className="container">
          <Row gutter={[{ xs: 16, lg: 56 }, 32]} align="middle">
            <Col xs={24} lg={13}>
              <SectionHead q={b.who.q} title={b.who.title} />
              <p className="prose">{b.who.body}</p>
            </Col>
            <Col xs={24} lg={11}>
              <div className="stat-stack">
                {b.who.stats.map((s) => (
                  <div key={s.k} className="stat-row">
                    <span className="stat-v">{s.v}</span>
                    <span className="stat-k">{s.k}</span>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* How it earns */}
      <section className="section alt">
        <div className="container">
          <Row gutter={[{ xs: 16, lg: 56 }, 32]} align="middle" style={{ flexDirection: 'row-reverse' }}>
            <Col xs={24} lg={12}>
              <SectionHead q={b.money.q} title={b.money.title} />
              <p className="prose">{b.money.body}</p>
            </Col>
            <Col xs={24} lg={12}>
              <div className="visual-card">
                <div className="small muted">{b.money.revenue}</div>
                <Space wrap size={[8, 8]} style={{ margin: '10px 0 22px' }}>
                  {b.money.revenueItems.map((x) => (
                    <Tag key={x} style={{ padding: '5px 12px', fontSize: 13 }}>
                      {x}
                    </Tag>
                  ))}
                </Space>
                <div className="small muted">− {b.money.costs}</div>
                <Space wrap size={[8, 10]} style={{ marginTop: 10 }}>
                  {b.money.drivers.map((d) => (
                    <Tag key={d.t} color={d.hit ? 'magenta' : 'default'} icon={d.hit ? <CheckCircleFilled /> : undefined} style={{ padding: '5px 12px', fontSize: 13 }}>
                      {d.t}
                    </Tag>
                  ))}
                </Space>
                <p className="small" style={{ margin: '18px 0 0', color: palette.light, fontWeight: 600 }}>
                  <CheckCircleFilled /> {b.money.hitLabel}
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* What it runs */}
      <section className="section">
        <div className="container">
          <SectionHead q={b.ops.q} title={b.ops.title} lead={b.ops.body} center />
          <Space style={{ marginBottom: 18 }}>
            <Switch checked={onlyHits} onChange={setOnlyHits} />
            <span>{b.ops.filter}</span>
          </Space>
          <div className="tile-grid">
            {activityGroups.map((g, gi) => {
              const hits = g.items.filter((x) => x.hit);
              return (
                <button
                  key={g.letter}
                  className={`tile clickable ${hits.length ? 'on' : ''}`}
                  style={onlyHits && hits.length === 0 ? { opacity: 0.3 } : undefined}
                  onClick={() => openGroup(gi)}
                >
                  <span className="letter">{g.letter}</span>
                  <strong>{g.name[lang]}</strong>
                  <span className="small muted">{b.ops.count(g.items.length, hits.length)}</span>
                </button>
              );
            })}
          </div>

          <h3 className="sub-title">{b.ops.deepTitle}</h3>
          <Row gutter={[16, 16]}>
            {deepDives.map((d, di) => (
              <Col xs={24} md={8} key={d.title.en}>
                <button className={`tile clickable deep ${d.focus ? 'on' : ''}`} onClick={() => openDeep(di)}>
                  <strong>{d.title[lang]}</strong>
                  <span className="small muted">{d.link[lang]}</span>
                  <More>{t.common.clickDetail}</More>
                </button>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Where orders get stuck */}
      <section className="section alt">
        <div className="container">
          <SectionHead q={b.journey.q} title={b.journey.title} lead={b.journey.body} center />
          <div className="visual-card">
            <Steps
              responsive
              current={-1}
              onChange={openStep}
              items={b.journey.steps.map((s, i) => ({
                title: s.t,
                status: i === 2 || i === 3 ? 'error' : 'finish',
                description: (
                  <>
                    {(i === 2 || i === 3) && <Tag color="red">{b.journey.hot}</Tag>}
                    <More>{t.common.clickDetail}</More>
                  </>
                ),
              }))}
            />
          </div>
        </div>
      </section>

      {/* Three markets */}
      <section className="section">
        <div className="container">
          <Row gutter={[{ xs: 16, lg: 56 }, 32]} align="middle">
            <Col xs={24} lg={10}>
              <SectionHead q={b.markets.q} title={b.markets.title} />
              <p className="prose">{b.markets.body}</p>
            </Col>
            <Col xs={24} lg={14}>
              <div className="market-stack">
                {b.markets.items.map((m, i) => (
                  <div key={m.c} className={`market ${i === 2 ? 'on' : ''}`}>
                    <div className="market-name">
                      {m.c}
                      {i === 2 && <Tag color="magenta">{b.markets.pilot}</Tag>}
                    </div>
                    <div className="small">{m.p}</div>
                    <div className="small muted">{m.d}</div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Who feels it */}
      <section className="section alt">
        <div className="container">
          <SectionHead q={b.people.q} title={b.people.title} center />
          <div className="people-grid">
            {b.people.items.map((s, i) => (
              <div key={s.t} className={`tile ${i === 2 ? 'on' : ''}`}>
                <strong>{s.t}</strong>
                <span className="small">
                  <CheckCircleFilled style={{ color: palette.success }} /> {s.want}
                </span>
                <span className="small muted">
                  <CloseCircleFilled style={{ color: palette.bad }} /> {s.pain}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today versus with Optiflo */}
      <section className="section">
        <div className="container" style={{ maxWidth: 920 }}>
          <SectionHead q={b.compare.q} title={b.compare.title} center />
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <Segmented
              value={view}
              onChange={(v) => setView(v as 'asis' | 'tobe')}
              options={[
                { label: b.compare.asis, value: 'asis' },
                { label: b.compare.tobe, value: 'tobe' },
              ]}
            />
          </div>
          <Table
            pagination={false}
            showHeader={false}
            rowKey={(r) => r[0]}
            dataSource={b.compare.rows}
            columns={[
              { width: '30%', render: (_, r) => <strong>{r[0]}</strong> },
              {
                render: (_, r) =>
                  view === 'asis' ? (
                    <span className="muted">
                      <CloseCircleFilled style={{ color: palette.bad }} /> {r[1]}
                    </span>
                  ) : (
                    <span style={{ fontWeight: 600 }}>
                      <CheckCircleFilled style={{ color: palette.success }} /> {r[2]}
                    </span>
                  ),
              },
            ]}
          />
        </div>
      </section>

      <Drawer open={!!detail} title={detail?.title} width={520} onClose={() => setDetail(null)}>
        {detail?.body}
      </Drawer>
    </>
  );
}
