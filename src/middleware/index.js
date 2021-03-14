const { query } = require('express');
const startServer = require('./server')

const queryInfos = {};

const operationsToSkip = ["IntrospectionQuery"];

module.exports = (options) => {
  return {
    serverWillStart() {
      console.log("Started");
      startServer(queryInfos)
    },
    requestDidStart(requestContext) {

      return {
        parsingDidStart(requestContext) {
          console.log("Parsing started!");
        },

        validationDidStart(requestContext) {
          console.log("Validation started!");
        },
        willSendResponse(requestContext) {
          if (operationsToSkip.includes(requestContext.operationName)) {
            return
          }
          console.log('send response', requestContext.operationName)

          const tracingInfos = requestContext.response.extensions.tracing;
          if (queryInfos[requestContext.queryHash]) {
            const prev = queryInfos[requestContext.queryHash];
            prev.count++;
            prev.tracingInfos.push(tracingInfos);
          } else {
            queryInfos[requestContext.queryHash] = {
              count: 1,
              name: requestContext.operationName,
              tracingInfos: [tracingInfos],
            };
          }
        },
        didEncounterErrors() {
          console.log("encounter erro");
        },
      };
    },
  };
};
