import useSWR from 'swr'
import NProgress from 'nprogress'
import { useContext } from 'react'
import { Button, message, Skeleton } from 'antd'

import ResourceCards from '../components/learn/ResourceCards'
import { UserContext } from '../lib/contexts/UserContext'
import { UserRole } from '../graphql/types'
import NotAuthorized from '../components/result/NotAuthorized'
import { repopulateAllSlugs } from '../utils/repopulateAllSlugs'
import { fetcher } from '../utils/fetcher'
import InternalServerError from '../components/result/InternalServerError'

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

  const populate = async () => {
    NProgress.start()
    const result = await repopulateAllSlugs()
    if (result.error) {
      message.error(result.message)
    } else {
      message.success('Operation executed successfully.')
    }
    NProgress.done()
  }

  return (
    <>
      <div className={'text-center'}>
        <Button type={'primary'} size={'large'} onClick={() => populate()}>
          Re-Populate all slugs paths
        </Button>
      </div>
      <ResourceCards resources={data.resources} />
    </>
  )
}
