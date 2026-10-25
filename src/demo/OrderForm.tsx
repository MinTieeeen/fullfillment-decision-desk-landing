import { DeleteOutlined, FileAddOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Col, Form, Input, InputNumber, Radio, Row, Select, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { catalog, productBySku, sites } from '../data/catalog';
import { baseOrder, emptyOrder } from '../data/scenarios';
import type { Order } from '../engine/types';
import { useLang } from '../i18n';

interface Props {
  order: Order;
  onChange: (o: Order) => void;
  onSubmit: () => void;
}

export function OrderForm({ order, onChange, onSubmit }: Props) {
  const { t, lang } = useLang();
  const f = t.demo.order;
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<Order>) => onChange({ ...order, ...patch });

  const errors = {
    name: order.customerName.trim() === '' ? f.errName : null,
    qty: order.lines.every((l) => !(l.qty > 0)) ? f.errQty : null,
    deadline: !(order.deadlineHours > 0) ? f.errDeadline : null,
  };
  const valid = !errors.name && !errors.qty && !errors.deadline;
  const weight = order.lines.reduce((s, l) => s + (l.qty > 0 ? l.qty : 0) * (productBySku(l.sku)?.weightKg ?? 0), 0);
  const err = (e: string | null) => (tried && e ? { validateStatus: 'error' as const, help: e } : {});

  return (
    <Card
      title={
        <Space>
          <FileAddOutlined style={{ color: 'var(--primary)' }} />
          {f.posTitle}
        </Space>
      }
      extra={
        <Space>
          <Button size="small" type="primary" ghost onClick={() => onChange(baseOrder())}>
            {f.fillSample}
          </Button>
          <Button size="small" onClick={() => onChange(emptyOrder())}>
            {f.clear}
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" requiredMark={false}>
        <Typography.Title level={5}>{f.customer}</Typography.Title>
        <Row gutter={16}>
          <Col xs={24} md={10}>
            <Form.Item label={f.customerName} {...err(errors.name)}>
              <Input value={order.customerName} onChange={(e) => set({ customerName: e.target.value })} />
            </Form.Item>
          </Col>
          <Col xs={24} md={7}>
            <Form.Item label={f.customerType}>
              <Select
                value={order.customerType}
                onChange={(v) => set({ customerType: v })}
                options={[
                  { value: 'b2b', label: f.b2b },
                  { value: 'b2c', label: f.b2c },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={7}>
            <Form.Item label={f.phone}>
              <Input value={order.phone} onChange={(e) => set({ phone: e.target.value })} />
            </Form.Item>
          </Col>
        </Row>

        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {f.products}
          </Typography.Title>
          <Tag color="magenta" className="num">
            {f.weight(weight)}
          </Tag>
        </Space>
        <div style={{ marginTop: 12 }}>
          {order.lines.map((line, i) => {
            const p = productBySku(line.sku);
            return (
              <Row gutter={12} key={i} align="bottom">
                <Col xs={24} md={14}>
                  <Form.Item label={i === 0 ? f.product : undefined}>
                    <Select
                      value={line.sku}
                      onChange={(v) => set({ lines: order.lines.map((l, j) => (j === i ? { ...l, sku: v } : l)) })}
                      options={catalog.map((c) => ({
                        value: c.sku,
                        label: `${c.sku} · ${c.name[lang]} · ${c.weightKg} kg/${c.unit[lang]}`,
                        disabled: c.sku !== line.sku && order.lines.some((l) => l.sku === c.sku),
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={16} md={7}>
                  <Form.Item label={i === 0 ? f.qty : undefined}>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      value={line.qty || null}
                      addonAfter={p?.unit[lang]}
                      onChange={(v) => set({ lines: order.lines.map((l, j) => (j === i ? { ...l, qty: Math.max(0, Math.floor(Number(v ?? 0))) } : l)) })}
                    />
                  </Form.Item>
                </Col>
                <Col xs={8} md={3}>
                  <Form.Item>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={f.remove}
                      disabled={order.lines.length === 1}
                      onClick={() => set({ lines: order.lines.filter((_, j) => j !== i) })}
                    />
                  </Form.Item>
                </Col>
              </Row>
            );
          })}
        </div>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          disabled={order.lines.length >= catalog.length}
          onClick={() => {
            const free = catalog.find((c) => !order.lines.some((l) => l.sku === c.sku));
            if (free) set({ lines: [...order.lines, { sku: free.sku, qty: 0 }] });
          }}
        >
          {f.addLine}
        </Button>
        {tried && errors.qty && <Alert type="error" showIcon message={errors.qty} style={{ marginTop: 12 }} />}

        <Typography.Title level={5} style={{ marginTop: 24 }}>
          {f.delivery}
        </Typography.Title>
        <Row gutter={16}>
          <Col xs={24} md={14}>
            <Form.Item label={f.site}>
              <Select value={order.siteId} onChange={(v) => set({ siteId: v })} options={sites.map((s) => ({ value: s.id, label: s.name }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={10}>
            <Form.Item label={f.deadline} {...err(errors.deadline)}>
              <InputNumber style={{ width: '100%' }} min={1} value={order.deadlineHours || null} addonAfter="h" onChange={(v) => set({ deadlineHours: Number(v ?? 0) })} />
            </Form.Item>
          </Col>
        </Row>

        <Typography.Title level={5}>{f.wishes}</Typography.Title>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Form.Item>
              <Checkbox checked={order.allowSplit} onChange={(e) => set({ allowSplit: e.target.checked })}>
                {f.allowSplit}
              </Checkbox>
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item label={f.maxDeliveries}>
              <Select
                disabled={!order.allowSplit}
                value={order.maxDeliveries}
                onChange={(v) => set({ maxDeliveries: v })}
                options={[2, 3, 4].map((n) => ({ value: n, label: n }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={10}>
            <Form.Item label={f.preference}>
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                value={order.preference}
                onChange={(e) => set({ preference: e.target.value as Order['preference'] })}
                options={[
                  { value: 'none', label: f.prefNone },
                  { value: 'cheap', label: f.prefCheap },
                  { value: 'fast', label: f.prefFast },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Alert type="info" showIcon message={f.note} style={{ marginBottom: 16 }} />
        <Button
          type="primary"
          size="large"
          icon={<SearchOutlined />}
          onClick={() => {
            setTried(true);
            if (valid) onSubmit();
          }}
        >
          {f.submit}
        </Button>
      </Form>
    </Card>
  );
}
