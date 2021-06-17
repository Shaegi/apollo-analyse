import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { TracingInfo } from '../../../types/TracingInfo'
import { formatNStoMsString } from '../../../utils'
import { geClosestNumber } from './utils'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import Tabs from '../../../components/HorizontalTabs'
import FlameChart from '../../../components/FlameChart'
import ResolverInfo from './ResolverInfo'

type WrapperProps = {}

const Wrapper = styled.div<WrapperProps>``

export type PerOperationProps = {
  tracingInfo: TracingInfo
}

const PerOperation: React.FC<PerOperationProps> = (props) => {
  const { tracingInfo } = props
  const groups = useMemo(() => {
    const sorted = tracingInfo.tracingInfos.sort((a, b) => {
      return a.duration < b.duration ? -1 : a.duration === b.duration ? 0 : 1
    })
    const highestDuration = sorted[sorted.length - 1].duration
    // 20% steps
    const groupGap = 20

    const blankGroups = []
    for (let i = 0; i <= 100; i += groupGap) {
      blankGroups.push({
        percentage: Math.round(i),
        startRange: formatNStoMsString(highestDuration * (i / 100)),
        endRange: formatNStoMsString(highestDuration * (i + groupGap / 100)),
        operations: [],
        operationsCount: 0
      })
    }

    return sorted.reduce((acc, curr) => {
      const ownPercentage = (curr.duration / highestDuration) * 100
      const closestPercentage = geClosestNumber(
        blankGroups.map(({ percentage }) => percentage),
        ownPercentage
      )

      const find = blankGroups.find((v) => v.percentage === closestPercentage)

      find.operations.push(curr)
      find.operationsCount++
      return acc
    }, blankGroups)
  }, [])

  const [selectedGroup, setSelectedGroup] = useState(
    groups.reduce((acc, curr) => (!acc || acc.operations.length < curr.operations.length ? curr : acc), null)
  )
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(0)

  const nextDisabled = selectedOperationIndex === selectedGroup.operations.length - 1
  const prevDisabled = selectedOperationIndex === 0

  const handlePreviousOperation = useCallback(() => {
    if (!prevDisabled) {
      setSelectedOperationIndex((prev) => {
        return prev - 1
      })
    }
  }, [prevDisabled])

  const handleNextOperation = useCallback(() => {
    if (!nextDisabled) {
      setSelectedOperationIndex((prev) => {
        return prev + 1
      })
    }
  }, [nextDisabled])

  const selectedOperation: TracingInfo['tracingInfos'][number] = selectedGroup.operations[selectedOperationIndex]

  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  console.log(selectedOperation)
  return (
    <Wrapper>
      <BarChart width={730} height={250} data={groups}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="startRange" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="operationsCount"
          fill="#82ca9d"
          background={{ fill: 'transparent' }}
          onClick={(data, index, event) => {
            if (groups[index].operations.length > 0) {
              setSelectedGroup(groups[index])
            }
          }}
        >
          {groups.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.percentage === selectedGroup.percentage ? 'red' : 'green'}
              strokeWidth={index === 2 ? 4 : 1}
            />
          ))}
        </Bar>
      </BarChart>
      <div>
        <button onClick={handlePreviousOperation}>{'<'}</button>
        {selectedOperationIndex + 1} out of {selectedGroup.operations.length}
        <button onClick={handleNextOperation}>{'>'}</button>
      </div>
      <Tabs
        selectedIndex={selectedTabIndex}
        tabs={[
          {
            id: 'resolver',
            label: 'Resolver',
            content: <ResolverInfo resolvers={selectedOperation.execution.resolvers} />
          },
          {
            id: 'flameChart',
            label: 'Flamechart',
            content: (
              <FlameChart
                dataPoints={selectedOperation.execution.resolvers.map((resolver) => {
                  const pathLabel = (() => {
                    return resolver.path.map((v, i, a) => {
                      const next = a[i + 1]
                      if (typeof v === 'number') {
                        const label = `[${v}]`
                        if (next && typeof next === 'string') {
                          return label + '.'
                        }
                        return label
                      }
                      if (next && typeof a[i + 1] !== 'number') {
                        return v + '.'
                      }
                      return v
                    })
                  })()
                  return {
                    label: (
                      <>
                        {pathLabel}
                        <span className="duration">{formatNStoMsString(resolver.duration)}</span>
                      </>
                    ),
                    value: resolver.duration
                  }
                })}
              />
            )
          }
        ]}
        onSelect={(info, index) => setSelectedTabIndex(index)}
      />
    </Wrapper>
  )
}

export default PerOperation
