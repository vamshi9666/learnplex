import { Button, Col, Grid, Row, Skeleton, Typography } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import NProgress from 'nprogress'

import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../constants'
import { SEO } from '../SEO'
import SidebarV2 from './Sidebar'
import customMdParser from '../learn/Editor/lib/customMdParser'
import { fetcher } from '../../utils/fetcher'
import InternalServerError from '../result/InternalServerError'
import { Resource, Section } from '../../graphql/types'
import { UserContext } from '../../lib/contexts/UserContext'
import { completeSection } from '../../utils/completeSection'
import { checkIfEnrolledQuery, startProgress } from '../../utils/progress'
import { getUserProgressByResourceId } from '../../utils/getUserProgressByResourceId'

interface Props {
  inEditMode: boolean
  slugs: string[]
  resourceSlug: string
}

let MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})

export default function ResourcePageV2({
  inEditMode,
  slugs,
  resourceSlug,
}: Props) {
  const router = useRouter()
  const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
  const url = `/api/slugs?resourceSlug=${resourceSlug}&slugsPath=${slugsPath}`
  const { data, error } = useSWR(url, fetcher)
  const { xs } = Grid.useBreakpoint()
  const { user } = useContext(UserContext)

  /**
   * Temporary fix, after figuring out why cookies are not being sent in /api,
   * remove the following useEffect, and get enrolled status directly from /api
   **/
  const [enrolled, setEnrolled] = useState(false)
  useEffect(() => {
    if (data?.resource?.id) {
      checkIfEnrolledQuery({
        resourceId: data.resource.id,
      }).then((enrolledResult) => {
        if (enrolledResult.error) {
          console.log({ enrolledResultError: enrolledResult.message })
          setEnrolled(false)
        } else {
          setEnrolled(enrolledResult)
        }
      })
    }
    // eslint-disable-next-line
  }, [data?.resource?.id])

  /**
   * Temporary fix, after figuring out why cookies are not being sent in /api,
   * remove the following useEffect, and get completedSectionIds directly from /api
   **/
  const [completedSectionIds, setCompletedSectionIds] = useState([] as string[])
  useEffect(() => {
    if (enrolled && data?.resource?.id) {
      getUserProgressByResourceId({
        resourceId: data.resource.id,
      }).then((userProgressResult) => {
        if (userProgressResult.error) {
          console.log({ userProgressError: userProgressResult.message })
        } else {
          setCompletedSectionIds(userProgressResult)
        }
      })
    }
    // eslint-disable-next-line
  }, [data?.resource?.id, enrolled])

  if (error) return <InternalServerError message={error.message} />
  if (!data) return <Skeleton active={true} />

  const sectionsMap: Record<string, Section> = data.sectionsMap
  const currentSection: Section = data.currentSection
  const resource: Resource = data.resource
  // const enrolled: boolean = data.enrolled
  // const completedCurrentSection: boolean = data.completedCurrentSection
  /**
   * Temporary fix, after figuring out why cookies are not being sent in /api,
   * remove the following useEffect, and get completedCurrentSection directly from /api
   **/
  const completedCurrentSection = completedSectionIds.includes(
    currentSection.id
  )
  // const completedSectionIds = data.completedSectionIds
  const ownerUsername = resource.user.username
  const currentSections: Section[] = data.sections

  const description =
    (currentSection.page?.content
      ? currentSection.page.content
      : resource.description) ?? ''

  const goToPreviousSection = async () => {
    await router.push(
      `/learn/${resourceSlug}${currentSection.previousSectionPath}`
    )
  }

  const goToNextSection = async () => {
    await router.push(`/learn/${resourceSlug}${currentSection.nextSectionPath}`)
  }

  const startLearning = async () => {
    console.log({ resource })
    if (resource?.id) {
      console.log('here')
      NProgress.start()
      const result = await startProgress({
        resourceId: resource.id,
      })
      console.log({ result })
      console.log(`${router.asPath}${result.resource.firstPageSlugsPath}`)
      if (resource.verified) {
        await router.push(
          `/learn/${resource.slug}${result.resource.firstPageSlugsPath}`
        )
      } else {
        console.log({
          path: `/${resource.user.username}/learn/${resource.slug}${result.resource.firstPageSlugsPath}`,
        })
        await router.push(
          `/${resource.user.username}/learn/${resource.slug}${result.resource.firstPageSlugsPath}`
        )
      }
      NProgress.done()
    }
  }

  return (
    <>
      <SEO
        title={`${inEditMode ? 'Edit ' : ''}${currentSection.title}`}
        description={description}
      />
      <Row>
        <Col {...SIDEBAR_COL_LAYOUT}>
          <SidebarV2
            sectionsMap={sectionsMap}
            currentSections={currentSections}
            resourceSlug={resource.slug}
            slugs={slugs}
            defaultSelectedKeys={[currentSection.id as string]}
            completedSectionIds={completedSectionIds}
          />
        </Col>

        <Col className={`${xs ? '' : 'px-5'}`} {...CONTENT_COL_LAYOUT}>
          <Typography>
            <Typography.Title level={2}>
              {currentSection.title}
            </Typography.Title>
          </Typography>
          <MdEditor
            readOnly={true}
            config={{
              view: {
                menu: true,
                html: true,
                md: false,
              },
            }}
            value={currentSection.page?.content ?? ''}
            renderHTML={(text: string) => customMdParser().render(text)}
            placeholder={'There is nothing here...'}
            plugins={['full-screen']}
          />
          <div
            className={'text-center bg-component border-0 m-0 p-2'}
            style={{ position: 'sticky', bottom: 0 }}
          >
            <Button
              className={'float-left'}
              disabled={!currentSection.previousSectionPath}
              onClick={() => goToPreviousSection()}
            >
              <ArrowLeftOutlined />
              Previous
            </Button>
            <Button
              className={'float-right'}
              disabled={!currentSection.nextSectionPath}
              onClick={() => goToNextSection()}
            >
              Next
              <ArrowRightOutlined />
            </Button>
            {enrolled ? (
              completedCurrentSection ? (
                <Button
                  type={'primary'}
                  className={'bg-success'}
                  icon={<CheckOutlined />}
                >
                  Completed
                </Button>
              ) : (
                <Button
                  type={'primary'}
                  disabled={!currentSection.isPage}
                  onClick={async () =>
                    (await completeSection({ sectionId: currentSection.id })) &&
                    goToNextSection()
                  }
                  icon={<CheckOutlined />}
                >
                  Complete
                </Button>
              )
            ) : (
              <Button
                type={'primary'}
                onClick={() =>
                  user ? startLearning() : router.push('/register')
                }
              >
                Start Learning
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </>
  )
}
