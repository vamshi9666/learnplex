import { Button } from 'antd'
import React from 'react'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { SaveOutlined } from '@ant-design/icons/lib'

import { useUser } from '../../../lib/hooks/useUser'

export default function BottomActionControls({
  showPreviousSection,
  goToPreviousSection,
  showNextSection,
  goToNextSection,
  completeSection,
  isSectionComplete,
  inEditMode,
  save,
  isCompleteDisabled,
}: {
  showPreviousSection: boolean
  goToPreviousSection: () => void
  showNextSection: boolean
  goToNextSection: () => void
  completeSection: () => void
  isSectionComplete: boolean
  inEditMode: boolean
  save: () => void
  isCompleteDisabled: boolean
}) {
  const { user } = useUser()
  return (
    <div
      className={'text-center bg-component border-0 m-0 p-2'}
      style={{ position: 'sticky', bottom: 0 }}
    >
      <Button
        className={'float-left'}
        disabled={!showPreviousSection}
        onClick={() => goToPreviousSection()}
      >
        <ArrowLeftOutlined />
        Previous
      </Button>
      {inEditMode ? (
        <Button
          type={'primary'}
          onClick={async () => await save()}
          icon={<SaveOutlined />}
        >
          Save
        </Button>
      ) : isSectionComplete ? (
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
          onClick={() => completeSection()}
          disabled={isCompleteDisabled || !user}
          icon={<CheckOutlined />}
        >
          Complete
        </Button>
      )}
      <Button
        className={'float-right'}
        disabled={showNextSection}
        onClick={() => goToNextSection()}
      >
        Next
        <ArrowRightOutlined />
      </Button>
    </div>
  )
}
