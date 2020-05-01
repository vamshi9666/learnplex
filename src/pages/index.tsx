import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { Card, Row, Col } from 'antd'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants'

export default function Home() {
  const router = useRouter()
  const accessToken: string = router.query.accessToken as string
  const refreshToken: string = router.query.refreshToken as string
  const oauth: boolean = Boolean(router.query.oauth) as boolean

  useEffect(() => {
    console.log({ accessToken, refreshToken })
    if (!!accessToken && !!refreshToken && oauth) {
      Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken)
      Cookies.set(ACCESS_TOKEN_COOKIE, accessToken)
      router.push('/').then()
    }
  }, [accessToken, refreshToken, oauth, router])

  const resources = [
    {
      id: '1',
      imgSrc:
        'https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png',
      title: 'Learn React',
      description: 'A JavaScript library for building user interfaces',
      resourceSlug: 'react',
      owner_username: 'pbteja1998',
    },
    {
      id: '2',
      imgSrc:
        'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/267_Python_logo-512.png',
      title: 'Learn Python',
      description:
        'A programming language that lets you work more quickly and integrate your systems more effectively.',
      resourceSlug: 'python',
      owner_username: 'pbteja1998',
    },
    {
      id: '3',
      imgSrc:
        'https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png',
      title: 'Learn React',
      description: 'A JavaScript library for building user interfaces',
      resourceSlug: 'react',
      owner_username: 'pbteja1998',
    },
    {
      id: '4',
      imgSrc:
        'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/267_Python_logo-512.png',
      title: 'Learn Python 3',
      description:
        'A programming language that lets you work more quickly and integrate your systems more effectively.',
      resourceSlug: 'python-3',
      owner_username: 'pbteja1998',
    },
    {
      id: '5',
      imgSrc:
        'https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png',
      title: 'Learn React',
      description: 'A JavaScript library for building user interfaces',
      resourceSlug: 'react',
      owner_username: 'pbteja1998',
    },
    {
      id: '6',
      imgSrc:
        'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/267_Python_logo-512.png',
      title: 'Learn Python 3',
      description:
        'A programming language that lets you work more quickly and integrate your systems more effectively.',
      resourceSlug: 'python-3',
      owner_username: 'pbteja1998',
    },
  ]

  return (
    <>
      <Row gutter={[16, 16]}>
        {resources.map((resource) => (
          <Col key={resource.id} md={6}>
            <Card
              key={resource.id}
              hoverable
              cover={
                <img
                  alt={resource.title}
                  src={resource.imgSrc}
                  style={{ width: '150px', margin: '20px auto 0 auto' }}
                />
              }
              onClick={() =>
                router.push(
                  `/${resource.owner_username}/learn/${resource.resourceSlug}`
                )
              }
            >
              <Card.Meta
                title={resource.title}
                description={resource.description}
                className={'overflow-scroll'}
                style={{
                  height: '100px',
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
