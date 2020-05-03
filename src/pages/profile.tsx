import React from 'react'
import { Skeleton } from 'antd'

import { useUser } from '../lib/hooks/useUser'
import ComingSoon from '../components/error/ComingSoon'
import InternalServerError from '../components/error/InternalServerError'

export default function Profile() {
  const { fetching, error } = useUser()

  if (fetching) return <Skeleton active={true} />
  if (error) return <InternalServerError message={error.message} />

  return <ComingSoon />
}
