import React from 'react'
import { Menu } from 'antd'

export default function Header() {
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
      >
        <Menu.Item>Login</Menu.Item>
        <Menu.Item>Register</Menu.Item>
      </Menu>
    </>
  )
}
