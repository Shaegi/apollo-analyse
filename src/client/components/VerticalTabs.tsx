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
  display: flex;
  > .tab-content {
    width: 100%;
  }
  > ul {
    flex-direction: column;
    margin-bottom: ${(p) => p.theme.size.xs};
    li {
      > button {
        height: 100px;
        width: 100px;
        outline: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: ${(p) => p.theme.size.xxs} ${(p) => p.theme.size.xs};
      }
      outline: none;
      border-right: 3px solid transparent;
      :hover {
        background: rgba(0, 0, 0, 0.25);
      }

      &.active {
        border-right: 3px solid ${(p) => p.theme.color.primary};
      }
    }
  }
`

export type TabsProps = {
  tabs: Tab[]
  onSelect: (tab: Tab, index: number) => void
  selectedIndex: number
}

const VerticalTabs: React.FC<TabsProps> = (props) => {
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
      {activeTab?.content && (
        <div className="tab-content">{activeTab.content}</div>
      )}
    </Wrapper>
  )
}

export default VerticalTabs
