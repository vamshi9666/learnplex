import { Timeline } from 'antd'
import React from 'react'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'

import { Section } from '../../graphql/types'
import NewSectionModal from './NewSectionModal'

export default function NewSectionButton({
  show,
  setShow,
  parentSectionId,
  sectionsMap,
}: {
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  parentSectionId: string
  sectionsMap: Map<string, Section>
}) {
  return (
    <Timeline.Item
      className={'mb-4'}
      dot={
        show ? (
          <MinusCircleOutlined
            className={'font-large'}
            onClick={() => setShow(false)}
          />
        ) : (
          <PlusCircleOutlined
            className={'font-large'}
            onClick={() => setShow(true)}
          />
        )
      }
    >
      <NewSectionModal
        parentSectionId={parentSectionId}
        show={show}
        setShow={setShow}
        sectionsMap={sectionsMap}
      />
    </Timeline.Item>
  )
}
