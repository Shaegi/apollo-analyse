export type TracingInfo = {
  count: number
  name: string
  errors: number
  tracingInfos: {
    duration: number
    startTime: string
    endTime: string
    execution: {
      resolvers: {
        path: (string | number)[]
        duration: number
        fieldName: string
        returnType: string
        startOffset: number
        parentType: string
      }[]
    }
  }[]
}

export type ErrorInfo = {
  operationName: string
  errors: Errors
}

export type Errors = (ErrorObj | ErrorObj[])[]

export type ErrorObj = {
  message: string
  locations: {
    column: number
    line: number
  }[]
  path: string[]
}
