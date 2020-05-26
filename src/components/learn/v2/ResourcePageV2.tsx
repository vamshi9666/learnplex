import { Button, Col, Grid, Row, Typography } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ArrowRightOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import NProgress from 'nprogress'

import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../../constants'
import SidebarV2 from './Sidebar'
import customMdParser from '../Editor/lib/customMdParser'
import { Resource, Section } from '../../../graphql/types'
import { UserContext } from '../../../lib/contexts/UserContext'
import { completeSection } from '../../../utils/completeSection'
import { checkIfEnrolledQuery, startProgress } from '../../../utils/progress'
import { getUserProgressByResourceId } from '../../../utils/getUserProgressByResourceId'

interface Props {
  slugs: string[]
  resource: Resource
  currentSection: Section
  sectionsMap: Record<string, Section>
  currentSections: Section[]
}

let MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})

export default function ResourcePageV2({
  slugs,
  resource,
  currentSection,
  sectionsMap,
  currentSections,
}: Props) {
  const router = useRouter()
  const { xs } = Grid.useBreakpoint()
  const { user } = useContext(UserContext)
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const [enrolled, setEnrolled] = useState(false)
  useEffect(() => {
    if (resource.id) {
      checkIfEnrolledQuery({
        resourceId: resource.id,
      }).then((enrolledResult) => {
        if (enrolledResult.error) {
          console.log({ enrolledResultError: enrolledResult.message })
          setEnrolled(false)
        } else {
          setEnrolled(enrolledResult)
        }
      })
    }
  }, [resource.id])

  const [completedSectionIds, setCompletedSectionIds] = useState([] as string[])
  useEffect(() => {
    if (enrolled && resource.id) {
      getUserProgressByResourceId({
        resourceId: resource.id,
      }).then((userProgressResult) => {
        if (userProgressResult.error) {
          console.log({ userProgressError: userProgressResult.message })
        } else {
          setCompletedSectionIds(userProgressResult)
        }
      })
    }
  }, [enrolled, resource.id])

  const completedCurrentSection = completedSectionIds.includes(
    currentSection.id
  )

  const goToPreviousSection = async () => {
    await router.push(
      `/learn/${resource.slug}${currentSection.previousSectionPath}`
    )
  }

  const goToNextSection = async () => {
    await router.push(
      `/learn/${resource.slug}${currentSection.nextSectionPath}`
    )
  }

  const startLearning = async () => {
    NProgress.start()
    const result = await startProgress({
      resourceId: resource.id,
    })
    await router.push(
      `/learn/${resource.slug}${result.resource.firstPageSlugsPath}`
    )
    NProgress.done()
  }

  const [, ...sectionIdsPath] = currentSection.pathWithSectionIds.split('/')

  return (
    <>
      <Row>
        <Col {...SIDEBAR_COL_LAYOUT}>
          <MenuOutlined
            style={{ fontSize: 'x-large' }}
            onClick={() => setSidebarVisible(!sidebarVisible)}
          />
          {(sidebarVisible || !xs) && (
            <SidebarV2
              sectionsMap={sectionsMap}
              currentSections={currentSections}
              resourceSlug={resource.slug}
              slugs={slugs}
              defaultSelectedKeys={[currentSection.id as string]}
              completedSectionIds={completedSectionIds}
              sectionIdsPath={sectionIdsPath}
            />
          )}
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
