import React, { useState } from 'react'
import { Timeline, Typography } from 'antd'
import { DownOutlined, RightOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'

import SectionItemsV2 from './SectionItems'
import { Section } from '../../../graphql/types'

interface Props {
  sectionId: string
  sectionsMap: Record<string, Section>
  username: string
  resourceSlug: string
}

export default function SectionItemV2({
  sectionId,
  sectionsMap,
  username,
  resourceSlug,
}: Props) {
  const router = useRouter()
  const currentSection = sectionsMap[sectionId]
  const [isOpen, setOpen] = useState(false)
  const toggleOpen = () => {
    setOpen(!isOpen)
  }

  const goToPage = async () => {
    console.log({ router })
    let currentUrl = router.asPath
    // remove trailing slashes
    currentUrl = currentUrl.replace(/\/+$/, '')
    await router.push(`${currentUrl}${currentSection.slugsPath}`)
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
      <div onClick={() => toggleOpen()} className={'cursor-pointer'}>
        <Typography>
          <Typography.Title level={4}>
            {!currentSection.hasSubSections ? (
              <span
                className={'cursor-pointer text-primary'}
                onClick={() => goToPage()}
              >
                {currentSection.title}
              </span>
            ) : (
              <span>{currentSection.title}</span>
            )}
          </Typography.Title>
        </Typography>
      </div>
      {isOpen && currentSection.hasSubSections && (
        <SectionItemsV2
          sections={currentSection.sections}
          sectionsMap={sectionsMap}
          username={username}
          resourceSlug={resourceSlug}
        />
      )}
    </Timeline.Item>
  )
}
