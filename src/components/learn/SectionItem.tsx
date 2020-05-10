import React, { useState } from 'react'
import { Skeleton, Timeline, Typography } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { RightOutlined } from '@ant-design/icons/lib'
import { useRouter } from 'next/router'

import { Section } from '../../graphql/types'
import SectionItems from './SectionItems'
import { useSections } from '../../lib/hooks/useSections'

export default function SectionItem({
  sectionId,
  sectionsMap,
}: {
  sectionId: string
  sectionsMap: Map<string, Section>
}) {
  const router = useRouter()
  const username = router.query.username as string
  const resourceSlug = router.query.resource as string
  const currentSection = sectionsMap.get(sectionId)!
  const [isOpen, setOpen] = useState(false)
  const { getSlugsPathFromSectionId } = useSections({ resourceSlug, username })
  if (!currentSection) {
    return <Skeleton active={true} />
  }
  const slugs = getSlugsPathFromSectionId({ sectionId })
  let slugsPath: string
  if (slugs.length === 0) {
    slugsPath = ''
  } else {
    slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
  }

  const toggleOpen = () => {
    setOpen(!isOpen)
  }

  return (
    <Timeline.Item
      className={'font-large'}
      dot={
        currentSection.hasSubSections && (
          <span className={'cursor-pointer'} onClick={() => toggleOpen()}>
            {isOpen ? <DownOutlined /> : <RightOutlined />}
          </span>
        )
      }
    >
      <Typography>
        <Typography.Title level={4}>
          {!currentSection.hasSubSections ? (
            <span
              className={'cursor-pointer text-primary'}
              onClick={() =>
                router.push(
                  `/[username]/learn/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
                  `/${username}/learn/${resourceSlug}/${slugsPath}`
                )
              }
            >
              {currentSection.title}
            </span>
          ) : (
            currentSection.title
          )}
        </Typography.Title>
      </Typography>
      {isOpen && currentSection.hasSubSections && (
        <SectionItems
          sections={currentSection.sections}
          sectionsMap={sectionsMap}
        />
      )}
    </Timeline.Item>
  )
}
