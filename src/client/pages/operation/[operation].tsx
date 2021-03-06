import { InferGetStaticPropsType } from 'next'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Tabs, { TabsProps } from '../../components/HorizontalTabs'
import TextWidget from '../../components/TextWidget'
import { ErrorInfo, Errors, TracingInfo } from '../../types/TracingInfo'
import { formatNStoMsString, getAverageExecutionTimeInMs } from '../../utils'
import AveragedOperation from './tabs/AveragedOperation'
import ErrorDetails from './tabs/Errors'
import FlameChart from '../../components/FlameChart'
import PerOperation from './tabs/PerOperation'

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

  .recharts-bar-background-rectangle {
    cursor: pointer;
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

  .duration {
    font-weight: bold;
    margin-left: ${(p) => p.theme.size.xs};
  }
`

export type OperationProps = InferGetStaticPropsType<typeof getServerSideProps>

const OperationProps: React.FC<OperationProps> = (props) => {
  const { name, count, averageExecutionTime, errors, res } = props

  const [activeTab, setActiveTab] = useState(0)

  const handleSwitchTabs = useCallback<TabsProps['onSelect']>((tab, index) => {
    setActiveTab(index)
  }, [])

  const errorCount = errors?.length || 0

  return (
    <Wrapper>
      <a href="/">{'< Back to Dashboard'}</a>
      <h1>{name}</h1>
      <div className="widgets">
        <TextWidget label="Count" value={count} />
        <TextWidget label="Average Time" value={averageExecutionTime + 'ms'} />
        <TextWidget label="Errors" value={errorCount} error={errorCount > 0} success={errorCount === 0} />
      </div>

      <Tabs
        tabs={[
          {
            label: 'Overview',
            content: (
              <>
                <AveragedOperation tracingInfos={res.infos.tracingInfos} />
              </>
            ),
            id: 'averagedOperation'
          },
          {
            label: 'Per Operation',
            id: 'perOoperation',
            content: <PerOperation tracingInfo={res.infos} />
          },
          {
            label: 'Resolver Flamechart',
            content: (
              <FlameChart
                dataPoints={res.infos.tracingInfos[0].execution.resolvers.map((resolver) => {
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
            ),
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
  )
}

export async function getServerSideProps({ params }) {
  const { operation } = params
  const res: { infos: TracingInfo; errors: ErrorInfo } = await (
    await fetch('http://localhost:5000/tracingInfos/' + operation)
  ).json()

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
