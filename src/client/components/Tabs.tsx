import React from 'react'
import styled from 'styled-components'
import classNames from 'classnames'

export type Tab = {
  id: string
  label: React.ReactNode
  content?: React.ReactNode
}

type WrapperProps = {}

const Wrapper = styled.ul<WrapperProps>`
  > ul {
    display: flex;
    margin-bottom: ${(p) => p.theme.size.xs};
    li {
      > button {
        background: none;
        border: none;
        cursor: pointer;
        padding: ${(p) => p.theme.size.xxs} ${(p) => p.theme.size.xs};
      }

      &.active {
        border-bottom: 1px solid ${(p) => p.theme.color.primary};
      }
    }

    li + li {
      margin-left: ${(p) => p.theme.size.xs};
    }
  }
`

export type TabsProps = {
  tabs: Tab[]
  onSelect: (tab: Tab, index: number) => void
  selectedIndex: number
}

const Tabs: React.FC<TabsProps> = (props) => {
  const { tabs, selectedIndex, onSelect } = props
  const activeTab = tabs[selectedIndex] || null
  return (
    <Wrapper>
      <ul>
        {tabs.map((tab, index) => {
          return (
            <li
              className={classNames({ active: selectedIndex === index })}
              key={tab.id}
              onClick={() => onSelect(tab, index)}
            >
              <button>{tab.label}</button>
            </li>
          )
        })}
      </ul>
      {activeTab?.content}
    </Wrapper>
  )
}

export default Tabs
