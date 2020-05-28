import React, { useContext, useEffect, useState } from 'react'
import { Button, Menu, Affix, message, Grid, Tooltip, Popconfirm } from 'antd'
import { useRouter } from 'next/router'
import {
  EditOutlined,
  ImportOutlined,
  EyeOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons'

import { Resource, UserRole } from '../../../graphql/types'
import { UserContext } from '../../../lib/contexts/UserContext'
import { getResourceBySlug } from '../../../utils/getResourceBySlug'
import { togglePublishStatus as togglePublishStatusInDB } from '../../../utils/togglePublishStatus'

export default function Header() {
  const router = useRouter()
  const { user } = useContext(UserContext)
  const resourceSlug = router.query.resource as string

  const [resource, setResource] = useState(null as Resource | null)
  const { xs } = Grid.useBreakpoint()

  useEffect(() => {
    if (resourceSlug) {
      getResourceBySlug({
        resourceSlug,
      }).then((result) => {
        if (result.error) {
          message.error(result.message)
        } else {
          setResource(result)
        }
      })
    }
  }, [resourceSlug])

  const isLoggedIn = !!user
  let username = resource?.user?.username ?? ''
  const slugs = router.query.slugs as string[]

  const goToEditPage = async () => {
    if (router.pathname === '/learn/[resource]') {
      await router.push(`/learn/edit/${resourceSlug}`)
    } else {
      const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
      await router.push(`/learn/edit/${resourceSlug}${slugsPath}`)
    }
  }

  const getViewModePath = () => {
    if (router.pathname === '/learn/edit/[resource]') {
      return `/learn/${resourceSlug}`
    } else {
      const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
      return `/learn/${resourceSlug}${slugsPath}`
    }
  }

  const openPreviewPage = async () => {
    const fullUrl =
      window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '')
    window.open(fullUrl + getViewModePath(), '_blank')
  }

  const exitEditMode = async () => {
    await router.push(getViewModePath())
  }

  const showEditButton = () => {
    return (
      isLoggedIn &&
      (router.pathname === '/learn/[resource]' ||
        router.pathname === '/learn/[resource]/[...slugs]') &&
      username === user?.username
    )
  }

  const showExitButton = () => {
    return (
      isLoggedIn &&
      (router.pathname === '/learn/edit/[resource]/[...slugs]' ||
        router.pathname === '/learn/edit/[resource]') &&
      username === user?.username
    )
  }

  const togglePublishStatus = async () => {
    if (resource?.id) {
      const result = await togglePublishStatusInDB({ resourceId: resource.id })
      if (result.error) {
        message.error(result.message)
      } else {
        if (result.published) {
          message.success('Resource published successfully.')
        } else {
          message.success('Resource unpublished successfully.')
        }
        setResource(result)
      }
    }
  }

  return (
    <Affix offsetTop={0}>
      <div className={'header border-bottom'}>
        <div className={'logo cursor-pointer'} onClick={() => router.push('/')}>
          <img
            src={'/icons/android-chrome-512x512.png'}
            alt={'Coderplex Logo'}
          />
          <span className={'font-large'}>
            <b>Coderplex</b>
          </span>
        </div>
        <Menu
          className={'bg-initial border-0'}
          mode={'horizontal'}
          selectable={false}
          onClick={async ({ key }) => {
            await router.push(key)
          }}
        >
          {!xs && showEditButton() && (
            <Menu.Item
              key={'edit'}
              disabled={true}
              className={'cursor-initial'}
              style={{ marginBottom: '0px' }}
            >
              <Button
                type={'primary'}
                icon={<EditOutlined className={'mr-0'} />}
                onClick={() => goToEditPage()}
              >
                Edit
              </Button>
            </Menu.Item>
          )}
          {!xs &&
            showExitButton() && [
              <Menu.Item
                key={'preview'}
                disabled={true}
                className={'cursor-initial border-0'}
                style={{ marginBottom: '2px' }}
              >
                <Tooltip title={'Show Preview'}>
                  <EyeOutlined
                    className={'font-x-large text-black-50'}
                    onClick={() => openPreviewPage()}
                    style={{ position: 'relative', top: '3px' }}
                  />
                </Tooltip>
              </Menu.Item>,
              <Menu.Item
                key={'exit'}
                disabled={true}
                className={'cursor-initial border-0 pr-1'}
                style={{ marginBottom: '2px' }}
              >
                <Popconfirm
                  title={
                    resource?.published
                      ? 'This will unpublish your resource from any of the public pages.'
                      : 'This will publish your resource and make it public.'
                  }
                  okText={'Continue'}
                  cancelText={'Cancel'}
                  okType={'danger'}
                  placement={'topRight'}
                  onConfirm={() => togglePublishStatus()}
                >
                  <Button
                    danger={resource?.published}
                    type={'primary'}
                    icon={
                      resource?.published ? (
                        <DownloadOutlined className={'mr-0'} />
                      ) : (
                        <UploadOutlined className={'mr-0'} />
                      )
                    }
                  >
                    {resource?.published ? 'Unpublish' : 'Publish'}
                  </Button>
                </Popconfirm>
              </Menu.Item>,
              <Menu.Item
                key={'exit'}
                disabled={true}
                className={'cursor-initial border-0 pr-1'}
                style={{ marginBottom: '2px' }}
              >
                <Button
                  type={'primary'}
                  icon={<ImportOutlined className={'mr-0'} />}
                  onClick={() => exitEditMode()}
                >
                  Exit
                </Button>
              </Menu.Item>,
            ]}
          {!xs && (
            <Menu.Item
              key={
                isLoggedIn
                  ? '/resources/new'
                  : '/register?redirectTo=/resources/new'
              }
            >
              Create Resource
            </Menu.Item>
          )}
          {isLoggedIn
            ? [
                <Menu.SubMenu key={'user'} title={user?.name ?? user?.username}>
                  <Menu.Item key={'/profile/settings'}>Profile</Menu.Item>
                  <Menu.Item key={'/resources/me'}>My Resources</Menu.Item>
                  {user?.roles.includes(UserRole.Admin) && (
                    <Menu.Item key={'/topics/new'}>Create Topic</Menu.Item>
                  )}
                  <Menu.Item key={'/logout'}>Logout</Menu.Item>,
                </Menu.SubMenu>,
              ]
            : [
                <Menu.Item key={`/login?redirectTo=${router.asPath}`}>
                  Login
                </Menu.Item>,
                <Menu.Item key={`/register?redirectTo=${router.asPath}`}>
                  Register
                </Menu.Item>,
              ]}
        </Menu>
      </div>
    </Affix>
  )
}
