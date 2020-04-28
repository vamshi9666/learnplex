import { useQuery } from 'urql'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Col, Row } from 'antd'

import { Section } from '../../../../graphql/types'
import { SEO } from '../../../../components/SEO'
import { upperCamelCase } from '../../../../utils/upperCamelCase'
import Sidebar from '../../../../components/learn/Sidebar'
import { setCurrentSectionIdFromSlugs } from '../../../../utils/setSectionIdFromSlugs'
import Editor from '../../../../components/layout/Editor'

export default function ViewResource() {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const username = router.query.username as string
  const slugs = router.query.slugs as string[]
  const SECTIONS_LIST_QUERY = `
    query($resourceSlug: String!, $username: String!) {
      sectionsList(resourceSlug: $resourceSlug, username: $username) {
        id
        title
        slug
        isBaseSection
        isPage
        sections {
          id
          slug
          order
        }
        page {
          content
        }
      }
    }
  `

  const [
    {
      data: sectionsListData,
      fetching: sectionsListFetching,
      error: sectionsListError,
    },
  ] = useQuery({
    query: SECTIONS_LIST_QUERY,
    variables: {
      resourceSlug,
      username,
    },
  })
  const initialSectionsMap: Map<string, Section> = new Map()
  const [sectionsMap, setSectionsMap] = useState(initialSectionsMap)
  const [baseSectionId, setBaseSectionId] = useState('')
  const [currentSectionId, setCurrentSectionId] = useState('')

  useEffect(() => {
    if (!sectionsListFetching && !sectionsListError) {
      const [baseSection] = sectionsListData.sectionsList.filter(
        (section: Section) => section.isBaseSection
      )
      setBaseSectionId(baseSection.id)
      setSectionsMap((prevSectionsMap) => {
        const newSectionsMap = new Map()
        sectionsListData.sectionsList.forEach((section: Section) =>
          newSectionsMap.set(section.id, section)
        )
        return newSectionsMap
      })
    }
  }, [sectionsListData, sectionsListError, sectionsListFetching])

  useEffect(() => {
    if (!sectionsListFetching && !sectionsListError && !!baseSectionId) {
      setCurrentSectionIdFromSlugs({
        baseSectionId,
        slugs,
        sectionsMap,
        setCurrentSectionId,
      })
    }
  }, [
    slugs,
    baseSectionId,
    sectionsListError,
    sectionsListFetching,
    sectionsMap,
  ])

  if (sectionsListFetching || !baseSectionId) return <p>Loading....</p>
  if (sectionsListError) return <p>Oh no... {sectionsListError.message}</p>

  console.log({ sectionsListData, sectionsListFetching, sectionsListError })
  console.log({ sectionsMap, baseSectionId, currentSectionId })

  const pageContent = sectionsMap.get(currentSectionId)?.page?.content

  return (
    <>
      <SEO title={`Learn ${upperCamelCase(resourceSlug)}`} />
      <Row>
        <Col span={6}>
          <Sidebar
            defaultSelectedKeys={[slugs[slugs.length - 1] as string]}
            defaultOpenKeys={slugs}
            sectionsMap={sectionsMap}
            baseSectionId={baseSectionId}
          />
        </Col>

        <Col className={'p-5'} span={12}>
          <Editor
            pageContent={pageContent}
            currentSectionId={currentSectionId}
            username={username}
            resourceSlug={resourceSlug}
          />
        </Col>
      </Row>
    </>
  )
}
