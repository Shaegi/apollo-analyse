import { info } from 'console'
import { InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { resolve } from 'path'
import styled from 'styled-components'
import TextWidget from '../../components/TextWidget'
import { TracingInfo } from '../../types/TracingInfo'
import { convertNSToMs, getAverageExecutionTimeInMs } from '../../utils'

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
`

export type OperationProps = InferGetStaticPropsType<typeof getStaticProps>

const OperationProps: React.FC<OperationProps> = (props) => {
  const { name, count, averageExecutionTime, operationTree } = props
  console.log(props)

  return <Wrapper>
    <a href='/'>{"< Back to Dashboard"}</a>
    <h1>
      {name}
    </h1>
    <div className='widgets'>
      <TextWidget label='Count' value={count} />
      <TextWidget label='Average Time' value={averageExecutionTime + 'ms'} />
    </div>
    <div>
      {operationTree.map(operation => {
        const renderChildren = (obj) => {
          console.log('render', obj)
          return <div>
            {obj.fieldName}
            <div>{obj.averageExecutionTime}ms</div>
          </div>
        }
        console.log(operation)
        return <div className='operation-wrapper'>
          <div>
            <div>{operation.name}</div>
            <div>{operation.averageExecutionTime}ms</div>
          </div>
          <div>
            {operation.children.map(renderChildren)}
          </div>
        </div>
      })}
    </div>
  </Wrapper>
}

export async function getStaticProps({ params }) {
  const { operation } = params
  const res: TracingInfo = await (await fetch('http://localhost:5000/tracingInfos/' + operation)).json()

  const operationTree = res.tracingInfos.reduce((acc, curr, infoIndex) => {
    curr.execution.resolvers.forEach((resolver, resolverIndex) => {
      const findDeep = (obj: Record<string, any> & { children?: any[] }, condition: (node: typeof obj) => boolean) => {
          if(condition(obj)) {
            return obj
          } else if(obj.children) {
            return obj.children.reduce((acc, curr) => findDeep(curr, condition), null)
          }
          return null
      }
      // find any field in tree with the same name as parent
      const parent = acc.find((v) => findDeep(v, (obj) => resolver.parentType === obj.name || resolver.parentType === obj.parentType))
      console.log(resolver.parentType, acc.map(v => v.name))
      if(parent) {
        const child = parent.children.find(c => c.fieldName === resolver.fieldName)
        if(child) {
          child.totalExecutionTime += resolver.duration
        } else {
          parent.children.push({  ...resolver, totalExecutionTime: resolver.duration })
        }

      } else {
        // seems to be a new root type
        acc.push({
          name: resolver.parentType,
          children: [{  ...resolver, totalExecutionTime: resolver.duration }]
        })
      }
    })  

    return acc
  }, []).map(v => ({...v, averageExecutionTime: convertNSToMs(v.totalExecutionTime / res.tracingInfos.length) }))


  return {
    props: {
      res,
      name: res.name,
      count: res.count,
      averageExecutionTime: getAverageExecutionTimeInMs(res),
      operationTree
    }, // will be passed to the page component as props
  }
}

export async function getStaticPaths() {
  // Call an external API endpoint to get posts
  const res = await fetch('http://localhost:5000/tracingInfos')
  const operations = await res.json()

  // Get the paths we want to pre-render based on posts
  const paths = Object.keys(operations).map((key) => ({
    params: { operation: key },
  }))

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false }
}

export default OperationProps