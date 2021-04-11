import React from 'react'
import styled from 'styled-components'
import VerticalTabs from './VerticalTabs'

type WrapperProps = {}

const Wrapper = styled.div<WrapperProps>``

export type MainNavProps = {
  index: number
}

const MainNav: React.FC<MainNavProps> = (props) => {
  const { index, children } = props

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: null,
    },
    {
      id: 'operations',
      label: 'Operations',
      content: null,
    },
  ]
  tabs[index].content = children

  return (
    <Wrapper>
      <VerticalTabs
        selectedIndex={index}
        onSelect={(tab, index) => {
          let href = '/'
          switch (index) {
            case 1: {
              href = '/operations'
              break
            }
          }
          window.location.href = href
        }}
        tabs={tabs}
      />
    </Wrapper>
  )
}

export default MainNav
