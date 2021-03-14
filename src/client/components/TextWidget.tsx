import React from 'react'
import styled from 'styled-components'

type WrapperProps = {}

const Wrapper = styled.div<WrapperProps>`
    padding: 8px 16px;
    text-align: center;
    align-items: center;
    border: 1px solid ${p => p.theme.color.primary};
    .label {
        font-size: 0.8em;
        color: gray;
    }
    .value {
        color: ${p => p.theme.color.primary};
        font-size: 1.2em;
    }
`

export type TextWidgetProps = {
    label: React.ReactNode
    value: React.ReactNode
}

const TextWidget:React.FC<TextWidgetProps> = props => {
    const { label, value } = props
return <Wrapper>
        <span className='label'>{label}</span>
        <div className='value'>
            {value}
        </div>
</Wrapper>
}

export default TextWidget
