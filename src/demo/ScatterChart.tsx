import { useState } from 'react';
import { allocationLabel } from '../engine/engine';
import type { Analysis, Plan } from '../engine/types';
import { useLang } from '../i18n';
import { palette } from '../theme';

const W = 560;
const H = 300;
const M = { l: 64, r: 20, t: 16, b: 44 };

/** Feasible plans on cost × completion time: offered options highlighted, others muted, baseline as a ring. */
export function ScatterChart({ analysis }: { analysis: Analysis }) {
  const { t } = useLang();
  const p = t.demo.pipe;
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);

  const offered = new Map(analysis.options.map((o) => [o.plan.id, o.kind]));
  const seen = new Set<string>();
  const plans = analysis.feasiblePlans.filter((pl) => {
    const k = `${pl.hours}|${pl.cost}`;
    if (offered.has(pl.id)) return true;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const all: Plan[] = analysis.baseline ? [...plans, analysis.baseline] : plans;
  if (all.length === 0) return null;

  const maxH = Math.max(...all.map((x) => x.hours)) * 1.1;
  const costs = all.map((x) => x.cost);
  const span = Math.max(...costs) - Math.min(...costs) || 100;
  const step = [50, 100, 200, 250, 500, 1000].find((s) => span / s <= 5) ?? 1000;
  const minC = Math.max(0, Math.floor((Math.min(...costs) - step / 2) / step) * step);
  const maxC = Math.ceil((Math.max(...costs) + step / 2) / step) * step;
  const sx = (h: number) => M.l + (h / maxH) * (W - M.l - M.r);
  const sy = (c: number) => H - M.b - ((c - minC) / (maxC - minC || 1)) * (H - M.t - M.b);
  const yTicks = Array.from({ length: Math.round((maxC - minC) / step) + 1 }, (_, i) => minC + i * step);
  const xTicks = [0, 12, 24, 36, 48, 60, 72].filter((x) => x <= maxH);

  const tip = (pl: Plan, label: string) => `${label}: ${allocationLabel(pl)} · ${t.common.sek(pl.cost)} · ${pl.hours} h`;

  return (
    <div className="chart-wrap">
      <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>
        {p.chartTitle}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={p.chartTitle} onMouseLeave={() => setHover(null)}>
        {yTicks.map((c) => (
          <g key={c}>
            <line x1={M.l} x2={W - M.r} y1={sy(c)} y2={sy(c)} stroke={palette.line} />
            <text x={M.l - 8} y={sy(c) + 4} textAnchor="end" fontSize="11" fill={palette.grey}>
              {c}
            </text>
          </g>
        ))}
        {xTicks.map((h) => (
          <text key={h} x={sx(h)} y={H - M.b + 18} textAnchor="middle" fontSize="11" fill={palette.grey}>
            {h}
          </text>
        ))}
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke={palette.greyLight} />
        <text x={(W + M.l) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill={palette.ink2}>
          {p.chartX}
        </text>
        <text x={14} y={(H - M.b) / 2} textAnchor="middle" fontSize="11" fill={palette.ink2} transform={`rotate(-90 14 ${(H - M.b) / 2})`}>
          {p.chartY}
        </text>

        {plans
          .filter((pl) => !offered.has(pl.id))
          .map((pl) => (
            <circle
              key={pl.id}
              cx={sx(pl.hours)}
              cy={sy(pl.cost)}
              r={6}
              fill={palette.greyLight}
              stroke="#fff"
              strokeWidth={2}
              onMouseEnter={() => setHover({ x: sx(pl.hours), y: sy(pl.cost), text: tip(pl, p.legendOther) })}
            />
          ))}
        {analysis.baseline && (
          <circle
            cx={sx(analysis.baseline.hours)}
            cy={sy(analysis.baseline.cost)}
            r={9}
            fill="none"
            stroke={palette.ink}
            strokeWidth={2}
            strokeDasharray="3 2"
            onMouseEnter={() => setHover({ x: sx(analysis.baseline!.hours), y: sy(analysis.baseline!.cost), text: tip(analysis.baseline!, p.legendBaseline) })}
          />
        )}
        {analysis.options.map((o) => (
          <g key={o.plan.id} onMouseEnter={() => setHover({ x: sx(o.plan.hours), y: sy(o.plan.cost), text: tip(o.plan, t.demo.choice.kinds[o.kind]) })}>
            <circle cx={sx(o.plan.hours)} cy={sy(o.plan.cost)} r={14} fill="transparent" />
            <circle cx={sx(o.plan.hours)} cy={sy(o.plan.cost)} r={7} fill={palette.primary} stroke="#fff" strokeWidth={2} />
            <text
              x={sx(o.plan.hours) + (sx(o.plan.hours) > W * 0.7 ? -12 : 12)}
              y={sy(o.plan.cost) - 10}
              textAnchor={sx(o.plan.hours) > W * 0.7 ? 'end' : 'start'}
              fontSize="11"
              fontWeight="600"
              fill={palette.ink}
            >
              {t.demo.choice.kinds[o.kind]} · {o.plan.cost}
            </text>
          </g>
        ))}
      </svg>
      {hover && (
        <div className="tooltip" style={{ left: `${(hover.x / W) * 100}%`, top: `calc(${(hover.y / H) * 100}% + 20px)` }}>
          {hover.text}
        </div>
      )}
      <div className="small muted" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <span>
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={palette.primary} /></svg> {p.legendOffered}
        </span>
        <span>
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={palette.greyLight} /></svg> {p.legendOther}
        </span>
        {analysis.baseline && (
          <span>
            <svg width="14" height="14"><circle cx="7" cy="7" r="5.5" fill="none" stroke={palette.ink} strokeWidth="1.5" strokeDasharray="2 1.5" /></svg> {p.legendBaseline}
          </span>
        )}
      </div>
    </div>
  );
}
