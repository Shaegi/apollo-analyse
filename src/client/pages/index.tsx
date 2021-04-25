import { InferGetStaticPropsType } from 'next'
import styled, { useTheme } from 'styled-components'
import TextWidget from '../components/TextWidget'
import { ErrorInfo, TracingInfo } from '../types/TracingInfo'
import { useEffect, useMemo, useRef, useState } from 'react'
import MainNav from '../components/MainNav'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from 'recharts'
import { useIntl } from 'react-intl'
import moment from 'moment'
import { roundTo2Precision } from './operation/tabs/utils'
import { convertNSToMs } from '../utils'

const Wrapper = styled.main`
  padding: 16px;
  ul {
    gap: 8px;
  }

  ul.widget-list {
    display: flex;
    margin-bottom: 32px;
  }
`
const getLastDay = () => {
  let today = new Date()
  today.setHours(today.getHours() - 24)
  return today
}

const getLastHour = () => {
  let lastHour = new Date()
  lastHour.setHours(lastHour.getHours() - 1)
  return lastHour
}

type IntervalPoint<T = Record<string, any>> = {
  start: number
  end: number
  values: T[]
}

const getIntervalPoints = <T extends any>(start: Date, end: Date, count: number = 15): IntervalPoint[] => {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const result: IntervalPoint<T>[] = []
  const multiplier = (endTime - startTime) / count
  for (let i = 0; i <= count; i++) {
    result.push({
      start: startTime + i * multiplier,
      end: startTime + (i + 1) * multiplier,
      values: []
    })
  }
  return result
}

export type DashboardProps = InferGetStaticPropsType<typeof getServerSideProps>

