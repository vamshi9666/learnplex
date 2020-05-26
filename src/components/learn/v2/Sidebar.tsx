import React, { useState } from 'react'
import { Breadcrumb, Grid, Menu, Typography } from 'antd'
import { useRouter } from 'next/router'

import { Section } from '../../../graphql/types'
import SidebarMenuItemV2 from './SidebarMenuItem'

export interface ClickParam {
  key: string
  keyPath: Array<string>
  item: any
  domEvent: Event
}

interface Props {
  sectionsMap: Record<string, Section>
  defaultSelectedKeys?: string[]
  defaultOpenKeys?: string[]
  currentSections: Section[]
  resourceSlug: string
  slugs?: string[]
  completedSectionIds: string[]
  sectionIdsPath: string[]
}

export default function SidebarV2({
  sectionIdsPath,
  sectionsMap,
  defaultSelectedKeys = [],
  defaultOpenKeys = [],
  currentSections,
  resourceSlug,
  slugs = [],
  completedSectionIds,
}: Props) {
  const router = useRouter()
  const [openKeys, setOpenKeys] = useState(defaultOpenKeys)
  const sortedSections = currentSections.sort((a: Section, b: Section) => {
    return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
  })
  const { xs } = Grid.useBreakpoint()

  const handleClick = async (e: ClickParam) => {
    const clickedSection = sectionsMap[e.key]
    // Clicked on index button
    if (e.key === 'resource-index') {
      await router.push(`/learn/${resourceSlug}`)
      return
    }

    const slugsPath = clickedSection.hasSubSections
      ? clickedSection.firstLeafSlugsPath
      : clickedSection.slugsPath
    await router.push(`/learn/${resourceSlug}${slugsPath}`)
  }

  const sidebar = document.getElementById('sidebar')

  return (
    <>
      <Menu
        mode={'inline'}
        onOpenChange={(e) => setOpenKeys(e)}
        onClick={handleClick}
        selectedKeys={defaultSelectedKeys}
        openKeys={openKeys}
        className={`sidebar-menu pt-2 ${xs ? '' : 'position-fixed'}`}
        id={'sidebar'}
        style={{ width: sidebar?.parentElement?.clientWidth ?? '24vw' }}
      >
        <Menu.Item
          key={'resource-index'}
          className={'border-bottom-2 font-weight-bold font-large'}
        >
          <Typography className={'text-center'}>
            <Typography.Text style={{ width: '75%' }} ellipsis={true}>
              Index
            </Typography.Text>
          </Typography>
        </Menu.Item>

        <Menu.Item className={'cursor-initial'} disabled={true}>
          <Breadcrumb>
            {sectionIdsPath.length >= 3 && (
              <Breadcrumb.Item>
                {sectionsMap[sectionIdsPath[sectionIdsPath.length - 3]].title}
              </Breadcrumb.Item>
            )}
            {slugs.length >= 2 && (
              <Breadcrumb.Item>
                {sectionsMap[sectionIdsPath[sectionIdsPath.length - 2]].title}
              </Breadcrumb.Item>
            )}
          </Breadcrumb>
        </Menu.Item>

        {sortedSections.map((section) => (
          <SidebarMenuItemV2
            key={section.id}
            currentsectionid={section.id}
            sectionsmap={sectionsMap}
            issectioncomplete={
              completedSectionIds.includes(section.id) ? 'true' : ''
            }
          />
        ))}
      </Menu>
    </>
  )
}
