import { Tracing } from 'node:trace_events'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { TracingInfo } from '../../../types/TracingInfo'
import { formatNStoMsString } from '../../../utils'
import { OperationNode } from './AveragedOperation'
import classNames from 'classnames'
import { set, cloneDeep } from 'lodash'
import { findDeep } from './utils'

type WrapperProps = {}

const Wrapper = styled.div<WrapperProps>`
  .resolver-wrapper {
    .content {
      display: flex;
      .title {
        display: inline-flex;
      }
    }
  }
`

export type ResolverInfoProps = {
  resolvers: TracingInfo['tracingInfos'][number]['execution']['resolvers']
}

const ResolverInfo: React.FC<ResolverInfoProps> = (props) => {
  const { resolvers } = props
  console.log(resolvers)
  const resolverTree = useMemo(() => {
    const result = []
    resolvers.forEach((resolver, resolverIndex) => {
      let currentPathParent = null
      debugger

      let pushed = false
      resolver.path.forEach((path, index, arr) => {
        if (pushed) {
          return
        }
        const isLastPath = index === arr.length - 1
        // last path so push

        const createNewEntry = (resolver) => ({
          fields: [],
          children: [],
          ...resolver,
        })

        if (typeof path === 'string') {
          // string paths are continuing within fields, search in there
          const parent =
            currentPathParent?.fieldName === path
              ? currentPathParent
              : currentPathParent?.fields?.find(
                  (node) => node.fieldName === path
                ) || result.find((node) => node.fieldName === path)
          if (parent) {
            if (isLastPath) {
              parent.fields.push(createNewEntry(resolver))
            } else {
              currentPathParent = parent
            }
          } else if (!currentPathParent) {
            console.log(
              'Push root',
              path,
              resolver,
              cloneDeep(result),
              cloneDeep(currentPathParent)
            )

            // if resolved correctly this it should be a root resolver
            result.push(createNewEntry(resolver))
          } else {
            currentPathParent.fields.push({
              ...resolver,
              fields: [],
              children: [],
            })
          }
        } else if (typeof path === 'number') {
          // number paths are continuing within chidlren, search in there
          const parent = currentPathParent?.children[path]
          if (parent) {
            currentPathParent = parent
          } else {
            pushed = true
            currentPathParent?.children.push(
              createNewEntry({
                name: resolver.parentType,
                fields: [createNewEntry(resolver)],
              })
            )
          }
        }
      })
    })
    return result
  }, [resolvers])

  const averageDuration = useMemo(() => {
    const totalDuration = resolvers.reduce(
      (acc, curr) => acc + curr.duration,
      0
    )
    const totalResolvers = resolvers.length

    return totalDuration / totalResolvers
  }, [resolvers])

  const renderChildren = (node: OperationNode, level = 0) => {
    const percentageDifferenceToAverage =
      ((node.duration - averageDuration) / node.duration) * 100
    console.log(node, percentageDifferenceToAverage, averageDuration)
    return (
      <div
        key={node.fieldName || node.name}
        className="resolver-wrapper"
        style={{ marginLeft: level * 20 }}
      >
        <div className="content">
          <span className="title">
            <h4>{node.fieldName || node.name}</h4>
            <span className="return-type">:{node.returnType}</span>
          </span>
          <span className={classNames('duration', { slow: false })}>
            {node.duration && <div>{formatNStoMsString(node.duration)}</div>}
          </span>
        </div>
        {node.fields && (
          <div>{node.fields.map((v) => renderChildren(v, level))}</div>
        )}
        {node.children && (
          <div>{node.children.map((v) => renderChildren(v, level + 1))}</div>
        )}
      </div>
    )
  }
  return <Wrapper> {resolverTree.map((v) => renderChildren(v, 0))}</Wrapper>
}

export default ResolverInfo
