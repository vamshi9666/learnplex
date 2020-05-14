import React, { useContext } from 'react'
import { Alert, Button, Space } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { UserContext } from '../../../lib/contexts/UserContext'

export default function TopActionControls({
  inEditMode,
  isSaved,
  username,
  goToEditPage,
  exitEditMode,
}: {
  inEditMode: boolean
  isSaved: boolean
  username: string
  goToEditPage: () => void
  exitEditMode: () => void
}) {
  const { user } = useContext(UserContext)
  return inEditMode ? (
    <>
      <Space className={'float-left'}>
        <Alert
          message={'You are currently in edit mode.'}
          type={'info'}
          showIcon={true}
        />
        <Button type={'primary'} size={'large'} onClick={() => exitEditMode()}>
          Exit
        </Button>
      </Space>
      {!isSaved && (
        <Alert
          className={'float-right'}
          message={'You have some unsaved changes.'}
          type={'warning'}
          showIcon={true}
        />
      )}
    </>
  ) : (
    <>
      {username === user?.username && (
        <Button
          className={'float-left'}
          type={'primary'}
          icon={<EditOutlined />}
          onClick={() => goToEditPage()}
          disabled={!user}
        >
          Edit
        </Button>
      )}
      {!user && (
        <Alert
          className={'float-left'}
          message={'Please login to track your progress or edit this resource'}
          type={'info'}
          showIcon={true}
        />
      )}
    </>
  )
}
