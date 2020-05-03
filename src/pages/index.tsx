import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { Row, Col, Input, Divider, Typography, Button } from 'antd'
import { useMutation } from 'urql'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants'
import { Resource } from '../graphql/types'
import ResourceCards from '../components/learn/ResourceCards'
import { SEO } from '../components/SEO'

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

  const [value, setValue] = useState(undefined as string | undefined)
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
      <SEO title={'Home'} />
      <Row>
        <Col span={8} offset={8}>
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
      <Row>
        <Col offset={8} span={8}>
          <Button
            className={'float-left'}
            onClick={() => router.push(`/resources/new`)}
          >
            Create New Resource
          </Button>
          <Button
            className={'float-right'}
            type={'primary'}
            onClick={() => router.push(`/resources`)}
          >
            My Resources
          </Button>
        </Col>
      </Row>

      <Divider />

      <ResourceCards resources={resources} showEmpty={value !== undefined} />
    </>
  )
}
