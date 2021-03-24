import { InferGetStaticPropsType } from 'next'
import styled from 'styled-components'
import TextWidget from '../components/TextWidget'
import { ErrorInfo, TracingInfo } from '../types/TracingInfo'
import { getAverageExecutionTimeInMs } from '../utils'


const Wrapper = styled.main`
  h1 {
    padding-bottom: 24px;
  }
  padding: 16px;
  ul {
    gap: 8px;
    display: flex; 
  }

  ul.widget-list {
    margin-bottom: 32px;
  }

  ul.operation-list {
    flex-direction: column;
    li {
      a {
        display: block;
        text-decoration: none;
        color: black;
        padding: 8px 16px;
        border: 1px solid grey;
        border-radius: 4px;
      }
      :hover {
        box-shadow: 3px 1px 3px 0px grey;
        cursor: pointer;
      }
    }
  }
`

export type DashboardProps = InferGetStaticPropsType<typeof getStaticProps>

function Dashboard(props: InferGetStaticPropsType<typeof getStaticProps>) {
  console.log(props)
  const { tracingInfos, errorCount } = props
  return (
      <Wrapper>
        <h1>Dashboard</h1>
        <ul className='widget-list'>
          <li>
            <TextWidget 
              error={errorCount > 0}
              success={errorCount === 0}
              value={errorCount}
              label={'Errors'}
            />
          </li>
          <li>
            <TextWidget 
              value={Object.values(tracingInfos).reduce((acc, curr) => acc + curr.count, 0)}
              label={'Total Operations'}
            />
          </li>
        </ul>
        <ul className='operation-list'>
        {Object.keys(tracingInfos).map(key => {
          const info = tracingInfos[key]
          return <li key={key}>
              <a href={'/operation/' + key}>
                <h4>
                    {info.name}
                </h4>
                <div>
                  <span>Count: {info.count}</span>
                  <div>Average: {getAverageExecutionTimeInMs(info)}ms</div>
                </div>
              </a>
            </li>
        })}
        </ul>
      </Wrapper>
  )
}

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries. See the "Technical details" section.
export async function getStaticProps() {
  const { infos: tracingInfos, errors }: { infos: Record<string, TracingInfo>, errors: Record<string, ErrorInfo>} = await (await fetch('http://localhost:5000/tracingInfos')).json()
  // By returning { props: posts }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      tracingInfos,
      errorCount: Object.values(errors).reduce((acc, curr) => acc + (curr.errors?.length || 0) ,0)
    },
  }
}

export default Dashboard