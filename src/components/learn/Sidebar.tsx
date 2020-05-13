import { Menu, Skeleton, Typography, Grid, Breadcrumb } from 'antd'
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

import { Section } from '../../graphql/types'
import useProgress from '../../lib/hooks/useProgress'
import { useSections } from '../../lib/hooks/useSections'
import { titleCase } from '../../utils/upperCamelCase'

interface Props {
  inEditMode: boolean
  sectionsMap: Map<string, Section>
  defaultSelectedKeys?: string[]
  defaultOpenKeys?: string[]
  currentSections: Section[]
  username: string
}

export default function Sidebar({
  inEditMode,
  sectionsMap,
  defaultSelectedKeys = [],
  defaultOpenKeys = [],
  currentSections = [],
  username = '',
}: Props) {
  const router = useRouter()
  const resourceSlug = router.query.resource as string

  const [openKeys, setOpenKeys] = useState(defaultOpenKeys)
  const { getSlugsPathFromSectionId } = useSections({ username, resourceSlug })

  const { fetching, isSectionComplete } = useProgress({
    resourceSlug,
    ownerUsername: username,
    sectionsMap,
  })

  const { xs } = Grid.useBreakpoint()

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

  const handleClickPrimary = async (e: any) => {
    console.log(e)
    if (e.key === 'resource-index') {
      await router.push(
        `/learn/[resource]?resource=${resourceSlug}`,
        `/learn/${resourceSlug}`,
        { shallow: true }
      )
      return
    }

    const slugs = getSlugsPathFromSectionId({ sectionId: e.key })
    let slugsPath = ''
    if (slugs.length > 0) {
      slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
    }
    await router.push(
      `/learn/[resource]/[...slugs]?resource=${resourceSlug}&slugs=${slugs}`,
      `/learn/${resourceSlug}/${slugsPath}`,
      { shallow: true }
    )
  }

  const handleClick = async (e: any) => {
    if (!router.pathname.startsWith('/[username]') && !inEditMode) {
      await handleClickPrimary(e)
      return
    }
    if (e.key === 'resource-index') {
      if (inEditMode) {
        await router.push(
          `/[username]/learn/edit/[resource]/resource-index?username=${username}&resource=${resourceSlug}`,
          `/${username}/learn/edit/${resourceSlug}/resource-index`,
          { shallow: true }
        )
        return
      }
      await router.push(
        `/[username]/learn/[resource]?username=${username}&resource=${resourceSlug}`,
        `/${username}/learn/${resourceSlug}`,
        { shallow: true }
      )

      return
    }
    const slugs = getSlugsPathFromSectionId({ sectionId: e.key })
    let slugsPath = ''
    if (slugs.length > 0) {
      slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
    }
    if (inEditMode) {
      await router.push(
        `/[username]/learn/edit/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/edit/${resourceSlug}/${slugsPath}`,
        { shallow: true }
      )
      return
    }
    await router.push(
      `/[username]/learn/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
      `/${username}/learn/${resourceSlug}/${slugsPath}`,
      { shallow: true }
    )
  }
  const sidebar = document.getElementById('sidebar')

  const slugs = router.query.slugs ?? []

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
            {slugs.length >= 2 && (
              <Breadcrumb.Item>
                {titleCase(slugs[slugs.length - 2])}
              </Breadcrumb.Item>
            )}
            {slugs.length >= 1 && (
              <Breadcrumb.Item>
                {titleCase(slugs[slugs.length - 1])}
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

        {sortedSections.map((section) =>
          sectionMenuItem({ sectionId: section.id })
        )}
      </Menu>
    </>
  )
}
