import { Menu } from 'antd'
import React, { useState } from 'react'
import {
  FileOutlined,
  DownOutlined,
  RightOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'

import { Section } from '../../graphql/types'

interface Props {
  inEditMode?: boolean
  sectionsMap: Map<string, Section>
  baseSectionId: string
  defaultSelectedKeys?: string[]
  defaultOpenKeys?: string[]
}

export default function Sidebar({
  inEditMode = false,
  sectionsMap,
  baseSectionId,
  defaultSelectedKeys = [],
  defaultOpenKeys = [],
}: Props) {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string

  const [openKeys, setOpenKeys] = useState(defaultOpenKeys)

  const sectionMenuItem = ({ sectionId }: { sectionId: string }) => {
    const section = sectionsMap.get(sectionId) as Section
    const sortedSections = section.sections.sort((a, b) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
    })
    if (section.isPage) {
      return (
        <Menu.Item key={section.slug} id={section.id}>
          <div>
            <span className={'mr-3'}>
              <FileOutlined />
            </span>
            <span>{section.title}</span>
            <span className={'float-right'}>
              <CheckCircleOutlined />
            </span>
          </div>
        </Menu.Item>
      )
    }
    return (
      <Menu.SubMenu
        key={section.slug}
        title={
          <div>
            <span className={'mr-3'}>
              {openKeys.includes(section.slug) ? (
                <DownOutlined />
              ) : (
                <RightOutlined />
              )}
            </span>
            <span>{section.title}</span>
            <span className={'float-right'}>
              <CheckSquareOutlined />
            </span>
          </div>
        }
      >
        {sortedSections.map((currentSection) =>
          sectionMenuItem({ sectionId: currentSection.id })
        )}
      </Menu.SubMenu>
    )
  }

  const baseSection = sectionsMap.get(baseSectionId) as Section
  const sortedSections = baseSection.sections.sort(
    (section, anotherSection) => {
      return section.order > anotherSection.order
        ? 1
        : section.order < anotherSection.order
        ? -1
        : 0
    }
  )

  const handleClick = async (e: any) => {
    const path = e.keyPath.reduce((a: string, b: string) => `${b}/${a}`)
    if (inEditMode) {
      await router.push(`/${username}/learn/edit/${resourceSlug}/${path}`)
    }
    await router.push(`/${username}/learn/${resourceSlug}/${path}`)
  }

  return (
    <Menu
      mode={'inline'}
      onOpenChange={(e) => setOpenKeys(e)}
      onClick={handleClick}
      defaultSelectedKeys={defaultSelectedKeys}
      openKeys={openKeys}
    >
      {inEditMode && (
        <Menu.Item className={'text-center'} key={'outline'}>
          Edit Outline
        </Menu.Item>
      )}
      {sortedSections.map((section) =>
        sectionMenuItem({ sectionId: section.id })
      )}
    </Menu>
  )
}
