import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Col, Row, Grid, Button, Popconfirm } from 'antd'
import NProgress from 'nprogress'
import { useMutation } from 'urql'

import useSlugs from '../../lib/hooks/useSlugs'
import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../constants'
import Sidebar from './Sidebar'
import CustomEditor from './Editor'
import { SEO } from '../SEO'

export default function ResourcePage({
  inEditMode,
  username = '',
}: {
  inEditMode: boolean
  username: string
}) {
  const router = useRouter()
  const resourceSlug = router.query.resource as string
  const slugs = router.query.slugs as string[]
  const {
    sectionsMap,
    currentSectionId,
    body,
    pageContent,
    keys,
    baseSectionId,
    resourceDescription,
    deleteSectionInSectionsMap,
    getNeighbourSectionSlugs,
  } = useSlugs({
    resourceSlug,
    username,
    slugs,
  })

  const { xs } = Grid.useBreakpoint()
  const parentSectionId =
    sectionsMap.get(currentSectionId)?.parentSection?.id ?? ''
  const currentSectionTitle = sectionsMap.get(currentSectionId)?.title ?? ''
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    setTitle(currentSectionTitle)
    setDescription(resourceDescription)
  }, [currentSectionTitle, resourceDescription])
  let currentSections = sectionsMap.get(parentSectionId)?.sections ?? []

  if (parentSectionId === baseSectionId) {
    currentSections = [sectionsMap.get(currentSectionId)!]
  }

  const DELETE_SECTION_MUTATION = `
    mutation($sectionId: String!) {
      deleteSection(sectionId: $sectionId)
    }
  `
  const [, deleteSectionMutation] = useMutation(DELETE_SECTION_MUTATION)

  const goTo = async ({ path, slugs }: { path: string; slugs: string[] }) => {
    if (inEditMode) {
      await router.push(
        `/[username]/learn/edit/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/edit/${resourceSlug}${path}`,
        { shallow: true }
      )
    } else {
      await router.push(
        `/[username]/learn/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/${resourceSlug}${path}`,
        { shallow: true }
      )
    }
  }

  const removeSection = async ({
    sectionId,
    parentSectionId,
  }: {
    sectionId: string
    parentSectionId: string
  }) => {
    NProgress.start()
    console.log({ sectionId, parentSectionId })
    deleteSectionMutation({
      sectionId,
    }).then((result) => {
      if (result.error) {
        console.log({ sectionDeleteError: result.error })
      } else {
        console.log({ result })
        deleteSectionInSectionsMap({ sectionId, parentSectionId })
        const { nextSectionPath, nextSectionSlugs } = getNeighbourSectionSlugs({
          sectionId: currentSectionId,
        })
        if (nextSectionPath) {
          goTo({ path: nextSectionPath, slugs: nextSectionSlugs })
          return
        }
      }
    })
    NProgress.done()
  }

  return (
    <>
      <SEO
        title={`${inEditMode ? 'Edit ' : ''}${title}`}
        description={description}
      />
      {body ? (
        body
      ) : (
        <Row>
          <Col {...SIDEBAR_COL_LAYOUT}>
            <Sidebar
              defaultSelectedKeys={[keys[keys.length - 1] as string]}
              defaultOpenKeys={keys}
              sectionsMap={sectionsMap}
              inEditMode={inEditMode}
              currentSections={currentSections}
              username={username}
            />
          </Col>

          <Col className={`${xs ? '' : 'px-5'}`} {...CONTENT_COL_LAYOUT}>
            {inEditMode && (
              <Popconfirm
                title={'This will delete all the contents of this section.'}
                onConfirm={() =>
                  removeSection({
                    sectionId: currentSectionId,
                    parentSectionId,
                  })
                }
                okText={'Continue'}
                cancelText={'Cancel'}
                okType={'danger'}
                placement={'topRight'}
              >
                <Button className={'float-right'} danger={true}>
                  Delete
                </Button>
              </Popconfirm>
            )}
            <CustomEditor
              pageContent={pageContent}
              currentSectionId={currentSectionId}
              username={username}
              resourceSlug={resourceSlug}
              inEditMode={inEditMode}
            />
          </Col>
        </Row>
      )}
    </>
  )
}
