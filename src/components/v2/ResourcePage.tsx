import { Button, Col, Grid, Row, Skeleton, Typography } from 'antd'
import React, { useContext } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'

import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../constants'
import { SEO } from '../SEO'
import SidebarV2 from './Sidebar'
import customMdParser from '../learn/Editor/lib/customMdParser'
import { fetcher } from '../../utils/fetcher'
import InternalServerError from '../result/InternalServerError'
import { Resource, Section } from '../../graphql/types'
import { UserContext } from '../../lib/contexts/UserContext'
import { completeSection } from '../../utils/completeSection'

interface Props {
  inEditMode: boolean
  slugs: string[]
  username?: string
  resourceSlug: string
}

let MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})

export default function ResourcePageV2({
  inEditMode,
  slugs,
  username = '',
  resourceSlug,
}: Props) {
  const router = useRouter()
  const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
  const url = !!username
    ? `/api/slugs?username=${username}&resourceSlug=${resourceSlug}&slugsPath=${slugsPath}`
    : `/api/slugs?resourceSlug=${resourceSlug}&slugsPath=${slugsPath}`
  const { data, error } = useSWR(url, fetcher)
  const { xs } = Grid.useBreakpoint()
  const { user } = useContext(UserContext)

  if (error) return <InternalServerError message={error.message} />
  if (!data) return <Skeleton active={true} />

  const sectionsMap: Record<string, Section> = data.sectionsMap
  const currentSection: Section = data.currentSection
  const resource: Resource = data.resource
  const enrolled: boolean = data.enrolled
  const completedCurrentSection: boolean = data.completedCurrentSection
  const completedSectionIds = data.completedSectionIds
  const ownerUsername = resource.user.username
  const currentSections: Section[] = data.siblingSections

  const description =
    (currentSection.page?.content
      ? currentSection.page.content
      : resource.description) ?? ''

  const goToPreviousSection = async () => {
    const isPrimary =
      !router.pathname.startsWith('/v2/[username]') && !inEditMode
    await router.push(
      `/v2/${isPrimary ? '' : ownerUsername + '/'}learn/${resourceSlug}${
        currentSection.previousSectionPath
      }`
    )
  }

  const goToNextSection = async () => {
    const isPrimary =
      !router.pathname.startsWith('/v2/[username]') && !inEditMode
    await router.push(
      `/v2/${isPrimary ? '' : ownerUsername + '/'}learn/${resourceSlug}${
        currentSection.nextSectionPath
      }`
    )
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
            inEditMode={false}
            sectionsMap={sectionsMap}
            currentSections={currentSections}
            username={resource.user.username}
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
                onClick={() => (user ? {} : router.push('/register'))}
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
