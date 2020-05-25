import { Timeline } from 'antd'
import React, { useState } from 'react'
import { PlusCircleOutlined } from '@ant-design/icons'

import NewSectionModalV2 from './NewSectionModalV2'

interface Props {
  parentSectionId: string
}

export default function NewSectionV2({ parentSectionId }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <Timeline.Item
      className={'mb-4'}
      dot={
        <PlusCircleOutlined
          className={'font-large'}
          onClick={() => setShowModal((a) => !a)}
        />
      }
    >
      <NewSectionModalV2
        visible={showModal}
        parentSectionId={parentSectionId}
        setShowModal={setShowModal}
      />
    </Timeline.Item>
  )
}
