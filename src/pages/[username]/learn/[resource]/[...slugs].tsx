import React from 'react'
import { useRouter } from 'next/router'

import ResourcePage from '../../../../components/learn/ResourcePage'

export default function ViewResource() {
  const router = useRouter()
  const username = router.query.username as string
  return <ResourcePage inEditMode={false} username={username} />
}
