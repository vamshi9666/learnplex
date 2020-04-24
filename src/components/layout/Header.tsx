import React from 'react'
import { Menu } from 'antd'
import { useRouter } from 'next/router'

export default function Header() {
  const router = useRouter()
  return (
    <>
      <div className={'logo float-left'}>
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
        <Menu.Item key={'/login'}>Login</Menu.Item>
        <Menu.Item key={'/register'}>Register</Menu.Item>
      </Menu>
    </>
  )
}
