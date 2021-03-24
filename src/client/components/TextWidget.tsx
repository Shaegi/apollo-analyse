import React from 'react'
import styled, { ThemedStyledProps } from 'styled-components'
import { Theme } from '../pages/_app'

type WrapperProps = {
    error?: boolean
    success?: boolean
}

const getColor = (props: ThemedStyledProps<WrapperProps, Theme>) => {
    if(props.error) {
        return props.theme.color.error
    } else if(props.success) {
        return props.theme.color.success
    }
    return props.theme.color.primary
}

const Wrapper = styled.div<WrapperProps>`
    padding: 8px 16px;
    text-align: center;
    align-items: center;
    border: 1px solid ${getColor};
    .label {
        font-size: 0.8em;
        color: gray;
    }
    .value {
        color: ${getColor};
        font-size: 1.2em;
    }
`

export type TextWidgetProps = {
    label: React.ReactNode
    error?: boolean
    success?: boolean
    value: React.ReactNode
}

const TextWidget:React.FC<TextWidgetProps> = props => {
    const { label, value, error, success } = props
    return <Wrapper error={error} success={success}>
        <span className='label'>{label}</span>
        <div className='value'>
            {value}
        </div>
    </Wrapper>
}

export default TextWidget
