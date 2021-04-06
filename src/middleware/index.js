const startServer = require('./server')
const willSendResponse  = require('./events/willSendResponse')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
// TODO: Create db if non exists
const adapter = new FileSync('./db.json')
const db = low(adapter)

db.defaults({ operations: {} })
  .write()

const queryInfos = {}
const errors = {}

const operationsToSkip = ["IntrospectionQuery"];

module.exports = (options) => {
  return {
    serverWillStart() {
      console.log("Started");
      startServer(queryInfos, errors, db)
    },
    requestDidStart(requestContext) {

      return {
        parsingDidStart(requestContext) {
          console.log("Parsing started!");
        },

        validationDidStart(requestContext) {
          console.log("Validation started!");
        },
        willSendResponse: willSendResponse({ queryInfos, operationsToSkip, db }),
        didEncounterErrors(requestContext) {
          console.log("encounter erro", requestContext);
          if(!errors[requestContext.queryHash]) {
            errors[requestContext.queryHash] = {
              errors: requestContext.errors,
              operationName: requestContext.operationName
            }
          } else {
            errors[requestContext.queryHash] = {
              ...errors[requestContext.queryHash],
              errors: [...errors[requestContext.queryHash].errors, requestContext.errors]
            } 
          }
        },
      };
    },
  };
};
