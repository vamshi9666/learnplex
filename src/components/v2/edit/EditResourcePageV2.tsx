import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Button, Col, Grid, message, Popconfirm, Row, Skeleton } from 'antd'
import React, { useContext } from 'react'

import { fetcher } from '../../../utils/fetcher'
import InternalServerError from '../../result/InternalServerError'
import { UserContext } from '../../../lib/contexts/UserContext'
import NotAuthorized from '../../result/NotAuthorized'
import NotAuthenticated from '../../result/NotAuthenticated'
import { SEO } from '../../SEO'
import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../../constants'
import EditSidebarV2 from './EditSidebarV2'
import CustomEditorV2 from '../editor/CustomEditorV2'
import { deleteSection as deleteSectionInDB } from '../../../utils/deleteSection'

interface Props {
  resourceSlug: string
  slugs: string[]
}

export default function EditResourcePageV2({ resourceSlug, slugs }: Props) {
  const router = useRouter()
  const { user } = useContext(UserContext)
  const slugsPath = slugs.reduce((a, b) => `${a}/${b}`, '')
  const url = `/api/slugs?resourceSlug=${resourceSlug}&slugsPath=${slugsPath}&editMode=${true}`
  const { data, error } = useSWR(url, fetcher)
  const { xs } = Grid.useBreakpoint()

  if (error) return <InternalServerError message={error.message} />
  if (!data) return <Skeleton active={true} />

  const resource = data.resource
  if (!user) {
    return <NotAuthenticated />
  }
  if (resource.user.username !== user.username) {
    return <NotAuthorized />
  }
  const currentSection = data.currentSection
  const sectionsMap = data.sectionsMap
  const baseSectionId = resource.baseSectionId
  const baseSection = sectionsMap[baseSectionId]
  const pathWithSectionIds = currentSection.pathWithSectionIds
  const [, ...keys] = pathWithSectionIds.split('/')
  const deleteSection = async () => {
    const result = await deleteSectionInDB({ sectionId: currentSection.id })
    if (result.error) {
      message.error(result.message)
      return
    }
    message.success('Section Deleted Successfully')
    await router.push(
      `/learn/edit/${resourceSlug}${currentSection.nextSectionPath}`
    )
  }

  return (
    <>
      <SEO
        title={`Edit ${currentSection.title}`}
        description={resource.description}
      />
      <Row>
        <Col {...SIDEBAR_COL_LAYOUT}>
          <EditSidebarV2
            currentSections={baseSection.sections}
            sectionsMap={sectionsMap}
            resourceSlug={resourceSlug}
            defaultSelectedKeys={[keys[keys.length - 1] as string]}
            defaultOpenKeys={keys}
          />
        </Col>

        <Col className={`${xs ? '' : 'px-5'}`} {...CONTENT_COL_LAYOUT}>
          <Popconfirm
            title={'This will delete all the contents of this section.'}
            onConfirm={() => deleteSection()}
            okText={'Continue'}
            cancelText={'Cancel'}
            okType={'danger'}
            placement={'topRight'}
          >
            <Button className={'float-right'} danger={true}>
              Delete
            </Button>
          </Popconfirm>
          <CustomEditorV2
            currentSection={currentSection}
            resourceSlug={resourceSlug}
          />
        </Col>
      </Row>
    </>
  )
}
