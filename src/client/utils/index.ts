import { TracingInfo } from "../types/TracingInfo";

export const getAverageExecutionTimeInMs = (info: TracingInfo) => convertNSToMs(info.tracingInfos.reduce((acc, curr) => acc + curr.duration, 0) / info.tracingInfos.length)

export const convertNSToMs = (num: number) => Math.round(num / 10000) / 100

export const findDeep = (obj: Record<string, any> & { children?: any[] }, condition: (node: typeof obj) => boolean) => {
    if(condition(obj)) {
      return obj
    } else if(obj.children) {
      return obj.children.reduce((acc, curr) => findDeep(curr, condition), null)
    }
    return null
}

export const deepMap = (obj: Record<string, any> & { children?: any[] }, map: (node: typeof obj) => Record<string, any>) => {
    if(obj.children) {
        return {
            ...map(obj),
            children: obj.children? obj.children.map((v) => deepMap(v, map)) : undefined
        }
    }
    return map(obj)
}