
export type TracingInfo = {
    count: number
    name: string
    errors: number
    tracingInfos: {
        duration: number, 
        startTime: string, 
        endTime: string, 
        execution: {
            resolvers: 
                {   
                    path: (string | number)[]
                    duration: number, 
                    fieldName: string 
                    startOffset: number
                    parentType: string
                }[] 
            }
        }[]
}

export type ErrorInfo = {
    operationName: string
    errors: {
        message: string
        name: string
        path: string[]
    }[]
}