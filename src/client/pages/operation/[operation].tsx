import { InferGetStaticPropsType } from 'next'
import { useCallback, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import styled from 'styled-components'
import Tabs, { TabsProps } from '../../components/Tabs'
import TextWidget from '../../components/TextWidget'
import { ErrorInfo, Errors, TracingInfo } from '../../types/TracingInfo'
import {  formatNStoMsString, getAverageExecutionTimeInMs } from '../../utils'
import AveragedOperation from './tabs/AveragedOperation'
import ErrorDetails from './tabs/Errors'
import FlameChart from './tabs/FlameChart'
import { geClosestNumber } from './tabs/utils'

const Wrapper = styled.div`
  padding: 16px;
  .widgets {
    display: flex;
    gap: 8px;
  }
  .operation-wrapper > div {
    display: flex;
    justify-content: space-between;
  }

  .error {
    display: block;
    > ul {
      > li {
        margin-inline-start: 1em;
        list-style: decimal;
      }
    }
  }
`

export type OperationProps = InferGetStaticPropsType<typeof getServerSideProps>

const OperationProps: React.FC<OperationProps> = (props) => {
  const { name, count, averageExecutionTime,  errors, res } = props

  const [activeTab, setActiveTab] = useState(0)

  const handleSwitchTabs = useCallback<TabsProps['onSelect']>((tab, index) => {
    setActiveTab(index)
  },[])

  const errorCount = errors?.length || 0

  const groups = useMemo(() => {
    const sorted = res.infos.tracingInfos.sort((a, b) => {
      return a.duration < b.duration ? -1 : a.duration === b.duration ? 0 : 1
    })
    const highestDuration = sorted[sorted.length -1].duration
    // 20% steps
    const groupGap = 20

    const blankGroups = []
    for(let i = 0; i <= 100; i += groupGap) {
      blankGroups.push({
        percentage: Math.round(i),
        startRange: formatNStoMsString(highestDuration * (i / 100)),
        endRange: formatNStoMsString(highestDuration * (i + groupGap / 100)),
        operations: [],
        operationsCount: 0
      })
    }

    return sorted.reduce((acc, curr) => {
      const ownPercentage =  curr.duration / highestDuration * 100
      const closestPercentage = geClosestNumber(blankGroups.map(({percentage}) => percentage), ownPercentage)

      const find = blankGroups.find(v => v.percentage === closestPercentage)

      find.operations.push(curr)
      find.operationsCount++
      return acc
    }, blankGroups)
  }, [])

  console.log(groups)

  return <Wrapper>
    <a href='/'>{"< Back to Dashboard"}</a>
    <h1>
      {name}
    </h1>
    <div className='widgets'>
      <TextWidget label='Count' value={count} />
      <TextWidget label='Average Time' value={averageExecutionTime + 'ms'} />
      <TextWidget label='Errors' value={errorCount} error={errorCount > 0} success={errorCount === 0} />
    </div>
    <BarChart width={730} height={250} data={groups}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="startRange" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="operationsCount" fill="#82ca9d" />
    </BarChart>
    <Tabs 
      tabs={[
        {
          label: 'Averaged Operation',
          content: <AveragedOperation tracingInfos={res.infos.tracingInfos} />,
          id: 'averagedOperation'
        },
        {
          label: 'Resolver Flamechart',
          content: <FlameChart tracingInfo={res.infos.tracingInfos[0].execution} />,
          id: 'averagedOperation'
        },
        {
          label: 'Errors',
          content: <ErrorDetails errors={errors} />,
            id: 'errors'
        }
      ]}
      selectedIndex={activeTab}
      onSelect={handleSwitchTabs}
    />
    
  </Wrapper>
}

export async function getServerSideProps({ params }) {
  const { operation } = params
  const res: {infos: TracingInfo, errors: ErrorInfo } = await (await fetch('http://localhost:5000/tracingInfos/' + operation)).json()

  return {
    props: {
      res,
      name: res.infos.name,
      errors: res?.errors?.errors || null,
      count: res.infos.count,
      tracingInfos: res.infos.tracingInfos,
      averageExecutionTime: getAverageExecutionTimeInMs(res.infos)
    }
  }
}

export default OperationProps