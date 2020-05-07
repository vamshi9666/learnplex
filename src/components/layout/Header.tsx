import React from 'react'
import { Menu, Skeleton } from 'antd'
import { useRouter } from 'next/router'

import { useUser } from '../../lib/hooks/useUser'
import { UserRole } from '../../graphql/types'

export default function Header() {
  const router = useRouter()
  const { user, fetching, error } = useUser()
  if (fetching) return <Skeleton active={true} />
  const isLoggedIn = !!user && !fetching && !error

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
        {isLoggedIn
          ? [
              <Menu.SubMenu key={'ii--resources'} title={'Resources'}>
                <Menu.Item key={'/resources/new'}>Create Resource</Menu.Item>
                <Menu.Item key={'/resources/me'}>My Resources</Menu.Item>
                <Menu.Item key={'/resources/all'}>All Resources</Menu.Item>
                {user?.roles.includes(UserRole.Admin) && (
                  <Menu.Item key={'/topics/new'}>Create Topic</Menu.Item>
                )}
              </Menu.SubMenu>,
              <Menu.Item key={'/profile'}>{user.username}</Menu.Item>,
              <Menu.Item key={'/logout'}>Logout</Menu.Item>,
            ]
          : [
              <Menu.Item key={'/login'}>Login</Menu.Item>,
              <Menu.Item key={'/register'}>Register</Menu.Item>,
            ]}
      </Menu>
    </>
  )
}
