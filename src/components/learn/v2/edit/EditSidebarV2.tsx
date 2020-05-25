import React, { useState } from 'react'
import { Grid, Menu, Typography } from 'antd'
import {
  FileTextOutlined,
  FileOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'

import { Section } from '../../../../graphql/types'

interface Props {
  resourceSlug: string
  currentSections: Section[]
  defaultSelectedKeys?: string[]
  defaultOpenKeys?: string[]
  sectionsMap: Record<string, Section>
}

export default function EditSidebarV2({
  resourceSlug,
  currentSections = [],
  defaultOpenKeys = [],
  defaultSelectedKeys = [],
  sectionsMap,
}: Props) {
  const router = useRouter()
  const [openKeys, setOpenKeys] = useState(defaultOpenKeys as string[])
  const { xs } = Grid.useBreakpoint()

  const sidebarMenuItem = ({ sectionId }: { sectionId: string }) => {
    const section = sectionsMap[sectionId]
    const sortedSubSections = section.sections.sort((a, b) =>
      a.order > b.order ? 1 : a.order < b.order ? -1 : 0
    )
    if (!section.hasSubSections) {
      return (
        <Menu.Item key={section.id} id={section.id}>
          <Typography>
            <span className={'mr-3'}>
              {section.page ? <FileTextOutlined /> : <FileOutlined />}
            </span>
            <Typography.Text
              style={{ width: `${75 - section.depth * 3}%` }}
              ellipsis={true}
            >
              {section.title}
            </Typography.Text>
          </Typography>
        </Menu.Item>
      )
    }
    return (
      <Menu.SubMenu
        key={section.id}
        title={
          <Typography>
            <span className={'mr-3'}>
              {openKeys.includes(section.id) ? (
                <DownOutlined />
              ) : (
                <RightOutlined />
              )}
            </span>
            <Typography.Text
              style={{ width: `${75 - section.depth * 3}%` }}
              ellipsis={true}
            >
              {section.title}
            </Typography.Text>
          </Typography>
        }
      >
        {sortedSubSections.map((currentSection) =>
          sidebarMenuItem({ sectionId: currentSection.id })
        )}
      </Menu.SubMenu>
    )
  }

  const handleClick = async (e: any) => {
    if (e.key === 'resource-index') {
      await router.push(`/learn/edit/${resourceSlug}`)
      return
    }
    const section = sectionsMap[e.key]
    await router.push(`/learn/edit/${resourceSlug}${section.slugsPath}`)
  }
  const sortedSections = currentSections.sort((a, b) =>
    a.order > b.order ? 1 : a.order < b.order ? -1 : 0
  )
  const sidebar = document.getElementById('sidebar')
  return (
    <Menu
      id={'sidebar'}
      className={`sidebar-menu pt-2 ${xs ? '' : 'position-fixed'}`}
      mode={'inline'}
      openKeys={openKeys}
      selectedKeys={defaultSelectedKeys}
      onClick={handleClick}
      onOpenChange={(keys) => setOpenKeys(keys)}
      style={{ width: sidebar?.parentElement?.clientWidth ?? '24vw' }}
    >
      <Menu.Item
        key={'resource-index'}
        className={'border-bottom-2 font-weight-bold font-large'}
      >
        <Typography className={'text-center'}>
          <Typography.Text style={{ width: '75%' }} ellipsis={true}>
            Edit Index
          </Typography.Text>
        </Typography>
      </Menu.Item>

      {sortedSections.map((section) =>
        sidebarMenuItem({ sectionId: section.id })
      )}
    </Menu>
  )
}