function Dashboard(props: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { tracingInfos, errorCount } = props
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const listener = () => {
      if (wrapperRef.current) {
        setWidth(wrapperRef.current?.clientWidth)
      }
    }
    window.addEventListener('resize', listener)
    listener()
    return () => {
      window.removeEventListener('resize', listener)
    }
  })

  const intervals = [
    {
      id: 'last-24-hours',
      label: 'Last 24 hours',
      start: getLastDay(),
      end: new Date()
    },
    {
      id: 'last-hour',
      label: 'Last Hour',
      start: getLastHour(),
      end: new Date()
    }
  ]
  const [selectedInterval, setSelectedInterval] = useState(intervals[1])
  const theme: any = useTheme()

  const intl = useIntl()

  const operationsInInterval = useMemo(() => {
    const intervalPoints = getIntervalPoints<TracingInfo['tracingInfos'][number]>(
      selectedInterval.start,
      selectedInterval.end,
      30
    )

    const minutesPerInterval = moment(intervalPoints[0].end).diff(intervalPoints[0].start, 'minute')

    const allOperations: TracingInfo['tracingInfos'] = Object.keys(tracingInfos).reduce((acc, curr) => {
      const infos = tracingInfos[curr]
      acc.push(...infos.tracingInfos.map((v) => ({ ...v, parent: curr, type: infos.type })))
      return acc
    }, [])

    return allOperations
      .reduce((acc, curr) => {
        const currStartTime = new Date(curr.startTime).getTime()
        const find = acc.find((interval) => {
          return interval.start < currStartTime && interval.end > currStartTime
        })
        if (find) {
          find.values.push(curr)
        }
        return acc
      }, intervalPoints)
      .map((interval) => {
        const startDate = new Date(interval.start)
        const formattedLabel = intl.formatTime(startDate)
        const queryCount = interval.values.reduce((acc, curr) => (curr.type === 'query' ? acc + 1 : acc), 0)
        const mutationCount = interval.values.reduce((acc, curr) => (curr.type === 'mutation' ? acc + 1 : acc), 0)
        const mutationRPM = roundTo2Precision(mutationCount / minutesPerInterval)
        const queryRPM = roundTo2Precision(queryCount / minutesPerInterval)
        const latencies = interval.values.map((value) => value.duration)
        return {
          ...interval,
          count: interval.values.length,
          mutationCount: mutationCount,
          queryCount: queryCount,
          rpm: roundTo2Precision(interval.values.length / minutesPerInterval),
          latencies,
          queryRPM,
          mutationRPM,
          start: formattedLabel
        }
      })
  }, [selectedInterval.id])

  const latencyScatterData = operationsInInterval.reduce((acc, curr, index) => {
    curr.latencies.forEach((latency) => {
      acc.push({
        x: index,
        start: curr.start,
        y: convertNSToMs(latency)
      })
    })
    return acc
  }, [])

  return (
    <MainNav index={0}>
      <Wrapper ref={wrapperRef}>
        <h1>Dashboard</h1>
        <ul className="widget-list">
          <li>
            <TextWidget value={'XXX'} label={'Schema Version'} />
          </li>
          <li>
            <TextWidget
              value={Object.values(tracingInfos).reduce((acc, curr) => acc + curr.count, 0)}
              label={'Total Operations'}
            />
          </li>
          <li>
            <TextWidget error={errorCount > 0} success={errorCount === 0} value={errorCount} label={'Errors'} />
          </li>
        </ul>
        <div>p95 Service average latency</div>
        Charts
        <div>Errors per Interval</div>
        <div>Operation per Time w/ latency</div>
        <div>Latency Distribution</div>
        <div>RPM per Interval</div>
        <select
          value={selectedInterval.id}
          onChange={(e) => {
            console.log(e)
            setSelectedInterval(intervals.find((interval) => interval.id === e.target.value))
          }}
        >
          {intervals.map((interval) => {
            return (
              <option key={interval.id} value={interval.id}>
                {interval.label}
              </option>
            )
          })}
        </select>
        <div>
          <h2>RPM</h2>
          <ComposedChart width={width - 32} height={250} data={operationsInInterval}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="start" domain={['dataMin', 'dataMax']} />
            <YAxis dataKey={'rpm'} label="RPM" />
            <Tooltip />
            <Line type="linear" connectNulls dataKey="rpm" stroke={theme.color.primary} name="Total" unit="rpm" />
            <Area
              type="linear"
              connectNulls
              dataKey="queryRPM"
              stroke={theme.color.accent1}
              unit="rpm"
              name="Queries RPM"
              fillOpacity={0.3}
              fill={theme.color.accent1}
            />
            <Area
              type="linear"
              connectNulls
              dataKey="mutationRPM"
              stroke={theme.color.accent2}
              fill={theme.color.accent2}
              unit="rpm"
              name="Mutations RPM"
              fillOpacity={0.3}
            />
          </ComposedChart>
          <h2>Latency over time</h2>
          <ScatterChart width={width - 32} height={400}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, operationsInInterval.length]}
              tickCount={operationsInInterval.length}
              tick={(props) => {
                const { x, y, payload, fill, width, height, orientation } = props
                if (!payload.isShow) {
                  return null
                }
                return (
                  <text x={x} y={y} width={width} height={height} orientation={orientation} text-anchor="middle">
                    <tspan x={x} dy="0.71em">
                      {operationsInInterval[props.payload.value]?.start}
                    </tspan>
                  </text>
                )
              }}
            />
            <YAxis type="number" dataKey="y" unit={'ms'} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              labelFormatter={(props) => ''}
              formatter={(value, name, props) => {
                switch (name) {
                  case 'x': {
                    return [operationsInInterval[value].start, 'Time']
                  }
                  case 'y': {
                    return [value, 'Latency']
                  }
                }
                return null
              }}
            />
            <Scatter
              data={latencyScatterData}
              fill="#8884d8"
              // shape={(props) => {
              //   const { x, width, fill, yAxis, node } = props
              //   const { y: nodeY } = node
              //   const totalYAxisHeight = yAxis.height
              //   // for some reason you have to substract 2x yAxis offset.
              //   // calculate the normalized value of one datapoint e.g. 100px height domain 0 - 400. Each "domainpoint" will be worth it 0.25px
              //   // so a scatter with Y [200, 400] should have 50px height
              //   const heightPerDomainPoint = (totalYAxisHeight - 2 * yAxis.y) / (yAxis.domain[1] - yAxis.domain[0])
              //   const resolvedHeight = (nodeY[1] - nodeY[0]) * heightPerDomainPoint
              //   const nodeYOffset = nodeY[0] * heightPerDomainPoint
              //   const resolvedY = totalYAxisHeight + yAxis.y - resolvedHeight - nodeYOffset
              //   return <rect x={x} width={width} fill={fill} height={resolvedHeight} y={resolvedY} />
              // }}
              shape="square"
            />
          </ScatterChart>
          <h2>Total Operations</h2>
          <BarChart width={width - 32} height={250} data={operationsInInterval}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="start" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="queryCount" fill={theme.color.accent1} stackId="a" name="Queries" />
            <Bar dataKey="mutationCount" fill={theme.color.accent2} stackId="a" name="Mutations" />
          </BarChart>
        </div>
        <div>
          <h2>Top Operations</h2>
        </div>
      </Wrapper>
    </MainNav>
  )
}

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries. See the "Technical details" section.
export async function getServerSideProps() {
  const {
    infos: tracingInfos,
    errors
  }: {
    infos: Record<string, TracingInfo>
    errors: Record<string, ErrorInfo>
  } = await (await fetch('http://localhost:5000/tracingInfos')).json()
  // By returning { props: posts }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      tracingInfos,
      errorCount: Object.values(errors).reduce((acc, curr) => acc + (curr.errors?.length || 0), 0)
    }
  }
}

export default Dashboard
