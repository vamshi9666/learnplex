import useSWR from 'swr/esm/use-swr'

import { fetcher } from '../utils/fetcher'
import InternalServerError from '../components/result/InternalServerError'
import { Skeleton } from 'antd'
import ResourceCards from '../components/learn/ResourceCards'
import { useContext } from 'react'
import { UserContext } from '../lib/contexts/UserContext'
import { UserRole } from '../graphql/types'
import NotAuthorized from '../components/result/NotAuthorized'

export default function AdminPage() {
  const { data, error } = useSWR('/api/resources', fetcher)
  const { user } = useContext(UserContext)
  if (error) {
    return <InternalServerError message={error.message} />
  }
  if (!data) {
    return <Skeleton active={true} />
  }

  if (!user?.roles.includes(UserRole.Admin)) {
    return <NotAuthorized />
  }

  return <ResourceCards resources={data.resources} />
}
