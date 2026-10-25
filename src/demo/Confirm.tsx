import { CaretRightOutlined, ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Radio, Result, Space, Steps, Timeline } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { Network, Order, Plan } from '../engine/types';
import { useLang } from '../i18n';
import { runConfirmation, type Failure, type Stage, type WorkflowEvent, type WorkflowResult } from '../workflow/confirm';
import { palette } from '../theme';
import { sourceName } from './helpers';

interface Props {
  plan: Plan;
  network: Network;
  order: Order;
  orderId: string;
  note: string;
  onReplan: (n: Network) => void;
}

const stages: Stage[] = ['revalidate', 'hold', 'book', 'release'];

export function Confirm({ plan, network, order, orderId, note, onReplan }: Props) {
  const { t } = useLang();
  const k = t.demo.confirm;
  const [failure, setFailure] = useState<Failure>('none');
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [played, setPlayed] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const running = !!result && played < result.events.length;
  const finished = !!result && played >= result.events.length;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setPlayed((p) => p + 1), 520);
    return () => clearTimeout(id);
  }, [running, played]);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [played]);

  const shown = result?.events.slice(0, played) ?? [];
  const failEvent = shown.find((e) => e.tone === 'fail');
  // After a failure the compensation events must not move the highlight away from the failing step.
  const current = failEvent?.stage ?? shown.at(-1)?.stage;
  const curIdx = current ? stages.indexOf(current) : -1;
  const stepStatus = (i: number) => {
    if (!result) return 'wait' as const;
    if (finished && result.outcome === 'confirmed') return 'finish' as const;
    if (failEvent && i === curIdx) return 'error' as const;
    if (i < curIdx) return 'finish' as const;
    if (i === curIdx) return 'process' as const;
    return 'wait' as const;
  };

  const text = (e: WorkflowEvent) => {
    const name = e.sourceId ? sourceName(network, e.sourceId) : '';
    const sv = e.service ? t.demo.choice.service[e.service as 'standard' | 'express'] : '';
    const ev = k.events;
    switch (e.kind) {
      case 'revalidateOk':
      case 'holdOk':
      case 'holdFail':
      case 'releaseTask':
        return ev[e.kind](name, e.units ?? 0);
      case 'bookOk':
      case 'bookFail':
      case 'bookTimeout':
      case 'cancelBooking':
        return ev[e.kind](name, sv);
      case 'statusQuery':
      case 'releaseHold':
        return ev[e.kind](name);
      default:
        return ev[e.kind]();
    }
  };

  return (
    <Card
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: 'var(--primary)' }} />
          {k.title}
        </Space>
      }
    >
      <p className="muted small" style={{ marginTop: 0 }}>
        {k.lead}
      </p>
      <Steps responsive size="small" items={stages.map((s, i) => ({ title: k.stages[s], status: stepStatus(i) }))} />

      <Space wrap style={{ margin: '20px 0 14px' }}>
        <span className="small" style={{ fontWeight: 600 }}>
          {k.failure}:
        </span>
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          disabled={running}
          value={failure}
          onChange={(e) => setFailure(e.target.value as Failure)}
          options={(Object.keys(k.failures) as Failure[]).map((f) => ({ value: f, label: k.failures[f] }))}
        />
        <Button
          type="primary"
          icon={<CaretRightOutlined />}
          loading={running}
          onClick={() => {
            setResult(runConfirmation(plan, network, failure, orderId));
            setPlayed(0);
          }}
        >
          {running ? k.running : k.run}
        </Button>
      </Space>

      {result && (
        <>
          <div className="small muted" style={{ marginBottom: 6 }}>
            {k.log}
          </div>
          <div className="log" ref={logRef} aria-live="polite">
            {shown.map((e, i) => (
              <div key={i} className={e.tone}>
                {text(e)}
                {e.key && <span className="k"> · key={e.key}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {finished && result.outcome === 'confirmed' && (
        <Result
          status="success"
          title={k.okTitle}
          subTitle={`${k.orderNo} ${orderId}`}
          extra={
            <Card size="small" style={{ textAlign: 'left', maxWidth: 560, margin: '0 auto' }}>
              <Descriptions
                column={1}
                size="small"
                items={[
                  { key: 'c', label: k.customer, children: order.customerName },
                  { key: 'f', label: k.totalFee, children: <strong>{t.common.sek(plan.customerFee)}</strong> },
                  ...(note ? [{ key: 'n', label: '📝', children: note }] : []),
                ]}
              />
              <Timeline
                style={{ marginTop: 16 }}
                items={plan.shipments.map((s, i) => ({ color: palette.primary, children: k.shipment(i + 1, sourceName(network, s.sourceId), s.totalUnits, s.hours) }))}
              />
              <p className="small muted" style={{ margin: 0 }}>
                {k.tracking}
              </p>
            </Card>
          }
        />
      )}
      {finished && result.outcome === 'compensated' && (
        <Result
          status="warning"
          title={k.failTitle}
          subTitle={k.failLead}
          extra={
            <Button type="primary" icon={<ReloadOutlined />} onClick={() => onReplan(result.networkAfter)}>
              {k.replan}
            </Button>
          }
        />
      )}
    </Card>
  );
}
