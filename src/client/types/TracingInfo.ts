
export type TracingInfo = {
    count: number
    name: string
    tracingInfos: {
        duration: number, 
        startTime: string, 
        endTime: string, 
        execution: {
            resolvers: 
                { 
                    duration: number, 
                    fieldName: string 
                    startOffset: number
                    parentType: string
                }[] 
            }
        }[]
}