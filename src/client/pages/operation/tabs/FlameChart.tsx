import React from 'react'
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import styled from 'styled-components'
import { TracingInfo } from '../../../types/TracingInfo'
import { convertNSToMs, formatNStoMsString } from '../../../utils'
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

  .duration {
    font-weight: bold;
  }

  span + span {
    margin-left: ${(p) => p.theme.size.xs};
  }
`

export type FlameChartProps = {
  tracingInfo: TracingInfo['tracingInfos'][number]['execution']
}

const FlameChart: React.FC<FlameChartProps> = (props) => {
  const { tracingInfo } = props

  const sorted = cloneDeep(tracingInfo).resolvers.sort((a, b) => {
    return a.duration < b.duration ? 1 : a.duration === b.duration ? 0 : -1
  })
  const highestDuration = sorted[0].duration

  return (
    <Wrapper>
      <ul>
        {sorted.map((resolver) => {
          const percentage = (resolver.duration / highestDuration) * 100
          console.log(percentage, highestDuration, resolver.duration)
          return (
            <li style={{ width: percentage + '%' }}>
              <span>
                {resolver.path.map((v, i, a) => {
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
                })}
              </span>
              <span className="duration">{formatNStoMsString(resolver.duration)}</span>
            </li>
          )
        })}
      </ul>
    </Wrapper>
  )
}

export default FlameChart
