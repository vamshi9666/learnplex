import { useRouter } from 'next/router'
import React, { useContext } from 'react'

import NotAuthenticated from '../../../../../../components/result/NotAuthenticated'
import NotAuthorized from '../../../../../../components/result/NotAuthorized'
import ResourcePage from '../../../../../../components/learn/ResourcePage'
import { UserContext } from '../../../../../../lib/contexts/UserContext'

export default function EditResource() {
  const { user } = useContext(UserContext)
  const router = useRouter()
  const username = router.query.username as string
  if (!user) return <NotAuthenticated />
  if (username !== user.username) return <NotAuthorized />

  return <ResourcePage inEditMode={true} username={username} />
}
