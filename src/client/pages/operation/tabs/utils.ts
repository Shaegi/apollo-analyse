export type Node<A = {}> = A & {
    children?: Node<A>[]
  }
  
export const findDeep = <A extends Object>(arr: Node<A>[], condition: (node: Node<A>) => boolean): Node<A> | null => {
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

export const geClosestNumber = (numbers: number[], target: number) => {
    return numbers.reduce((acc, curr) => !acc ? curr :  acc < Math.abs(target - curr) ? acc : curr ,null)
}