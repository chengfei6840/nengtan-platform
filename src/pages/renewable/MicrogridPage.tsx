import { useMemo } from 'react'
import { Col, Row } from 'antd'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { microgridFlows } from '@/mock/renewable'
import { chartColors } from '@/theme'
import { numFormat } from '@/utils/format'

export default function MicrogridPage() {
  const latest = microgridFlows[microgridFlows.length - 1]

  const stackOption = useMemo(
    () => ({
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: { data: ['市电取电', '光伏出力', '储能功率', '负荷', '充电负荷'] },
      grid: { left: 56, right: 24, top: 40, bottom: 40 },
      xAxis: {
        type: 'category',
        data: microgridFlows.map((f) => f.timestamp.slice(11, 16)),
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: 'kW',
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [
        {
          name: '市电取电',
          type: 'line',
          stack: 'supply',
          areaStyle: { opacity: 0.35 },
          smooth: true,
          showSymbol: false,
          data: microgridFlows.map((f) => f.gridImportKw),
        },
        {
          name: '光伏出力',
          type: 'line',
          stack: 'supply',
          areaStyle: { opacity: 0.35 },
          smooth: true,
          showSymbol: false,
          data: microgridFlows.map((f) => f.pvKw),
        },
        {
          name: '储能功率',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: microgridFlows.map((f) => f.storageKw),
        },
        {
          name: '负荷',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2 },
          data: microgridFlows.map((f) => f.loadKw),
        },
        {
          name: '充电负荷',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: microgridFlows.map((f) => f.chargerKw),
        },
      ],
    }),
    [],
  )

  const sankeyOption = useMemo(() => {
    const gridNet = Math.max(0, latest.gridImportKw - latest.gridExportKw)
    const storageDischarge = latest.storageKw < 0 ? Math.abs(latest.storageKw) : 0
    const storageCharge = latest.storageKw > 0 ? latest.storageKw : 0
    return {
      color: chartColors.series,
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'sankey',
          emphasis: { focus: 'adjacency' },
          data: [
            { name: '市电' },
            { name: '光伏' },
            { name: '储能' },
            { name: '园区负荷' },
            { name: '充电桩' },
            { name: '上网' },
          ],
          links: [
            { source: '市电', target: '园区负荷', value: Math.round(gridNet * 0.85) },
            { source: '市电', target: '充电桩', value: Math.round(latest.chargerKw * 0.3) },
            { source: '光伏', target: '园区负荷', value: Math.round(latest.pvKw * 0.7) },
            { source: '光伏', target: '储能', value: Math.round(storageCharge || latest.pvKw * 0.15) },
            { source: '光伏', target: '上网', value: Math.round(latest.gridExportKw || latest.pvKw * 0.05) },
            { source: '储能', target: '园区负荷', value: Math.round(storageDischarge || 100) },
            { source: '市电', target: '储能', value: Math.round(storageCharge || 50) },
            { source: '光伏', target: '充电桩', value: Math.round(latest.chargerKw * 0.4) },
          ].filter((l) => l.value > 0),
          lineStyle: { color: 'gradient', curveness: 0.5 },
          label: { fontSize: 12 },
        },
      ],
    }
  }, [latest])

  return (
    <div>
      <PageHeader
        title="微电网"
        subtitle={`功率流采样 · 最新 ${latest.timestamp}`}
        breadcrumbs={[{ title: '新能源' }, { title: '微电网' }]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="市电取电"
            value={numFormat(latest.gridImportKw, { digits: 0 })}
            unit="kW"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="光伏出力" value={numFormat(latest.pvKw, { digits: 0 })} unit="kW" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="储能功率"
            value={numFormat(latest.storageKw, { digits: 0 })}
            unit="kW"
            trend={latest.storageKw < 0 ? 'down' : 'up'}
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="园区负荷" value={numFormat(latest.loadKw, { digits: 0 })} unit="kW" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="充电负荷"
            value={numFormat(latest.chargerKw, { digits: 0 })}
            unit="kW"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="上网功率"
            value={numFormat(latest.gridExportKw, { digits: 0 })}
            unit="kW"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <ChartCard title="微网功率流时序" subtitle="近 12 个采样点（15 分钟）" height={360}>
            <ReactECharts option={stackOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={10}>
          <ChartCard title="当前能量流向" subtitle="Sankey 示意" height={360}>
            <ReactECharts option={sankeyOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
      </Row>
    </div>
  )
}
