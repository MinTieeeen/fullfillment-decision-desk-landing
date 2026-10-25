import {
  CheckCircleFilled,
  CloseCircleOutlined,
  CommentOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  FlagOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Card, Col, List, Row, Space, Statistic, Steps, Tag } from 'antd';
import { useState } from 'react';
import { Block, PageHead } from '../components/ui';
import { useLang } from '../i18n';
import { palette } from '../theme';

const aiIcons = [<CommentOutlined />, <WarningOutlined />, <FieldTimeOutlined />];

export default function Roadmap() {
  const { t } = useLang();
  const r = t.roadmap;
  const [phase, setPhase] = useState(0);
  const ph = r.phases.items[phase];

  return (
    <>
      <PageHead eyebrow={t.common.nav.roadmap} title={r.title} lead={r.lead} />

      <Block q={r.scope.q} title={r.scope.title}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card className="card-fill card-hl" title={<span style={{ color: palette.primary }}><CheckCircleFilled /> {r.scope.inTitle}</span>}>
              <ul className="ticks">
                {r.scope.inItems.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="card-fill" title={<span className="muted"><CloseCircleOutlined /> {r.scope.outTitle}</span>}>
              <List size="small" dataSource={r.scope.outItems} renderItem={(x) => <List.Item className="muted">{x}</List.Item>} />
            </Card>
          </Col>
        </Row>
      </Block>

      <Block q={r.phases.q} title={r.phases.title}>
        <Card>
          <Steps
            responsive
            current={phase}
            onChange={setPhase}
            items={r.phases.items.map((p, i) => ({ title: p.t, description: p.w, status: i < phase ? 'finish' : i === phase ? 'process' : 'wait' }))}
          />
        </Card>
        <Card style={{ marginTop: 12 }} title={<Space><Tag color="magenta">{ph.w}</Tag>{ph.t}</Space>}>
          <ul className="ticks">
            {ph.d.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <div className="takeaway">
            <FlagOutlined style={{ marginTop: 3 }} />
            <span>
              {r.phases.exit}: {ph.exit}
            </span>
          </div>
        </Card>
        <Alert type="info" showIcon style={{ marginTop: 12 }} message={r.phases.gate} />
      </Block>

      <Block q={r.measure.q} title={r.measure.title} takeaway={r.measure.formula}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card className="card-fill card-hl">
              <Statistic
                title={r.measure.primary}
                value={r.measure.primaryV}
                prefix={<DashboardOutlined />}
                valueStyle={{ fontSize: 20, fontWeight: 800, color: palette.primary }}
              />
              <div className="muted small" style={{ marginTop: 16 }}>
                {r.measure.guard}
              </div>
              <ul className="ticks">
                {r.measure.guardV.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="card-fill" title={r.measure.ladder}>
              <Steps
                direction="vertical"
                size="small"
                current={0}
                items={r.measure.rungs.map((g) => ({ title: g.t, description: g.d, status: g.done ? 'finish' : 'wait' }))}
              />
            </Card>
          </Col>
        </Row>
      </Block>

      <Block q={r.after.q} title={r.after.title}>
        <Row gutter={[16, 16]}>
          {r.after.items.map((m, i) => (
            <Col xs={24} md={8} key={m.c}>
              <Card className={`card-fill ${i === 0 ? 'card-hl' : ''}`}>
                <Tag color={i === 0 ? 'magenta' : 'default'}>{m.t}</Tag>
                <div style={{ fontSize: 18, fontWeight: 700, margin: '10px 0 6px' }}>{m.c}</div>
                <p className="small muted" style={{ margin: 0 }}>
                  {m.d}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </Block>

      <Block q={r.ai.q} title={r.ai.title} caveat={r.ai.note}>
        <Row gutter={[16, 16]}>
          {r.ai.items.map((x, i) => (
            <Col xs={24} md={8} key={x.t}>
              <Card className="card-fill">
                <div className={`icon-badge ${i === 0 ? 'dark' : ''}`}>{aiIcons[i]}</div>
                <strong>{x.t}</strong>
                <p className="small muted" style={{ margin: '6px 0 0' }}>
                  {x.d}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </Block>
    </>
  );
}
