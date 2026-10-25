import { CloudServerOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Checkbox, Col, Collapse, InputNumber, Row, Space, Switch, Table, Tag } from 'antd';
import { productBySku } from '../data/catalog';
import { allocatableOf } from '../engine/engine';
import type { Analysis, Network, NormalizedSource, Service, Source } from '../engine/types';
import { useLang } from '../i18n';

interface Props {
  network: Network;
  analysis: Analysis;
  onChange: (n: Network) => void;
  onReset: () => void;
}

interface Row_ {
  key: string;
  n: NormalizedSource;
  sku: string;
  first: boolean;
  span: number;
}

export function Lookup({ network, analysis, onChange, onReset }: Props) {
  const { t, lang } = useLang();
  const l = t.demo.lookup;
  const skus = Object.keys(analysis.demand);

  const updateSource = (id: string, fn: (s: Source) => Source) =>
    onChange({ ...network, sources: network.sources.map((s) => (s.id === id ? fn(structuredClone(s)) : s)) });
  const updateService = (id: string, sid: string, patch: Partial<Service>) =>
    updateSource(id, (s) => ({ ...s, services: s.services.map((v) => (v.id === sid ? { ...v, ...patch } : v)) }));
  const setStock = (id: string, sku: string, field: 'physical' | 'reserved', v: number | null) =>
    updateSource(id, (x) => {
      x.stock[sku] = { ...{ physical: 0, reserved: 0, protected: 0 }, ...x.stock[sku], [field]: Math.max(0, Number(v ?? 0)) };
      return x;
    });

  const rows: Row_[] = analysis.normalized.flatMap((n) =>
    skus.map((sku, i) => ({ key: n.source.id + sku, n, sku, first: i === 0, span: skus.length })),
  );
  const span = (r: Row_) => ({ rowSpan: r.first ? r.span : 0 });

  return (
    <Card
      title={
        <Space>
          <CloudServerOutlined style={{ color: 'var(--primary)' }} />
          {l.title}
        </Space>
      }
    >
      <p className="muted small" style={{ marginTop: 0 }}>
        {l.lead}
      </p>
      <Table<Row_>
        size="small"
        pagination={false}
        scroll={{ x: 820 }}
        dataSource={rows}
        rowClassName={(r) => (r.n.eligible ? '' : 'excluded-row')}
        columns={[
          {
            title: l.source,
            onCell: span,
            render: (_, r) => (
              <div style={{ opacity: r.n.eligible ? 1 : 0.55 }}>
                <strong>{r.n.source.name}</strong>
                <div className="muted small">
                  {l.kind[r.n.source.kind]} · {r.n.source.distanceKm} km
                </div>
                {!r.n.eligible && <Tag color="red">{r.n.reasons.map((x) => t.demo.pipe.reasons[x]).join(', ')}</Tag>}
              </div>
            ),
          },
          {
            title: 'SKU',
            render: (_, r) => (
              <>
                {r.sku}
                <div className="muted small">{productBySku(r.sku)?.name[lang]}</div>
              </>
            ),
          },
          { title: l.physical, align: 'right', render: (_, r) => <span className="num">{r.n.source.stock[r.sku]?.physical ?? 0}</span> },
          {
            title: l.reserved,
            align: 'right',
            render: (_, r) => <span className="num muted">{r.n.source.stock[r.sku]?.reserved ? `−${r.n.source.stock[r.sku].reserved}` : 0}</span>,
          },
          {
            title: l.protected,
            align: 'right',
            render: (_, r) => <span className="num muted">{r.n.source.stock[r.sku]?.protected ? `−${r.n.source.stock[r.sku].protected}` : 0}</span>,
          },
          {
            title: l.allocatable,
            align: 'right',
            render: (_, r) => (
              <Tag color="magenta" className="num" style={{ fontWeight: 700, marginInlineEnd: 0 }}>
                {allocatableOf(r.n.source.stock[r.sku])}
              </Tag>
            ),
          },
          {
            title: l.updated,
            onCell: span,
            render: (_, r) => {
              const stale = r.n.source.dataAgeMin > network.settings.staleThresholdMin;
              return <Badge status={stale ? 'warning' : 'success'} text={l.minAgo(r.n.source.dataAgeMin)} />;
            },
          },
          {
            title: l.services,
            onCell: span,
            render: (_, r) =>
              r.n.source.services.map((s) => (
                <div key={s.id} className="small" style={!s.available || s.cutoffPassed ? { textDecoration: 'line-through', opacity: 0.5 } : undefined}>
                  <Tag color={s.id === 'express' ? 'gold' : 'default'} style={{ marginInlineEnd: 4 }}>
                    {t.demo.choice.service[s.id]}
                  </Tag>
                  {s.fixedCost}+{s.perUnitCost}
                  {l.perUnit} · {s.hours}h{l.cap(s.maxLoadKg)}
                </div>
              )),
          },
        ]}
      />

      <Collapse
        style={{ marginTop: 16 }}
        items={[
          {
            key: 'sim',
            label: (
              <Space>
                <SettingOutlined />
                <strong>{l.simTitle}</strong>
              </Space>
            ),
            children: (
              <>
                <p className="muted small" style={{ marginTop: 0 }}>
                  {l.simLead}
                </p>
                <Row gutter={[12, 12]}>
                  {network.sources.map((s) => (
                    <Col xs={24} lg={8} key={s.id}>
                      <Card size="small" title={s.name} className="card-fill">
                        {skus.map((sku) => (
                          <Space key={sku} wrap size={6} style={{ marginBottom: 6 }}>
                            <Tag>{sku}</Tag>
                            <InputNumber size="small" min={0} style={{ width: 120 }} addonBefore={l.physical} value={s.stock[sku]?.physical ?? 0} onChange={(v) => setStock(s.id, sku, 'physical', v)} />
                            <InputNumber size="small" min={0} style={{ width: 120 }} addonBefore={l.reserved} value={s.stock[sku]?.reserved ?? 0} onChange={(v) => setStock(s.id, sku, 'reserved', v)} />
                          </Space>
                        ))}
                        <Space direction="vertical" size={4} style={{ marginTop: 6 }}>
                          <Space>
                            <Switch
                              size="small"
                              checked={s.dataAgeMin > network.settings.staleThresholdMin}
                              onChange={(c) => updateSource(s.id, (x) => ({ ...x, dataAgeMin: c ? 360 : 5 }))}
                            />
                            <span className="small">{l.stale}</span>
                          </Space>
                          <Space>
                            <Switch size="small" checked={s.ready} onChange={(c) => updateSource(s.id, (x) => ({ ...x, ready: c }))} />
                            <span className="small">{l.ready}</span>
                          </Space>
                        </Space>
                        {s.services.map((v) => (
                          <div key={v.id} style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--line)' }}>
                            <strong className="small">{t.demo.choice.service[v.id]}</strong>
                            <Space wrap size={8} style={{ marginTop: 4, display: 'flex' }}>
                              <Checkbox checked={v.available} onChange={(e) => updateService(s.id, v.id, { available: e.target.checked })}>
                                <span className="small">{l.available}</span>
                              </Checkbox>
                              <Checkbox checked={v.cutoffPassed} onChange={(e) => updateService(s.id, v.id, { cutoffPassed: e.target.checked })}>
                                <span className="small">{l.cutoff}</span>
                              </Checkbox>
                              {v.maxLoadKg != null && (
                                <InputNumber
                                  size="small"
                                  min={0}
                                  style={{ width: 110 }}
                                  addonAfter="kg"
                                  value={v.maxLoadKg}
                                  onChange={(x) => updateService(s.id, v.id, { maxLoadKg: Math.max(0, Number(x ?? 0)) })}
                                />
                              )}
                            </Space>
                          </div>
                        ))}
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Space wrap style={{ marginTop: 14 }}>
                  <strong className="small">{l.feeTitle}:</strong>
                  <InputNumber
                    size="small"
                    min={0}
                    addonBefore={l.feeStd}
                    addonAfter="SEK"
                    value={network.settings.customerFee.standard}
                    onChange={(v) => onChange({ ...network, settings: { ...network.settings, customerFee: { ...network.settings.customerFee, standard: Number(v ?? 0) } } })}
                  />
                  <InputNumber
                    size="small"
                    min={0}
                    addonBefore={l.feeExp}
                    addonAfter="SEK"
                    value={network.settings.customerFee.express}
                    onChange={(v) => onChange({ ...network, settings: { ...network.settings, customerFee: { ...network.settings.customerFee, express: Number(v ?? 0) } } })}
                  />
                  <Button size="small" icon={<ReloadOutlined />} onClick={onReset}>
                    {l.reset}
                  </Button>
                </Space>
              </>
            ),
          },
        ]}
      />
    </Card>
  );
}
