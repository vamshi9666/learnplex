import React from 'react'
import { Button, Menu, Skeleton } from 'antd'
import { useRouter } from 'next/router'
import { EditOutlined, ImportOutlined } from '@ant-design/icons'
import { useQuery } from 'urql'

import { useUser } from '../../../lib/hooks/useUser'
import { UserRole } from '../../../graphql/types'

export default function Header() {
  const router = useRouter()
  const { user, fetching, error } = useUser()

  const PRIMARY_RESOURCE_BY_SLUG_QUERY = `
    query($resourceSlug: String!) {
      primaryResourceBySlug(resourceSlug: $resourceSlug) {
        user {
          username
        }
        verified
      }
    }
  `

  const [{ data, fetching: resourceFetching }] = useQuery({
    query: PRIMARY_RESOURCE_BY_SLUG_QUERY,
    variables: {
      resourceSlug: router.query.resource,
    },
  })

  if (fetching || resourceFetching) return <Skeleton active={true} />
  const isLoggedIn = !!user && !fetching && !error
  let username =
    router.query.username ?? data?.primaryResourceBySlug?.user?.username ?? ''
  const resourceSlug = router.query.resource
  const slugs = router.query.slugs as string[]

  const goToEditPage = async () => {
    if (
      router.pathname === '/[username]/learn/[resource]/[...slugs]' ||
      router.pathname === '/learn/[resource]/[...slugs]'
    ) {
      const slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
      await router.push(
        `/[username]/learn/edit/[resource]/slugs?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/edit/${resourceSlug}/${slugsPath}`,
        { shallow: true }
      )
    } else if (
      router.pathname === '/[username]/learn/[resource]' ||
      router.pathname === '/learn/[resource]'
    ) {
      await router.push(
        `/[username]/learn/edit/[resource]/resource-index?username=${username}&resource=${resourceSlug}`,
        `/${username}/learn/edit/${resourceSlug}/resource-index`,
        { shallow: true }
      )
    }
  }

  const exitEditMode = async () => {
    if (router.pathname === '/[username]/learn/edit/[resource]/[...slugs]') {
      const slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
      if (data?.primaryResourceBySlug?.verified) {
        await router.push(
          `/learn/[resource]/[...slugs]?resource=${resourceSlug}&slugs=${slugs}`,
          `/learn/${resourceSlug}/${slugsPath}`,
          { shallow: true }
        )
        return
      }
      await router.push(
        `/[username]/learn/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/${resourceSlug}/${slugsPath}`,
        { shallow: true }
      )
    } else if (
      router.pathname === '/[username]/learn/edit/[resource]/resource-index'
    ) {
      if (data?.primaryResourceBySlug?.verified) {
        await router.push(
          `/learn/[resource]?resource=${resourceSlug}`,
          `/learn/${resourceSlug}`,
          { shallow: true }
        )
        return
      }
      await router.push(
        `/[username]/learn/[resource]?username=${username}&resource=${resourceSlug}`,
        `/${username}/learn/${resourceSlug}`,
        { shallow: true }
      )
    }
  }

  const showEditButton = () => {
    return (
      isLoggedIn &&
      (router.pathname === '/[username]/learn/[resource]/[...slugs]' ||
        router.pathname === '/[username]/learn/[resource]' ||
        router.pathname === '/learn/[resource]' ||
        router.pathname === '/learn/[resource]/[...slugs]') &&
      username === user?.username
    )
  }

  const showExitButton = () => {
    return (
      isLoggedIn &&
      (router.pathname === '/[username]/learn/edit/[resource]/[...slugs]' ||
        router.pathname ===
          '/[username]/learn/edit/[resource]/resource-index') &&
      username === user?.username
    )
  }

  return (
    <>
      <div
        className={'logo float-left cursor-pointer'}
        onClick={() => router.push('/')}
      >
        <img src={'/logo.png'} alt={'Coderplex Logo'} width={'32'} />
        <span className={'ml-2 font-large'}>
          <b>Coderplex</b>
        </span>
      </div>
      <Menu
        className={'float-right bg-initial border-0'}
        mode={'horizontal'}
        selectable={false}
        onClick={async ({ key }) => {
          await router.push(key)
        }}
      >
        {showEditButton() && (
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
        {showExitButton() && (
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
          </Menu.Item>
        )}
        {isLoggedIn
          ? [
              <Menu.SubMenu key={'user'} title={user?.username}>
                <Menu.SubMenu key={'profile'} title={'Profile'}>
                  <Menu.Item key={'/profile'}>Enrollments</Menu.Item>
                  <Menu.Item key={'/profile/settings'}>Settings</Menu.Item>
                </Menu.SubMenu>
                <Menu.Item key={'/resources/me'}>My Resources</Menu.Item>
                <Menu.Item key={'/resources/new'}>Create Resource</Menu.Item>
                {user?.roles.includes(UserRole.Admin) && (
                  <Menu.Item key={'/topics/new'}>Create Topic</Menu.Item>
                )}
                <Menu.Item key={'/logout'}>Logout</Menu.Item>,
              </Menu.SubMenu>,
            ]
          : [
              <Menu.Item key={'/login'}>Login</Menu.Item>,
              <Menu.Item key={'/register'}>Register</Menu.Item>,
            ]}
      </Menu>
    </>
  )
}
