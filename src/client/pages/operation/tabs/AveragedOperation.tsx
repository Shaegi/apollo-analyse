import React from 'react'
import styled from 'styled-components'
import { TracingInfo } from '../../../types/TracingInfo'
import { convertNSToMs } from '../../../utils'
import { Node } from './utils'

type WrapperProps = {}

const Wrapper = styled.div<WrapperProps>``

export type AveragedOperationProps = {
    tracingInfos: TracingInfo['tracingInfos']
}


export type OperationNode = Node<({
    totalExecutionTime?: number
    totalExecutions?: number
    name?: string
  } & TracingInfo['tracingInfos'][number]['execution']['resolvers'][number])>
  

const AveragedOperation:React.FC<AveragedOperationProps> = props => {
    const { tracingInfos } = props
    const operationTree = tracingInfos.reduce((acc, curr, infoIndex) => {
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

        const renderChildren = (node: OperationNode, level = 0) => {
            return <div key={node.fieldName || node.name} style={ {marginLeft: level * 20} }>
              <h4>{node.fieldName || node.name}</h4>
              {node.totalExecutionTime && <div>{convertNSToMs(node.totalExecutionTime / node.totalExecutions)}ms</div>}
                {node.children && <div>
                {node.children.map(v => renderChildren(v, level + 1))}
              </div>}
            </div>
          }
return <Wrapper> {operationTree.map(v => renderChildren(v, 0))}</Wrapper>
}

export default AveragedOperation
