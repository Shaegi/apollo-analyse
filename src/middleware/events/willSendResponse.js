module.exports = ({ queryInfos, operationsToSkip, db }) => (requestContext) => {
  if (operationsToSkip.includes(requestContext.operationName)) {
    return
  }
  console.log('send response', requestContext.operationName)

  const tracingInfos = requestContext.response.extensions.tracing

  db.update('operations', (queryInfos) => {
    if (queryInfos[requestContext.queryHash]) {
      const prev = queryInfos[requestContext.queryHash]
      prev.count++
      prev.tracingInfos.push(tracingInfos)
    } else {
      queryInfos[requestContext.queryHash] = {
        count: 1,
        type: requestContext.operation.operation,
        name: requestContext.operationName,
        tracingInfos: [tracingInfos]
      }
    }
    return queryInfos
  }).write()
}
