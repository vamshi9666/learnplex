import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { useQuery } from 'urql'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants'
import { Resource } from '../graphql/types'
import ResourceCards from '../components/learn/ResourceCards'
import { SEO } from '../components/SEO'

export default function Home() {
  const router = useRouter()
  const accessToken: string = router.query.accessToken as string
  const refreshToken: string = router.query.refreshToken as string
  const oauth: boolean = Boolean(router.query.oauth) as boolean
  const ALL_PUBLISHED_RESOURCES = `
    query {
      allPublishedResources {
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
        createdDate
      }
    }
  `

  const [{ data, fetching, error }] = useQuery({
    query: ALL_PUBLISHED_RESOURCES,
  })
  const [resources, setResources] = useState([] as Resource[])

  useEffect(() => {
    if (!fetching && !error && data && data.allPublishedResources) {
      setResources(data.allPublishedResources)
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

  return (
    <>
      <SEO title={'Home'} />
      <ResourceCards resources={resources} />
    </>
  )
}
