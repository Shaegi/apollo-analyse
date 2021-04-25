import { InferGetStaticPropsType } from 'next'
import React from 'react'
import styled from 'styled-components'
import MainNav from '../../components/MainNav'
import { ErrorInfo, TracingInfo } from '../../types/TracingInfo'
import { getAverageExecutionTimeInMs } from '../../utils'

type WrapperProps = {}

const Wrapper = styled.div<WrapperProps>`
  padding: 16px;

  ul.operation-list {
    display: flex;
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

export type OperationsProps = InferGetStaticPropsType<typeof getServerSideProps>

const Operations: React.FC<OperationsProps> = (props) => {
  const { tracingInfos } = props
  return (
    <MainNav index={1}>
      <Wrapper>
        <h1>Operations</h1>
        <ul className="operation-list">
          {Object.keys(tracingInfos).map((key) => {
            const info = tracingInfos[key]
            return (
              <li key={key}>
                <a href={'/operation/' + key}>
                  <h4>{info.name}</h4>
                  <div>
                    <span>Count: {info.count}</span>
                    <div>Average: {getAverageExecutionTimeInMs(info)}ms</div>
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      </Wrapper>
    </MainNav>
  )
}

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

export default Operations
