import { CaretRightOutlined, FastForwardOutlined, PauseOutlined, QuestionCircleOutlined, RedoOutlined, StepForwardOutlined } from '@ant-design/icons';
import { Button, Card, Progress, Space, Steps, Tag } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import type { Analysis, RejectReason } from '../engine/types';
import { useLang } from '../i18n';
import { palette } from '../theme';
import { ScatterChart } from './ScatterChart';

const STEPS = 6;

export function Pipeline({ analysis, onDone }: { analysis: Analysis; onDone: () => void }) {
  const { t } = useLang();
  const p = t.demo.pipe;
  const [shown, setShown] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!playing || shown >= STEPS) return;
    const id = setTimeout(() => setShown((s) => s + 1), 1100);
    return () => clearTimeout(id);
  }, [playing, shown]);
  useEffect(() => {
    if (shown >= STEPS) setPlaying(false);
  }, [shown]);

  const n = analysis.normalized;
  const total = Object.values(analysis.totalAllocatable).reduce((s, q) => s + q, 0);
  const shortUnits = Object.values(analysis.shortage).reduce((s, q) => s + q, 0);
  const excluded = n.filter((x) => !x.eligible);
  const sum = (r: Record<string, number>) => Object.values(r).reduce((s, q) => s + q, 0);
  const largest = [...n.filter((x) => x.eligible)].sort((a, b) => sum(b.allocatable) - sum(a.allocatable))[0];
  const f = analysis.funnel;
  const reasons: RejectReason[] = ['stock', 'load', 'deadline', 'deliveries', 'redundant'];
  const pct = (v: number) => (f.tried ? Math.round((v / f.tried) * 100) : 0);

  const body: ReactNode[] = [
    <Space key="1" wrap>
      <Tag color="magenta">{p.s1(n.length, total, analysis.demandUnits, analysis.demandWeightKg)}</Tag>
    </Space>,
    <div key="2">
      <Tag color={excluded.length ? 'orange' : 'magenta'}>{p.s2ok(analysis.eligibleCount, n.length)}</Tag>
      {excluded.map((x) => (
        <Tag key={x.source.id} color="red">
          {p.excluded(x.source.name, x.reasons.map((r) => p.reasons[r]).join(', '))}
        </Tag>
      ))}
    </div>,
    <Tag key="3" color={shortUnits > 0 ? 'red' : 'blue'} style={{ whiteSpace: 'normal' }}>
      {shortUnits > 0
        ? p.s3short(shortUnits)
        : analysis.singleSourceCovers.length > 0
          ? p.s3single(analysis.singleSourceCovers.join(', '))
          : largest
            ? p.s3none(largest.source.name, sum(largest.allocatable))
            : p.s3short(analysis.demandUnits)}
    </Tag>,
    <Tag key="4">{p.s4(f.tried)}</Tag>,
    <div key="5" style={{ maxWidth: 560 }}>
      <div className="funnel-row">
        <span>{p.funnel.tried}</span>
        <Progress percent={100} showInfo={false} strokeColor={palette.ink2} />
        <strong className="num">{f.tried}</strong>
      </div>
      {reasons.map((r) => (
        <div key={r} className="funnel-row">
          <span className="muted">− {p.funnel[r]}</span>
          <Progress percent={pct(f.rejected[r])} showInfo={false} strokeColor={palette.greyLight} />
          <span className="num muted">{f.rejected[r]}</span>
        </div>
      ))}
      <div className="funnel-row">
        <strong style={{ color: palette.primary }}>= {p.funnel.feasible}</strong>
        <Progress percent={pct(f.feasible)} showInfo={false} strokeColor={palette.primary} />
        <strong className="num" style={{ color: palette.primary }}>
          {f.feasible}
        </strong>
      </div>
    </div>,
    <div key="6">
      <Tag color="magenta" style={{ marginBottom: 10 }}>
        {p.s6(f.feasible, analysis.options.length)}
      </Tag>
      <ScatterChart analysis={analysis} />
    </div>,
  ];

  return (
    <Card
      title={p.title}
      extra={
        shown < STEPS ? (
          <Space wrap>
            <Button size="small" icon={playing ? <PauseOutlined /> : <CaretRightOutlined />} onClick={() => setPlaying(!playing)}>
              {playing ? p.pause : p.play}
            </Button>
            <Button size="small" icon={<StepForwardOutlined />} onClick={() => setShown((s) => Math.min(STEPS, s + 1))}>
              {p.step}
            </Button>
            <Button size="small" icon={<FastForwardOutlined />} onClick={() => setShown(STEPS)}>
              {p.skip}
            </Button>
          </Space>
        ) : (
          <Button
            size="small"
            icon={<RedoOutlined />}
            onClick={() => {
              setShown(1);
              setPlaying(true);
            }}
          >
            {p.replay}
          </Button>
        )
      }
    >
      <Steps
        direction="vertical"
        current={shown - 1}
        items={p.steps.map((s, i) => ({
          status: i < shown - 1 || shown >= STEPS ? 'finish' : i === shown - 1 ? 'process' : 'wait',
          title: (
            <Space>
              <strong>{s.t}</strong>
              {i < shown && (
                <Button type="link" size="small" icon={<QuestionCircleOutlined />} onClick={() => setOpen(open === i ? null : i)}>
                  {p.why}
                </Button>
              )}
            </Space>
          ),
          description:
            i < shown ? (
              <div style={{ padding: '6px 0 14px' }}>
                {body[i]}
                {open === i && <div className="why">{s.why}</div>}
              </div>
            ) : null,
        }))}
      />
      {shown >= STEPS && (
        <Button type="primary" size="large" onClick={onDone}>
          {p.toChoice}
        </Button>
      )}
    </Card>
  );
}
