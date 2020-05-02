import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { Card, Row, Col, Input, Divider, Typography } from 'antd'
import { useMutation } from 'urql'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants'
import { Resource } from '../graphql/types'

export default function Home() {
  const router = useRouter()
  const accessToken: string = router.query.accessToken as string
  const refreshToken: string = router.query.refreshToken as string
  const oauth: boolean = Boolean(router.query.oauth) as boolean
  const SEARCH_RESOURCES_MUTATION = `
    mutation($value: String!) {
      searchResources(value: $value) {
        id
        title
        description
        slug
        user {
          username
        }
      }
    }
  `

  const [value, setValue] = useState('')
  const [resources, setResources] = useState([] as Resource[])
  const [, searchMutation] = useMutation(SEARCH_RESOURCES_MUTATION)

  useEffect(() => {
    console.log({ accessToken, refreshToken })
    if (!!accessToken && !!refreshToken && oauth) {
      Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken)
      Cookies.set(ACCESS_TOKEN_COOKIE, accessToken)
      router.push('/').then()
    }
  }, [accessToken, refreshToken, oauth, router])

  const handleChange = (value: string) => {
    setValue(value)
    if (!value) {
      setResources([])
      return
    }
    searchMutation({
      value,
    }).then((result) => {
      if (result.error) {
        console.log({ searchError: result.error })
      } else {
        console.log({ result })
        setResources(result.data.searchResources)
      }
    })
  }

  return (
    <>
      <Row>
        <Col span={8} offset={8}>
          <Typography>
            <Typography.Title level={3} className={'text-center'}>
              Search By Resource
            </Typography.Title>
          </Typography>
          <Input
            placeholder={'Python'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        </Col>
      </Row>
      <Divider />
      <Row gutter={[16, 16]}>
        {resources.map((resource) => (
          <Col key={resource.id} md={6}>
            <Card
              key={resource.id}
              hoverable
              onClick={() =>
                router.push(`/${resource.user.username}/learn/${resource.slug}`)
              }
            >
              <Card.Meta
                title={`${resource.title}`}
                description={resource.description}
                className={'overflow-scroll'}
                style={{
                  height: '100px',
                }}
              />
              by {resource.user.username}
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
