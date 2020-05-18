import React, { useState } from 'react'
import { Breadcrumb, Grid, Menu, Typography } from 'antd'
import { useRouter } from 'next/router'

import { Section } from '../../graphql/types'
import { titleCase } from '../../utils/titleCase'
import SidebarMenuItemV2 from './SidebarMenuItem'

export interface ClickParam {
  key: string
  keyPath: Array<string>
  item: any
  domEvent: Event
}

interface Props {
  inEditMode: boolean
  sectionsMap: Record<string, Section>
  defaultSelectedKeys?: string[]
  defaultOpenKeys?: string[]
  currentSections: Section[]
  username: string
  resourceSlug: string
  slugs?: string[]
  completedSectionIds: string[]
}

export default function SidebarV2({
  inEditMode,
  sectionsMap,
  defaultSelectedKeys = [],
  defaultOpenKeys = [],
  currentSections,
  username,
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
    const isPrimary =
      !router.pathname.startsWith('/v2/[username]') && !inEditMode
    // Clicked on index button
    if (e.key === 'resource-index') {
      if (inEditMode) {
        await router.push(`/${username}/learn/edit/${resourceSlug}`)
        return
      }
      await router.push(
        `/${isPrimary ? '' : username + '/'}learn/${resourceSlug}`
      )
      return
    }

    const slugsPath = clickedSection.hasSubSections
      ? clickedSection.firstLeafSlugsPath
      : clickedSection.slugsPath
    if (inEditMode) {
      await router.push(`/${username}/learn/edit/${resourceSlug}${slugsPath}`)
      return
    }
    await router.push(
      `/${isPrimary ? '' : username + '/'}learn/${resourceSlug}${slugsPath}`
    )
  }

  const sidebar = document.getElementById('sidebar')

  console.log({ defaultSelectedKeys, defaultOpenKeys })

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
        <Menu.Item className={'cursor-initial'} disabled={true}>
          <Breadcrumb>
            {slugs.length >= 3 && (
              <Breadcrumb.Item>
                {titleCase(slugs[slugs.length - 3])}
              </Breadcrumb.Item>
            )}
            {slugs.length >= 2 && (
              <Breadcrumb.Item>
                {titleCase(slugs[slugs.length - 2])}
              </Breadcrumb.Item>
            )}
          </Breadcrumb>
        </Menu.Item>
        <Menu.Item
          key={'resource-index'}
          className={'border-bottom-2 font-weight-bold font-large'}
        >
          <Typography className={'text-center'}>
            <Typography.Text style={{ width: '75%' }} ellipsis={true}>
              {inEditMode ? 'Edit Index' : 'Index'}
            </Typography.Text>
          </Typography>
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
