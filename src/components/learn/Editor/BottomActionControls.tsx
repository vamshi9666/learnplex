import { Button, message } from 'antd'
import React from 'react'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ArrowRightOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import NProgress from 'nprogress'
import { useMutation } from 'urql'
import { useRouter } from 'next/router'

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
  hasEnrolled,
  resourceId,
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
  hasEnrolled: boolean
  resourceId: string
}) {
  const { user } = useUser()
  const START_PROGRESS_MUTATION = `
    mutation($resourceId: String!) {
      startProgress(resourceId: $resourceId) {
        id
        resource {
          slug
          user {
            username
          }
          firstPageSlugsPath
        }
      }
    }
  `
  const [, startProgressMutation] = useMutation(START_PROGRESS_MUTATION)
  const router = useRouter()
  const startProgress = ({ resourceId }: { resourceId: string }) => {
    NProgress.start()
    startProgressMutation({ resourceId }).then(async (result) => {
      if (result.error) {
        console.log({ startProgressError: result.error })
      } else {
        console.log({ result })
        message.success('Now you can track your progress')
        router.reload()
      }
    })
    NProgress.done()
  }
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
      ) : !hasEnrolled ? (
        <Button
          type={'primary'}
          disabled={!user}
          onClick={() => startProgress({ resourceId })}
        >
          Start Learning
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
        disabled={!showNextSection}
        onClick={() => goToNextSection()}
      >
        Next
        <ArrowRightOutlined />
      </Button>
    </div>
  )
}
