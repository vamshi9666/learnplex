import { Menu, Button, Skeleton, Typography } from 'antd'
import React, { useState } from 'react'
import {
  FileOutlined,
  DownOutlined,
  RightOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  CheckCircleTwoTone,
  CheckSquareTwoTone,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint'

import { Section } from '../../graphql/types'
import { useUser } from '../../lib/hooks/useUser'
import useProgress from '../../lib/hooks/useProgress'

interface Props {
  inEditMode: boolean
  sectionsMap: Map<string, Section>
  baseSectionId: string
  defaultSelectedKeys?: string[]
  defaultOpenKeys?: string[]
  breadCrumb: any
}

export default function Sidebar({
  inEditMode,
  sectionsMap,
  baseSectionId,
  defaultSelectedKeys = [],
  defaultOpenKeys = [],
  breadCrumb,
}: Props) {
  const router = useRouter()
  const { user, fetching: userFetching } = useUser()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string

  const [openKeys, setOpenKeys] = useState(defaultOpenKeys)

  const { fetching, isSectionComplete } = useProgress({
    resourceSlug,
    ownerUsername: username,
    sectionsMap,
  })

  const { xs } = useBreakpoint()

  if (fetching || userFetching) return <Skeleton active={true} />

  const sectionMenuItem = ({ sectionId }: { sectionId: string }) => {
    const section = sectionsMap.get(sectionId) as Section
    if (!section) return <Skeleton key={sectionId} active={true} />
    const sortedSections = section.sections.sort((a, b) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
    })
    if (!section.hasSubSections) {
      return (
        <Menu.Item key={section.slug} id={section.id}>
          <Typography>
            <span className={'mr-3'}>
              <FileOutlined />
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
        key={section.slug}
        title={
          <Typography>
            <span className={'mr-3'}>
              {openKeys.includes(section.slug) ? (
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
    if (e.key === 'breadcrumb') {
      router.reload()
      return
    }
    let path = e.keyPath.reduce((a: string, b: string) => `${b}/${a}`)
    if (e.key === 'edit-resource-index') {
      return await router.push(
        `/[username]/learn/edit/[resource]/resource-index?username=${username}&resource=${resourceSlug}`,
        `/${username}/learn/edit/${resourceSlug}/resource-index`,
        { shallow: true }
      )
    }
    const slugs = path.split('/')
    if (inEditMode) {
      return await router.push(
        `/[username]/learn/edit/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/edit/${resourceSlug}/${path}`,
        { shallow: true }
      )
    }
    await router.push(
      `/[username]/learn/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
      `/${username}/learn/${resourceSlug}/${path}`,
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
        <Menu.Item key={'breadcrumb'}>{breadCrumb}</Menu.Item>
        {(inEditMode || user?.username === username) && (
          <Menu.Item className={'text-center px-2'} key={'edit-resource-index'}>
            <Button block={true}>Edit Index</Button>
          </Menu.Item>
        )}
        {sortedSections.map((section) =>
          sectionMenuItem({ sectionId: section.id })
        )}
      </Menu>
    </>
  )
}
