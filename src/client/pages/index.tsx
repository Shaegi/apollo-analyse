import { InferGetStaticPropsType } from 'next'
import styled, { useTheme } from 'styled-components'
import TextWidget from '../components/TextWidget'
import { ErrorInfo, TracingInfo } from '../types/TracingInfo'
import VerticalTabs from '../components/VerticalTabs'
import { useMemo, useState } from 'react'
import MainNav from '../components/MainNav'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { useIntl } from 'react-intl'
import { isTypeOnlyImportOrExportDeclaration } from 'typescript'
import moment from 'moment'
import { Theme } from './_app'

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

export type DashboardProps = InferGetStaticPropsType<typeof getStaticProps>

function Dashboard(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const { tracingInfos, errorCount } = props
  const [selectedIndex, setSelectedIndex] = useState(0)

  const rpmData = [
    {
      time: 0,
      rpm: 0
    },
    {
      time: 2000,
      rpm: 30
    },
    {
      time: 3000,
      rpm: 0
    },
    {
      time: 4000,
      rpm: 32
    },
    {
      time: 4500,
      rpm: 10
    },
    {
      time: 5000,
      rpm: 100
    }
  ]

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
      10
    )

    const minutesPerInterval = moment(intervalPoints[0].end).diff(intervalPoints[0].start, 'minute')

    const allOperations: TracingInfo['tracingInfos'] = Object.values(tracingInfos).reduce((acc, curr) => {
      acc.push(...curr.tracingInfos)
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
        return {
          ...interval,
          rpm: interval.values.length / minutesPerInterval,
          count: Math.round((interval.values.length / minutesPerInterval) * 1000) / 1000,
          start: formattedLabel
        }
      })
  }, [selectedInterval.id])

  return (
    <MainNav index={0}>
      <Wrapper>
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
        <LineChart
          width={1500}
          height={250}
          data={operationsInInterval}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="start" />
          <YAxis
            dataKey={'count'}
            label="RPM"
            domain={['dataMin', (dataMax: number) => (dataMax ? Math.max(dataMax, dataMax * 1.5) : 3)]}
          />

          <Tooltip />
          <Line type="linear" connectNulls dataKey="count" stroke={theme.color.primary} />
        </LineChart>
      </Wrapper>
    </MainNav>
  )
}

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries. See the "Technical details" section.
export async function getStaticProps() {
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
