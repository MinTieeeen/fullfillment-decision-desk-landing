import { ApartmentOutlined, CheckCircleFilled, CloseCircleFilled, ExperimentOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Drawer, List, Select, Space, Steps, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { PageHead } from '../components/ui';
import { baseNetwork, baseOrder, scenario, scenarioIds, type ScenarioId } from '../data/scenarios';
import { Choice } from '../demo/Choice';
import { Confirm } from '../demo/Confirm';
import { newOrderId, samePlan, withSiteDistances } from '../demo/helpers';
import { Lookup } from '../demo/Lookup';
import { OrderForm } from '../demo/OrderForm';
import { Pipeline } from '../demo/Pipeline';
import { runChecks } from '../engine/checks';
import { analyze } from '../engine/engine';
import type { Network, Order, Plan } from '../engine/types';
import { useLang } from '../i18n';
import { palette } from '../theme';

export default function Demo() {
  const { t } = useLang();
  const d = t.demo;
  const [stage, setStage] = useState(0);
  const [order, setOrder] = useState<Order>(baseOrder);
  const [network, setNetwork] = useState<Network>(baseNetwork);
  const [scenarioId, setScenarioId] = useState<ScenarioId>('base');
  const [selected, setSelected] = useState<Plan | null>(null);
  const [note, setNote] = useState('');
  const [orderId, setOrderId] = useState(newOrderId);
  const [run, setRun] = useState(0); // remounts the pipeline so it replays
  const [drawer, setDrawer] = useState<'checks' | 'arch' | null>(null);

  const sited = useMemo(() => withSiteDistances(network, order.siteId), [network, order.siteId]);
  const analysis = useMemo(() => analyze(order, sited), [order, sited]);
  const checks = useMemo(() => (drawer === 'checks' ? runChecks() : []), [drawer]);

  // Keep the selection only while it is still on offer (network edits can remove or re-price it).
  const alt = analysis.alternatives;
  const offered: Plan[] = [
    ...analysis.options.map((o) => o.plan),
    ...(alt ? [alt.partial?.plan, alt.laterDeadline, alt.moreDeliveries].filter((p): p is Plan => !!p) : []),
  ];
  const selectedValid = offered.find((p) => samePlan(p, selected)) ?? null;

  const applyScenario = (id: ScenarioId) => {
    const s = scenario(id);
    setScenarioId(id);
    setOrder(s.order);
    setNetwork(s.network);
    setSelected(null);
    if (stage > 1) setStage(1);
    setRun((r) => r + 1);
  };

  const goto = (s: number) => {
    if (s === 1) setRun((r) => r + 1);
    setStage(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHead eyebrow={t.common.nav.demo} title={d.title} lead={d.lead} />
      <div className="container workspace">
        <aside className="workspace-nav">
          <div className="ws-title">Optiflo · Store A</div>
          <Steps
            direction="vertical"
            size="small"
            current={stage}
            onChange={(i) => i < stage && goto(i)}
            items={d.stages.map((s, i) => ({ title: s, disabled: i > stage, description: `${d.stage} ${i + 1}` }))}
          />
          <div className="ws-meta">
            <div>
              # <b className="num">{orderId}</b>
            </div>
            <div>
              <b>{order.customerName || '—'}</b>
            </div>
            <div>
              {analysis.demandUnits} units · {analysis.demandWeightKg.toLocaleString()} kg · ≤ {order.deadlineHours} h
            </div>
          </div>
        </aside>

        <section style={{ minWidth: 0 }}>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space wrap>
              <ExperimentOutlined style={{ color: palette.primary }} />
              <strong className="small">{d.scenarios.label}:</strong>
              <Select<ScenarioId>
                style={{ minWidth: 220 }}
                value={scenarioId}
                onChange={applyScenario}
                options={scenarioIds.map((id) => ({ value: id, label: d.scenarios[id] }))}
              />
              <Button icon={<CheckCircleFilled />} onClick={() => setDrawer('checks')}>
                {d.confirm.checks}
              </Button>
              <Button icon={<ApartmentOutlined />} onClick={() => setDrawer('arch')}>
                {d.confirm.arch}
              </Button>
            </Space>
          </Card>

          {stage === 0 && (
            <OrderForm
              order={order}
              onChange={(o) => {
                setOrder(o);
                setSelected(null);
              }}
              onSubmit={() => {
                setOrderId(newOrderId());
                goto(1);
              }}
            />
          )}

          {stage === 1 && (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Lookup
                network={sited}
                analysis={analysis}
                onChange={(n) => {
                  setNetwork(n);
                  setSelected(null);
                }}
                onReset={() => applyScenario(scenarioId)}
              />
              <Pipeline key={run} analysis={analysis} onDone={() => goto(2)} />
            </Space>
          )}

          {stage === 2 && (
            <Choice
              analysis={analysis}
              order={order}
              network={sited}
              selected={selectedValid}
              onSelect={setSelected}
              note={note}
              onNote={setNote}
              onConfirm={() => goto(3)}
              onEditOrder={() => goto(0)}
            />
          )}

          {stage === 3 && selectedValid && (
            <Confirm
              key={selectedValid.id}
              plan={selectedValid}
              network={sited}
              order={order}
              orderId={orderId}
              note={note}
              onReplan={(n) => {
                setNetwork(n);
                setSelected(null);
                goto(2);
              }}
            />
          )}

          {stage > 0 && (
            <Button
              style={{ marginTop: 20 }}
              icon={<PlusOutlined />}
              onClick={() => {
                setSelected(null);
                setNote('');
                goto(0);
              }}
            >
              {d.confirm.newOrder.replace('← ', '')}
            </Button>
          )}
        </section>
      </div>

      <Drawer open={drawer === 'checks'} width={560} title={d.checks.title} onClose={() => setDrawer(null)}>
        <p className="muted small">{d.checks.lead}</p>
        <Tag color="magenta" style={{ marginBottom: 12 }}>
          {d.checks.summary(checks.filter((c) => c.passed).length, checks.length)}
        </Tag>
        <List
          dataSource={checks}
          renderItem={(c, i) => (
            <List.Item>
              <Card size="small" style={{ width: '100%' }} title={`${i + 1}. ${d.checks.names[c.id]}`} extra={
                c.passed ? <Tag color="success" icon={<CheckCircleFilled />}>{d.checks.pass}</Tag> : <Tag color="red" icon={<CloseCircleFilled />}>{d.checks.fail}</Tag>
              }>
                <Descriptions
                  column={1}
                  size="small"
                  items={[
                    { key: 'e', label: d.checks.expected, children: c.expected },
                    { key: 'a', label: d.checks.actual, children: <span className="num">{c.actual}</span> },
                  ]}
                />
              </Card>
            </List.Item>
          )}
        />
      </Drawer>

      <Drawer open={drawer === 'arch'} width={520} title={d.arch.title} onClose={() => setDrawer(null)}>
        <p className="muted small">{d.arch.lead}</p>
        <Steps
          direction="vertical"
          current={2}
          items={d.arch.blocks.map((b) => ({
            title: <strong>{b.t}</strong>,
            status: b.core ? 'process' : 'finish',
            description: (
              <ul className="small" style={{ margin: '4px 0 12px', paddingLeft: 18 }}>
                {b.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            ),
          }))}
        />
        <p className="caveat">{d.arch.note}</p>
      </Drawer>
    </>
  );
}
