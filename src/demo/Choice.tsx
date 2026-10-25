import { CheckCircleFilled, EditOutlined, StarFilled, TruckOutlined, UserOutlined, SolutionOutlined } from '@ant-design/icons';
import { Alert, Badge, Button, Card, Col, Descriptions, Input, Row, Segmented, Space, Table, Tag } from 'antd';
import { useState } from 'react';
import { allocationLabel } from '../engine/engine';
import type { Analysis, Network, OptionKind, Order, Plan } from '../engine/types';
import { useLang } from '../i18n';
import { palette } from '../theme';
import { maxDeliveriesOf, samePlan, serviceOf, sourceName } from './helpers';

interface Props {
  analysis: Analysis;
  order: Order;
  network: Network;
  selected: Plan | null;
  onSelect: (p: Plan) => void;
  note: string;
  onNote: (s: string) => void;
  onConfirm: () => void;
  onEditOrder: () => void;
}

interface Offer {
  key: string;
  label: string;
  plan: Plan;
  recommended: boolean;
  kind?: OptionKind;
}

export function Choice({ analysis, order, network, selected, onSelect, note, onNote, onConfirm, onEditOrder }: Props) {
  const { t } = useLang();
  const c = t.demo.choice;
  const [view, setView] = useState<'customer' | 'staff'>('customer');

  const recommendedKind: OptionKind = order.preference === 'fast' ? 'fastest' : 'cheapest';
  let offers: Offer[] = analysis.options.map((o) => ({
    key: o.kind,
    kind: o.kind,
    label: c.kinds[o.kind],
    plan: o.plan,
    recommended: o.kind === recommendedKind || (analysis.options.length === 1 && o.kind === 'cheapest'),
  }));
  const alt = analysis.alternatives;
  if (offers.length === 0 && alt) {
    offers = [
      alt.partial && { key: 'partial', label: c.none.partial(alt.partial.units, alt.partial.plan.hours), plan: alt.partial.plan, recommended: true },
      alt.laterDeadline && { key: 'later', label: c.none.later(alt.laterDeadline.hours), plan: alt.laterDeadline, recommended: !alt.partial },
      alt.moreDeliveries && { key: 'more', label: c.none.more(alt.moreDeliveries.deliveries), plan: alt.moreDeliveries, recommended: false },
    ].filter(Boolean) as Offer[];
  }
  const noFull = analysis.options.length === 0;
  const cheapest = analysis.options.find((o) => o.kind === 'cheapest')?.plan;
  const units = (p: Plan) => p.shipments.reduce((s, x) => s + x.totalUnits, 0);

  const reasonOf = (o: Offer) => {
    if (!o.kind) return o.label;
    if (o.kind === 'cheapest') {
      const base = analysis.baseline;
      const skipped = base
        ? base.shipments.filter((s) => !o.plan.shipments.some((x) => x.sourceId === s.sourceId)).map((s) => sourceName(network, s.sourceId)).join(', ')
        : '';
      return c.reasonCheapest(base ? base.cost - o.plan.cost : 0, skipped);
    }
    if (o.kind === 'balanced') return c.reasonBalanced(o.plan.hours, o.plan.cost - (cheapest?.cost ?? o.plan.cost));
    if (o.kind === 'fastest') return c.reasonFastest(o.plan.hours);
    return c.reasonFewest(o.plan.deliveries);
  };

  const checksOf = (plan: Plan) => {
    const out: string[] = [];
    for (const s of plan.shipments) {
      const n = analysis.normalized.find((x) => x.source.id === s.sourceId);
      const alloc = n ? Object.keys(s.units).reduce((sum, sku) => sum + (n.allocatable[sku] ?? 0), 0) : 0;
      out.push(c.ckStock(s.sourceId, s.totalUnits, alloc));
      const svc = serviceOf(network, s);
      if (svc?.maxLoadKg != null) out.push(c.ckLoad(`${s.sourceId} ${c.service[s.service]}`, s.weightKg, svc.maxLoadKg));
    }
    out.push(c.ckDeadline(plan.hours, noFull ? plan.hours : order.deadlineHours));
    out.push(c.ckDeliveries(plan.deliveries, Math.max(plan.deliveries, maxDeliveriesOf(order))));
    return out;
  };
  const todoOf = (plan: Plan) => [
    c.tcHold(plan.shipments.map((s) => s.sourceId).join(', ')),
    c.tcBook(plan.deliveries),
    ...(plan.deliveries > 1 ? [c.tcSplit] : []),
  ];

  const svcTags = (p: Plan) => (
    <Space size={4} wrap>
      {p.shipments.map((s) => (
        <Tag key={s.sourceId} color={s.service === 'express' ? 'gold' : 'default'}>
          {s.sourceId} {c.service[s.service]}
        </Tag>
      ))}
    </Space>
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Segmented
        value={view}
        onChange={(v) => setView(v as 'customer' | 'staff')}
        options={[
          { value: 'customer', label: c.customerView, icon: <UserOutlined /> },
          { value: 'staff', label: c.staffView, icon: <SolutionOutlined /> },
        ]}
      />

      {noFull && (
        <Alert
          type="warning"
          showIcon
          message={c.none.title}
          description={
            <>
              {view === 'staff' && analysis.blocker && (
                <div>
                  {analysis.blocker === 'stock'
                    ? c.none.staff.stock(Object.entries(analysis.shortage).map(([sku, q]) => `${sku} −${q}`).join(', '))
                    : c.none.staff[analysis.blocker]}
                </div>
              )}
              <span className="muted">{c.none.noFake}</span>
            </>
          }
          action={
            <Button size="small" icon={<EditOutlined />} onClick={onEditOrder}>
              {c.none.reduce}
            </Button>
          }
        />
      )}

      {view === 'customer' ? (
        <Card
          title={c.customerTitle}
          extra={
            <span className="muted small">
              {order.customerName} · {analysis.demandUnits} units
            </span>
          }
          styles={{ header: { background: palette.wash } }}
        >
          <Row gutter={[16, 16]}>
            {offers.map((o) => {
              const sel = samePlan(selected, o.plan);
              const card = (
                <Card hoverable className={`opt-card ${sel ? 'selected' : ''}`} onClick={() => onSelect(o.plan)} aria-pressed={sel}>
                  <strong style={{ fontSize: 17 }}>{o.label}</strong>
                  <span>
                    {o.key === 'partial' ? `${t.common.units(units(o.plan))} · ${t.common.hours(o.plan.hours)}` : c.fullBy(o.plan.hours)}
                  </span>
                  <Tag icon={<TruckOutlined />} style={{ alignSelf: 'flex-start' }}>
                    {t.common.deliveries(o.plan.deliveries)}
                  </Tag>
                  <ul className="small" style={{ margin: 0, paddingLeft: 18, color: palette.ink2 }}>
                    {o.plan.shipments.map((s, i) => (
                      <li key={s.sourceId}>{t.demo.confirm.shipment(i + 1, sourceName(network, s.sourceId), s.totalUnits, s.hours)}</li>
                    ))}
                  </ul>
                  <span className="small muted fee-label">{c.fee}</span>
                  <span className="price num">{t.common.sek(o.plan.customerFee)}</span>
                  <Button type={sel ? 'primary' : 'default'} icon={sel ? <CheckCircleFilled /> : undefined} style={{ alignSelf: 'flex-start' }}>
                    {sel ? c.chosen : c.choose}
                  </Button>
                </Card>
              );
              return (
                <Col xs={24} md={offers.length === 1 ? 12 : 8} key={o.key}>
                  {o.recommended ? (
                    <Badge.Ribbon text={<><StarFilled /> {c.recommended}</>} color={palette.primary}>
                      {card}
                    </Badge.Ribbon>
                  ) : (
                    card
                  )}
                </Col>
              );
            })}
          </Row>
          <div style={{ marginTop: 18 }}>
            <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>
              {c.note}
            </div>
            <Input value={note} placeholder={c.notePh} onChange={(e) => onNote(e.target.value)} />
          </div>
        </Card>
      ) : (
        <Card title={c.staffTitle}>
          <Table
            size="middle"
            pagination={false}
            scroll={{ x: 760 }}
            rowKey="key"
            rowClassName={(r) => (samePlan(selected, r.plan) ? 'ant-table-row-selected' : r.key === 'baseline' ? 'muted' : '')}
            onRow={(r) => ({ onClick: () => r.key !== 'baseline' && onSelect(r.plan), style: { cursor: r.key === 'baseline' ? 'default' : 'pointer' } })}
            dataSource={[
              ...offers,
              ...(analysis.baseline ? [{ key: 'baseline', label: c.baselineRow, plan: analysis.baseline, recommended: false }] : []),
            ]}
            columns={[
              {
                title: c.head[0],
                render: (_, r) =>
                  r.key === 'baseline' ? (
                    <em className="muted">{r.label}</em>
                  ) : (
                    <Space>
                      <strong>{r.label}</strong>
                      {r.recommended && <StarFilled style={{ color: palette.primary }} />}
                    </Space>
                  ),
              },
              { title: c.head[1], render: (_, r) => <span className="num" style={{ whiteSpace: 'nowrap' }}>{allocationLabel(r.plan)}</span> },
              { title: c.head[2], render: (_, r) => svcTags(r.plan) },
              { title: c.head[3], align: 'right', render: (_, r) => <strong className="num">{t.common.sek(r.plan.cost)}</strong> },
              { title: c.head[4], align: 'right', render: (_, r) => <span className="num">{t.common.hours(r.plan.hours)}</span> },
              { title: c.head[5], align: 'right', render: (_, r) => r.plan.deliveries },
              { title: c.head[6], align: 'right', render: (_, r) => <span className="num">{t.common.sek(r.plan.customerFee)}</span> },
            ]}
          />
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {offers.map((o) => (
              <Col xs={24} lg={8} key={o.key}>
                <Card size="small" title={o.label} className={`card-fill ${samePlan(selected, o.plan) ? 'card-hl' : ''}`}>
                  <Descriptions
                    column={1}
                    size="small"
                    layout="vertical"
                    colon={false}
                    items={[
                      { key: 'r', label: c.reason, children: reasonOf(o) },
                      {
                        key: 'b',
                        label: c.breakdown,
                        children: (
                          <div style={{ width: '100%' }}>
                            {o.plan.shipments.map((s) => (
                              <div key={s.sourceId} className="small num" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                <span>
                                  {s.sourceId} {c.service[s.service]}: {s.fixedCost} + {s.totalUnits}×{s.variableCost / Math.max(1, s.totalUnits)}
                                </span>
                                <span>{s.fixedCost + s.variableCost}</span>
                              </div>
                            ))}
                            <div className="small num" style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${palette.line}`, marginTop: 4, paddingTop: 4, fontWeight: 700 }}>
                              <span>
                                {c.total} ({c.fixed} {o.plan.fixedCost} + {c.variable} {o.plan.variableCost})
                              </span>
                              <span>{o.plan.cost}</span>
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: 'c',
                        label: c.checked,
                        children: (
                          <ul className="ticks">
                            {checksOf(o.plan).map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        ),
                      },
                      {
                        key: 't',
                        label: c.toConfirm,
                        children: (
                          <ul className="ticks todo">
                            {todoOf(o.plan).map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <Space wrap>
        <Button type="primary" size="large" disabled={!selected} onClick={onConfirm}>
          {c.confirm}
        </Button>
        {!selected && <span className="muted small">{c.pickFirst}</span>}
      </Space>
    </Space>
  );
}
