import React from 'react'
import styled from 'styled-components'
import { cloneDeep } from 'lodash'

type WrapperProps = {}

const Wrapper = styled.div<WrapperProps>`
  white-space: nowrap;
  flex-direction: column;

  li {
    background: ${(p) => p.theme.color.primary};
    border-radius: 2px;
    padding: ${(p) => p.theme.size.xs};
    box-sizing: border-box;
  }

  li + li {
    margin-top: ${(p) => p.theme.size.xs};
  }
`

export const sortFlameChartDataPoints = (dataPoints: FlameChartDataPoint[]): FlameChartDataPoint[] => {
  return cloneDeep(dataPoints || []).sort((a, b) => {
    return a.value < b.value ? 1 : a.value === b.value ? 0 : -1
  })
}

export type FlameChartDataPoint<A = {}> = {
  label: React.ReactNode
  color?: string
  value: number
  onClick?: (dataPoint: FlameChartDataPoint<A>) => void
} & A

export type FlameChartProps<A = {}> = {
  dataPoints: FlameChartDataPoint<A>[]
}

const FlameChart: React.FC<FlameChartProps> = (props) => {
  const { dataPoints } = props

  const sortedDataPoints: FlameChartDataPoint[] = cloneDeep(dataPoints || []).sort((a, b) => {
    return a.value < b.value ? 1 : a.value === b.value ? 0 : -1
  })
  const highestValue = sortedDataPoints[0]?.value

  return (
    <Wrapper>
      <ul>
        {sortedDataPoints.map((dataPoint) => {
          const percentage = (dataPoint.value / highestValue) * 100
          return (
            <li
              style={{
                width: percentage + '%',
                background: dataPoint.color,
                cursor: dataPoint.onClick ? 'pointer' : undefined
              }}
              onClick={() => dataPoint.onClick(dataPoint)}
            >
              <span>{dataPoint.label}</span>
            </li>
          )
        })}
      </ul>
    </Wrapper>
  )
}

export default FlameChart
