import React, { useEffect } from 'react'
import { Menu } from 'antd'
import { useRouter } from 'next/router'
import { useQuery } from 'urql'
import Cookies from 'js-cookie'

import { ACCESS_TOKEN_COOKIE } from '../../constants'

export default function Header() {
  const router = useRouter()
  const ME_QUERY = `
    query {
        me {
          user {
             username
          }
        }
    }
  `
  const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE)
  const [{ data, fetching, error }, reExecuteMeQuery] = useQuery({
    query: ME_QUERY,
  })
  useEffect(() => {
    reExecuteMeQuery()
  }, [accessToken, reExecuteMeQuery])
  if (fetching) return <p>Loading....</p>
  // if (error) return <p>Oh no... {error.message}</p>
  const isLoggedIn = !fetching && !error && data && data.me && !!accessToken

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
              <Menu.Item key={`/${data?.me.username}`}>
                {data?.me.user.username}
              </Menu.Item>,
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
