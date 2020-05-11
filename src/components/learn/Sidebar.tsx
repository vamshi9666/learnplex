import { Menu, Button, Skeleton, Typography } from 'antd'
import React, { useState } from 'react'
import {
  FileTextOutlined,
  DownOutlined,
  RightOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  CheckCircleTwoTone,
  CheckSquareTwoTone,
  FileOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint'

import { Section } from '../../graphql/types'
import useProgress from '../../lib/hooks/useProgress'
import { useSections } from '../../lib/hooks/useSections'

interface Props {
  inEditMode: boolean
  sectionsMap: Map<string, Section>
  defaultSelectedKeys?: string[]
  defaultOpenKeys?: string[]
  currentSections: Section[]
}

export default function Sidebar({
  inEditMode,
  sectionsMap,
  defaultSelectedKeys = [],
  defaultOpenKeys = [],
  currentSections = [],
}: Props) {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string

  const [openKeys, setOpenKeys] = useState(defaultOpenKeys)
  const { getSlugsPathFromSectionId } = useSections({ username, resourceSlug })

  const { fetching, isSectionComplete } = useProgress({
    resourceSlug,
    ownerUsername: username,
    sectionsMap,
  })

  const { xs } = useBreakpoint()

  if (fetching) return <Skeleton active={true} />

  const sectionMenuItem = ({ sectionId }: { sectionId: string }) => {
    const section = sectionsMap.get(sectionId) as Section
    if (!section) return <Skeleton key={sectionId} active={true} />
    const sortedSections = section.sections.sort((a, b) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
    })
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
            <span className={'float-right'}>
              {isSectionComplete({ section }) ? (
                <CheckCircleTwoTone twoToneColor={'#52c41a'} />
              ) : (
                <CheckCircleOutlined />
              )}
            </span>
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
            <span className={'float-right'}>
              {isSectionComplete({ section }) ? (
                <CheckSquareTwoTone twoToneColor={'#52c41a'} />
              ) : (
                <CheckSquareOutlined />
              )}
            </span>
          </Typography>
        }
      >
        {sortedSections.map((currentSection) =>
          sectionMenuItem({ sectionId: currentSection.id })
        )}
      </Menu.SubMenu>
    )
  }

  const sortedSections = currentSections.sort((section, anotherSection) => {
    return section.order > anotherSection.order
      ? 1
      : section.order < anotherSection.order
      ? -1
      : 0
  })

  const handleClick = async (e: any) => {
    if (e.key === 'resource-index') {
      if (inEditMode) {
        await router.push(
          `/[username]/learn/edit/[resource]/resource-index?username=${username}&resource=${resourceSlug}`,
          `/${username}/learn/edit/${resourceSlug}/resource-index`,
          { shallow: true }
        )
      } else {
        await router.push(
          `/[username]/learn/[resource]?username=${username}&resource=${resourceSlug}`,
          `/${username}/learn/${resourceSlug}`,
          { shallow: true }
        )
      }
      return
    }
    const slugs = getSlugsPathFromSectionId({ sectionId: e.key })
    let slugsPath = ''
    if (slugs.length > 0) {
      slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
    }
    if (inEditMode) {
      return await router.push(
        `/[username]/learn/edit/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/edit/${resourceSlug}/${slugsPath}`,
        { shallow: true }
      )
    }
    await router.push(
      `/[username]/learn/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
      `/${username}/learn/${resourceSlug}/${slugsPath}`,
      { shallow: true }
    )
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
        <Menu.Item key={'resource-index'} className={'border-bottom'}>
          <Typography>
            <span className={'mr-3'}>
              <FileTextOutlined />
            </span>
            <Typography.Text style={{ width: '75%' }} ellipsis={true}>
              {inEditMode ? 'Edit Index' : 'Index'}
            </Typography.Text>
            <span className={'float-right'}>
              <CheckCircleOutlined />
            </span>
          </Typography>
        </Menu.Item>

        {sortedSections.map((section) =>
          sectionMenuItem({ sectionId: section.id })
        )}
      </Menu>
    </>
  )
}
