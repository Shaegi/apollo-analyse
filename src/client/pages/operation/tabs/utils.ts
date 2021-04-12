export type Node<A = {}> = A & {
  children?: Node<A>[]
}

export const findDeep = <A extends Object>(arr: Node<A>[], condition: (node: Node<A>) => boolean): Node<A> | null => {
  let found = null
  const find = (obj: Node<A>) => {
    if (condition(obj)) {
      found = obj
      return true
    } else if (obj.children) {
      return obj.children.some(find)
    }
    return null
  }
  arr.some(find)

  return found
}

export const geClosestNumber = (counts: number[], goal: number) => {
  return counts.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  })
}

export const roundTo2Precision = (num: number) => Math.round(num * 1000) / 1000