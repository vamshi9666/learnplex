import React, { useEffect } from 'react'
import { Menu } from 'antd'
import { useRouter } from 'next/router'

import { useUser } from '../../lib/hooks/useUser'

export default function Header() {
  const router = useRouter()
  const { user, fetching, error } = useUser()
  if (fetching) return <p>Loading....</p>
  // if (error) return <p>Oh no... {error.message}</p>
  const isLoggedIn = !!user && !fetching && !error

  return (
    <>
      <div
        className={'logo float-left cursor-pointer'}
        onClick={() => router.push('/')}
      >
        <img src={'/logo.png'} alt={'Coderplex Logo'} width={'32'} />
        <span className={'ml-4 font-large'}>
          <b>Coderplex</b>
        </span>
      </div>
      <Menu
        className={'float-right bg-initial b-0'}
        mode={'horizontal'}
        selectable={false}
        onClick={async ({ key }) => await router.push(key)}
      >
        {isLoggedIn
          ? [
              <Menu.Item key={`/${user.username}`}>{user.username}</Menu.Item>,
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
