import { info } from 'console'
import { InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { resolve } from 'path'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import Tabs, { TabsProps } from '../../components/Tabs'
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

type Node<A = {}> = A & {
  children?: Node<A>[]
}

const findDeep = <A extends Object>(arr: Node<A>[], condition: (node: Node<A>) => boolean): Node<A> | null => {
  let found = null
  const find = (obj: Node<A>) => {
    if(condition(obj)) {
      found = obj
      return true
    } else if(obj.children) {
      return obj.children.some(find)
    }
    return null
  }
  arr.some(find)

  return found
}

export type OperationProps = InferGetStaticPropsType<typeof getServerSideProps>

export type OperationNode = Node<({
  totalExecutionTime?: number
  totalExecutions?: number
  name?: string
} & TracingInfo['tracingInfos'][number]['execution']['resolvers'][number])>

const OperationProps: React.FC<OperationProps> = (props) => {
  const { name, count, averageExecutionTime,  errors, res } = props
  const operationTree = res.infos.tracingInfos.reduce((acc, curr, infoIndex) => {
    curr.execution.resolvers.forEach((resolver, resolverIndex) => {
        
        let currentPathParent: OperationNode | null = acc[0]
        resolver.path.forEach((path, index, arr) => {
          if(typeof path === 'string') {
            const child = currentPathParent?.fieldName === path ? currentPathParent : currentPathParent?.children?.find(node => node.fieldName === path)
            if(child) {
              if(index === arr.length -1) {
                child.totalExecutionTime += resolver.duration
                child.totalExecutions += 1
              } else {
                currentPathParent = child
              }
            } else {
              if(index === arr.length -1) {
                if(!currentPathParent) {
                  acc.push({...resolver, totalExecutionTime: resolver.duration, totalExecutions: 1 })
                } else {
                  if(currentPathParent && !currentPathParent?.children) {
                    currentPathParent.children = []
                  }
                  currentPathParent.children.push({
                    ...resolver,
                    totalExecutions: 1,
                    totalExecutionTime: resolver.duration
                  })
                }
              } else {
                if(!currentPathParent) {
                  acc.push({...resolver, totalExecutionTime: resolver.duration, totalExecutions: 1 })
                }
              }
            }
          }
        })
      })
    return acc
  }, [])

  console.log('tree', operationTree, res)


  const renderChildren = (node: OperationNode, level = 0) => {
    console.log(node.name, level)
    return <div key={node.fieldName || node.name} style={ {marginLeft: level * 20} }>
      <h4>{node.fieldName || node.name}</h4>
      {node.totalExecutionTime && <div>{convertNSToMs(node.totalExecutionTime / node.totalExecutions)}ms</div>}
        {node.children && <div>
        {node.children.map(v => renderChildren(v, level + 1))}
      </div>}
    </div>
  }
  const [activeTab, setActiveTab] = useState(0)

  const handleSwitchTabs = useCallback<TabsProps['onSelect']>((tab, index) => {
    setActiveTab(index)
  },[])


  return <Wrapper>
    <a href='/'>{"< Back to Dashboard"}</a>
    <h1>
      {name}
    </h1>
    <div className='widgets'>
      <TextWidget label='Count' value={count} />
      <TextWidget label='Average Time' value={averageExecutionTime + 'ms'} />
      <TextWidget label='Errors' value={errors?.length} error={errors?.length > 0} success={errors?.length === 0} />
    </div>
    <Tabs 
      tabs={[
        {
          label: 'Operation',
          content: (
            <div>
              {operationTree.map(v => renderChildren(v, 0))}
           </div>
          ),
          id: 'Operation'
        },
        {
          label: 'Errors',
          content: (
            <div>
              <ul>
              {errors.map(error => <li>{error.message}</li>)}
              </ul>
           </div>
          ),
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
  const res: {infos: TracingInfo, errors: any } = await (await fetch('http://localhost:5000/tracingInfos/' + operation)).json()
  console.log(res)
  const operationTree = res.infos.tracingInfos.reduce((acc, curr, infoIndex) => {
    curr.execution.resolvers.forEach((resolver, resolverIndex) => {
      // find any field in tree with the same name as parent
      const parent = findDeep<OperationNode>(acc, (obj) => {
        return resolver.parentType === obj.name || resolver.parentType === obj.parentType 
      })
      if(parent) {
        if(parent.children) {
          const child = findDeep(parent.children, c => c.fieldName === resolver.fieldName) 
          if(child) {
            child.totalExecutionTime += resolver.duration
          } else {
            parent.children?.push({  ...resolver, totalExecutionTime: resolver.duration })
          }
        } else {
          parent.children= [{  ...resolver, totalExecutionTime: resolver.duration }]
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
  }, [])

  return {
    props: {
      res,
      name: res.infos.name,
      errors: res?.errors?.errors || null,
      count: res.infos.count,
      tracingInfos: res.infos.tracingInfos,
      averageExecutionTime: getAverageExecutionTimeInMs(res.infos),
      operationTree
    }, // will be passed to the page component as props
  }
}

export default OperationProps