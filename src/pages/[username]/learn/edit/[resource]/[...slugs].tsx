import { useRouter } from 'next/router'
import React from 'react'
import { Skeleton } from 'antd'

import { useUser } from '../../../../../lib/hooks/useUser'
import NotAuthenticated from '../../../../../components/result/NotAuthenticated'
import NotAuthorized from '../../../../../components/result/NotAuthorized'
import ResourcePage from '../../../../../components/learn/ResourcePage'

export default function EditResource() {
  const { user, fetching } = useUser()
  const router = useRouter()
  const username = router.query.username as string
  if (fetching) return <Skeleton active={true} />
  if (!user) return <NotAuthenticated />
  if (username !== user.username) return <NotAuthorized />

  return <ResourcePage inEditMode={true} username={username} />
}
