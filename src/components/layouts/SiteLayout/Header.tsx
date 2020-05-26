import React, { useContext, useEffect, useState } from 'react'
import { Button, Menu, Affix, message } from 'antd'
import { useRouter } from 'next/router'
import {
  EditOutlined,
  ImportOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'

import { Resource, UserRole } from '../../../graphql/types'
import { UserContext } from '../../../lib/contexts/UserContext'
import { getResourceBySlug } from '../../../utils/getResourceBySlug'

export default function Header() {
  const router = useRouter()
  const { user } = useContext(UserContext)
  const resourceSlug = router.query.resource as string

  const [resource, setResource] = useState(null as Resource | null)

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

  const exitEditMode = async () => {
    if (router.pathname === '/learn/edit/[resource]') {
      await router.push(`/learn/${resourceSlug}`)
    } else {
      const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
      await router.push(`/learn/${resourceSlug}${slugsPath}`)
    }
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

  return (
    <Affix>
      <div className={'header'}>
        <div className={'logo cursor-pointer'} onClick={() => router.push('/')}>
          <img src={'/logo.png'} alt={'Coderplex Logo'} />
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
                <Menu.Item key={'/resources/new'}>
                  <PlusCircleOutlined
                    style={{
                      fontSize: 'x-large',
                      position: 'relative',
                      top: '4px',
                    }}
                  />
                </Menu.Item>,
                <Menu.SubMenu key={'user'} title={user?.username}>
                  <Menu.Item key={'/profile/settings'}>Profile</Menu.Item>
                  <Menu.Item key={'/resources/me'}>My Resources</Menu.Item>
                  <Menu.Item key={'/resources/new'}>Create Resource</Menu.Item>
                  {user?.roles.includes(UserRole.Admin) && (
                    <Menu.Item key={'/topics/new'}>Create Topic</Menu.Item>
                  )}
                  <Menu.Item key={'/logout'}>Logout</Menu.Item>,
                </Menu.SubMenu>,
              ]
            : [
                <Menu.Item key={'/resources/new'}>
                  <PlusCircleOutlined
                    style={{
                      fontSize: 'x-large',
                      position: 'relative',
                      top: '4px',
                    }}
                  />
                </Menu.Item>,
                <Menu.Item key={'/login'}>Login</Menu.Item>,
                <Menu.Item key={'/register'}>Register</Menu.Item>,
              ]}
        </Menu>
      </div>
    </Affix>
  )
}
