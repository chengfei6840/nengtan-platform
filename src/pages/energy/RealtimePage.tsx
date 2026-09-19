import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Col, message, Row, Select, Space, Statistic, Card } from 'antd'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { useOps } from '@/context/OpsContext'
import { hourlyLoad, touEnergy } from '@/mock/energy'
import { meters } from '@/mock/meters'
import { enterprises, enterprisesById } from '@/mock/enterprises'
import { chartColors } from '@/theme'
import { energyFormat, numFormat, percentFormat } from '@/utils/format'
import type { Meter } from '@/mock/types'

const TOU_COLORS: Record<string, string> = {
  尖: '#dc2626',
  峰: '#ea580c',
  平: '#ca8a04',
  谷: '#059669',
}

export default function RealtimePage() {
  const navigate = useNavigate()
  const { createAlarm } = useOps()
  const [enterpriseId, setEnterpriseId] = useState<string | undefined>()
  const [meterId, setMeterId] = useState<string | undefined>()

  const latest = hourlyLoad[hourlyLoad.length - 1]
  const peakLoad = Math.max(...hourlyLoad.map((h) => h.load))
  const avgLoad = hourlyLoad.reduce((s, h) => s + h.load, 0) / hourlyLoad.length

  const meterOptions = useMemo(() => {
    const list = enterpriseId
      ? meters.filter((m) => m.enterpriseId === enterpriseId)
      : meters.filter((m) => m.type === '电').slice(0, 40)
    return list.map((m) => ({
      value: m.id,
      label: `${m.name}（${m.code}）`,
    }))
  }, [enterpriseId])

  const selectedMeter: Meter | undefined = meterId
    ? meters.find((m) => m.id === meterId)
    : undefined

  const statusSummary = useMemo(() => {
    const scope = enterpriseId
      ? meters.filter((m) => m.enterpriseId === enterpriseId)
      : meters
    const online = scope.filter((m) => m.status === 'online').length
    const offline = scope.filter((m) => m.status === 'offline').length
    const fault = scope.filter((m) => m.status === 'fault').length
    return { total: scope.length, online, offline, fault }
  }, [enterpriseId])

  const scale = useMemo(() => {
    if (!enterpriseId) return 1
    const ent = enterprises.find((e) => e.id === enterpriseId)
    if (!ent?.yearlyEnergy) return 0.08
    const parkEnergy = enterprises.reduce((s, e) => s + e.yearlyEnergy, 0)
    return Math.max(0.03, Math.min(0.35, ent.yearlyEnergy / parkEnergy))
  }, [enterpriseId])

  const loadOption = useMemo(() => {
    const entName =
      enterprises.find((e) => e.id === enterpriseId)?.shortName ?? '所选企业'
    const series = [
      {
        name: '园区负荷',
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: { opacity: 0.08 },
        data: hourlyLoad.map((h) => h.load),
      },
      {
        name: '光伏出力',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: hourlyLoad.map((h) => h.pv ?? 0),
      },
      {
        name: '市电取电',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: hourlyLoad.map((h) => h.grid ?? h.load),
      },
    ]
    if (enterpriseId) {
      series.push({
        name: `${entName}估算负荷`,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: hourlyLoad.map((h) => Math.round(h.load * scale)),
      } as (typeof series)[number])
    }
    return {
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: { top: 0 },
      grid: { left: 56, right: 24, top: 40, bottom: 28 },
      xAxis: {
        type: 'category',
        data: hourlyLoad.map((h) => h.label),
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: 'kW',
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series,
    }
  }, [enterpriseId, scale])

  const touOption = useMemo(
    () => ({
      color: touEnergy.map((t) => TOU_COLORS[t.period] ?? chartColors.primary),
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}<br/>电量 ${energyFormat(p.value)}<br/>占比 ${p.percent.toFixed(1)}%`,
      },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['50%', '45%'],
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
          data: touEnergy.map((t) => ({ name: t.period, value: t.energy })),
        },
      ],
    }),
    [],
  )

  const resolveAlarmContext = () => {
    const entId = selectedMeter?.enterpriseId ?? enterpriseId
    const ent = entId ? enterprisesById[entId] : undefined
    const source = selectedMeter?.name ?? (ent ? `${ent.shortName}负荷` : '园区负荷')
    return {
      source,
      sourceType: (selectedMeter ? 'meter' : 'energy') as 'meter' | 'energy',
      sourceId: selectedMeter?.id,
      enterpriseId: entId,
      zoneId: ent?.zoneId ?? selectedMeter?.zoneId,
    }
  }

  const onMarkAnomaly = () => {
    const ctx = resolveAlarmContext()
    const alarm = createAlarm({
      title: `${ctx.source}负荷异常`,
      message: `${ctx.source} 负荷偏离典型日曲线，已人工标记为异常，请运维复核。`,
      level: 'major',
      ...ctx,
    })
    message.success(`已标记异常并生成告警：${alarm.title}`)
  }

  const onCreateAlarm = () => {
    const ctx = resolveAlarmContext()
    const alarm = createAlarm({
      title: `${ctx.source}负荷告警`,
      message: `${ctx.source} 实时负荷异常，由实时监测页创建，请尽快确认或转工单。`,
      level: 'critical',
      ...ctx,
    })
    message.success(`已创建告警：${alarm.title}`)
    navigate('/ops/alarms')
  }

  return (
    <div>
      <PageHeader
        title="实时监测"
        subtitle="典型工作日 24 小时负荷与分时结构 · Demo 数据"
        breadcrumbs={[{ title: '能源管理' }, { title: '实时监测' }]}
        extra={
          <Space wrap>
            <Select
              allowClear
              placeholder="筛选企业"
              style={{ width: 200 }}
              value={enterpriseId}
              onChange={(v) => {
                setEnterpriseId(v)
                setMeterId(undefined)
              }}
              options={enterprises.map((e) => ({
                value: e.id,
                label: e.shortName,
              }))}
              showSearch
              optionFilterProp="label"
            />
            <Select
              allowClear
              placeholder="选择计量点"
              style={{ width: 240 }}
              value={meterId}
              onChange={setMeterId}
              options={meterOptions}
              showSearch
              optionFilterProp="label"
            />
            <Button onClick={onMarkAnomaly}>标记异常</Button>
            <Button type="primary" onClick={onCreateAlarm}>
              创建告警
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="当前负荷"
            value={numFormat(latest.load, { digits: 0 })}
            unit="kW"
            trend="flat"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="日峰值负荷"
            value={numFormat(peakLoad, { digits: 0 })}
            unit="kW"
            trend="up"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="日均负荷"
            value={numFormat(avgLoad, { digits: 0 })}
            unit="kW"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="当前光伏出力"
            value={numFormat(latest.pv ?? 0, { digits: 0 })}
            unit="kW"
            trend={(latest.pv ?? 0) > 0 ? 'up' : 'flat'}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <ChartCard
            title="24 小时负荷曲线"
            subtitle={
              enterpriseId
                ? '园区负荷 + 企业估算负荷（按年能耗占比缩放）'
                : '园区总负荷 / 光伏 / 市电'
            }
            height={360}
          >
            <ReactECharts option={loadOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={8}>
          <ChartCard title="分时电量结构" subtitle="尖 / 峰 / 平 / 谷" height={360}>
            <ReactECharts option={touOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="计量点在线状态" size="small">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="总数" value={statusSummary.total} />
              </Col>
              <Col span={6}>
                <Statistic
                  title={<StatusTag status="online" />}
                  value={statusSummary.online}
                  valueStyle={{ color: '#059669' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={<StatusTag status="offline" />}
                  value={statusSummary.offline}
                  valueStyle={{ color: '#64748b' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={<StatusTag status="fault" />}
                  value={statusSummary.fault}
                  valueStyle={{ color: '#dc2626' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 12, color: '#64748b', fontSize: 13 }}>
              在线率{' '}
              {percentFormat(
                statusSummary.total
                  ? (statusSummary.online / statusSummary.total) * 100
                  : 0,
              )}
              {selectedMeter && (
                <span style={{ marginLeft: 16 }}>
                  已选计量点：{selectedMeter.name}{' '}
                  <StatusTag status={selectedMeter.status} />
                  最近读数 {numFormat(selectedMeter.lastValue)} {selectedMeter.unit}
                </span>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="分时明细" size="small">
            <Row gutter={[8, 8]}>
              {touEnergy.map((t) => (
                <Col span={12} key={t.period}>
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: '#f8fafc',
                      borderLeft: `3px solid ${TOU_COLORS[t.period]}`,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {t.period}时段 · {percentFormat(t.share)}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{t.hours}</div>
                    <div style={{ marginTop: 4 }}>
                      {energyFormat(t.energy)} · {numFormat(t.cost, { digits: 1 })} 万元
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
