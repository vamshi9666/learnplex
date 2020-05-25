import { useRouter } from 'next/router'
import { Button, Col, Grid, message, Popconfirm, Row } from 'antd'
import React from 'react'

import { CONTENT_COL_LAYOUT, SIDEBAR_COL_LAYOUT } from '../../../../constants'
import EditSidebarV2 from './EditSidebarV2'
import CustomEditorV2 from './editor/CustomEditorV2'
import { deleteSection as deleteSectionInDB } from '../../../../utils/deleteSection'
import { Resource, Section } from '../../../../graphql/types'

interface Props {
  resource: Resource
  currentSection: Section
  sectionsMap: Record<string, Section>
  reValidate: Function
}

export default function EditResourcePageV2({
  resource,
  currentSection,
  sectionsMap,
  reValidate,
}: Props) {
  const router = useRouter()

  const { xs } = Grid.useBreakpoint()

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
      `/learn/edit/${resource.slug}${currentSection.nextSectionPath}`
    )
  }

  return (
    <>
      <Row>
        <Col {...SIDEBAR_COL_LAYOUT}>
          <EditSidebarV2
            currentSections={baseSection.sections}
            sectionsMap={sectionsMap}
            resourceSlug={resource.slug}
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
            reValidate={reValidate}
            currentSection={currentSection}
            resourceSlug={resource.slug}
          />
        </Col>
      </Row>
    </>
  )
}
