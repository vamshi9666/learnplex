import { Menu, Button, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
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
import { useQuery } from 'urql'

import { Section } from '../../graphql/types'
import { useUser } from '../../lib/hooks/useUser'
import InternalServerError from '../error/InternalServerError'

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

  const USER_PROGRESS_QUERY = `
    query($resourceSlug: String!) {
      userProgress(resourceSlug: $resourceSlug) {
        completedSections {
          id
        }
      }
    }
  `

  const [{ data, fetching, error }, reExecuteUserProgressQuery] = useQuery({
    query: USER_PROGRESS_QUERY,
    variables: {
      resourceSlug,
    },
  })

  useEffect(() => {
    reExecuteUserProgressQuery()
  }, [reExecuteUserProgressQuery])

  if (fetching || userFetching) return <Skeleton active={true} />
  if (error) return <InternalServerError message={error.message} />

  const completedSectionIds =
    data.userProgress?.completedSections.map(
      (section: Section) => section.id
    ) ?? []

  function isSectionComplete({ section }: { section: Section }): boolean {
    if (section.sections.length === 0) {
      return completedSectionIds.includes(section.id)
    }
    const subSectionIds = section.sections.map(
      (currentSection) => currentSection.id
    )

    return subSectionIds.every((id) =>
      isSectionComplete({ section: sectionsMap.get(id)! })
    )
  }

  const sectionMenuItem = ({ sectionId }: { sectionId: string }) => {
    const section = sectionsMap.get(sectionId) as Section
    if (!section) return <Skeleton key={sectionId} active={true} />
    const sortedSections = section.sections.sort((a, b) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
    })
    if (!section.hasSubSections) {
      return (
        <Menu.Item key={section.slug} id={section.id}>
          <div>
            <span className={'mr-3'}>
              <FileOutlined />
            </span>
            <span>{section.title}</span>
            <span className={'float-right'}>
              {isSectionComplete({ section }) ? (
                <CheckCircleTwoTone twoToneColor={'#52c41a'} />
              ) : (
                <CheckCircleOutlined />
              )}
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
              {isSectionComplete({ section }) ? (
                <CheckSquareTwoTone twoToneColor={'#52c41a'} />
              ) : (
                <CheckSquareOutlined />
              )}
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
    let toEditPage = inEditMode
    if (e.key === 'edit-resource-index') {
      toEditPage = true
    }
    if (e.key === 'breadcrumb') {
      router.reload()
      return
    }
    let path = e.keyPath.reduce((a: string, b: string) => `${b}/${a}`)
    if (e.key === 'edit-resource-index') {
      path = 'resource-index'
    }
    if (toEditPage) {
      return await router.push(
        `/${username}/learn/edit/${resourceSlug}/${path}`
      )
    }
    await router.push(`/${username}/learn/${resourceSlug}/${path}`)
  }
  const sidebar = document.getElementById('sidebar')

  return (
    <>
      <Menu
        mode={'inline'}
        onOpenChange={(e) => setOpenKeys(e)}
        onClick={handleClick}
        defaultSelectedKeys={defaultSelectedKeys}
        openKeys={openKeys}
        className={'position-fixed bg-initial a-menu'}
        id={'sidebar'}
        style={{ width: sidebar?.parentElement?.clientWidth ?? '24vw' }}
      >
        <Menu.Item key={'breadcrumb'}>{breadCrumb}</Menu.Item>
        {(inEditMode || user?.username === username) && (
          <Menu.Item className={'text-center'} key={'edit-resource-index'}>
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
