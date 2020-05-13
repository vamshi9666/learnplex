import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { Row, Col, Input, Divider, Typography, Button } from 'antd'
import { useQuery } from 'urql'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants'
import { Resource } from '../graphql/types'
import ResourceCards from '../components/learn/ResourceCards'
import { SEO } from '../components/SEO'
import { logEvent } from '../utils/analytics'

export default function Home() {
  const router = useRouter()
  const accessToken: string = router.query.accessToken as string
  const refreshToken: string = router.query.refreshToken as string
  const oauth: boolean = Boolean(router.query.oauth) as boolean
  const ALL_RESOURCES_QUERY = `
    query {
      allResources {
        id
        title
        description
        slug
        user {
          username
        }
        topic {
          title
          slug
        }
        firstPageSlugsPath
        verified
      }
    }
  `

  const [{ data, fetching, error }] = useQuery({
    query: ALL_RESOURCES_QUERY,
  })
  const [value, setValue] = useState('')
  const [resources, setResources] = useState([] as Resource[])

  useEffect(() => {
    if (!fetching && !error && data && data.allResources) {
      setResources(data.allResources)
    }
  }, [data, error, fetching])

  useEffect(() => {
    console.log({ accessToken, refreshToken })
    if (!!accessToken && !!refreshToken && oauth) {
      Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken)
      Cookies.set(ACCESS_TOKEN_COOKIE, accessToken)
      router.push('/').then()
    }
  }, [accessToken, refreshToken, oauth, router])

  const filteredResources = () => {
    return resources.filter(
      (resource) =>
        resource.slug.includes(value) ||
        resource.topic.slug.includes(value) ||
        resource.user.username.includes(value)
    )
  }

  const handleChange = (value: string) => {
    setValue(value.toLowerCase())
    logEvent('resource', 'TRIES_TO_SEARCH')
  }

  return (
    <>
      <SEO title={'Home'} />
      <Row justify={'center'}>
        <Col xs={24} sm={12} md={12} lg={8}>
          <Typography>
            <Typography.Title level={3} className={'text-center'}>
              Search By Resource
            </Typography.Title>
          </Typography>
          <Input
            size={'large'}
            placeholder={'Python'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        </Col>
      </Row>
      <br />
      <Row justify={'center'} gutter={[16, 16]}>
        <Col xs={24} sm={6} md={6} lg={4}>
          <Button
            className={'float-left'}
            onClick={() => router.push(`/resources/new`)}
            block={true}
          >
            Create Resource
          </Button>
        </Col>
        <Col xs={24} sm={6} md={6} lg={4}>
          <Button
            className={'float-right'}
            type={'primary'}
            onClick={() => router.push(`/resources/me`)}
            block={true}
          >
            My Resources
          </Button>
        </Col>
      </Row>

      <Divider />

      <ResourceCards resources={filteredResources()} />
    </>
  )
}
