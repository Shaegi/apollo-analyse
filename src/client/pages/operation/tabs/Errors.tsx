import React from 'react'
import styled from 'styled-components'
import { Errors } from '../../../types/TracingInfo'

type WrapperProps = {}

const Wrapper = styled.div<WrapperProps>`
  display: block;
  > ul {
    > li {
      margin-inline-start: 1em;
      list-style: decimal;
    }
  }
`

export type ErrorDetailsProps = {
  errors?: Errors
}

const ErrorDetails: React.FC<ErrorDetailsProps> = (props) => {
  const { errors } = props

  if (!errors) {
    return <>Yay no errors</>
  }

  const renderError = (error: Errors[number], level: number) => {
    if (Array.isArray(error)) {
      const list = <ul>{error.map((v) => renderError(v, level + 1))}</ul>

      return level !== 0 ? <li>{list}</li> : list
    } else {
      return <li>{error.message}</li>
    }
  }
  return <Wrapper>{renderError(errors as any, 0)}</Wrapper>
}

export default ErrorDetails
