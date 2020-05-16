import { Menu, Typography } from 'antd'
import React from 'react'
import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  FileOutlined,
  FileTextOutlined,
  FolderFilled,
} from '@ant-design/icons'

export default function SidebarMenuItemV2(props: any) {
  const currentSectionId = props.currentsectionid
  const sectionsMap = props.sectionsmap
  const isSectionComplete = !!props.issectioncomplete
  const currentSection = sectionsMap[currentSectionId]

  return (
    <Menu.Item {...props} id={currentSection.id}>
      <Typography>
        <span className={'mr-3'}>
          {currentSection.hasSubSections ? (
            <FolderFilled />
          ) : currentSection.isPage ? (
            <FileTextOutlined />
          ) : (
            <FileOutlined />
          )}
        </span>
        <Typography.Text
          style={{ width: `${75 - currentSection.depth * 3}%` }}
          ellipsis={true}
        >
          {currentSection.title}
        </Typography.Text>
        {!currentSection.hasSubSections && (
          <span className={'float-right'}>
            {isSectionComplete ? (
              <CheckCircleTwoTone twoToneColor={'#52c41a'} />
            ) : (
              <CheckCircleOutlined />
            )}
          </span>
        )}
      </Typography>
    </Menu.Item>
  )
}
