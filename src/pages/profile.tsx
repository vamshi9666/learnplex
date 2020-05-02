import React from 'react'

import { useUser } from '../lib/hooks/useUser'
import ComingSoon from '../components/error/ComingSoon'

export default function Profile() {
  const { fetching, error } = useUser()

  if (fetching) return <p>Loading....</p>
  if (error) return <p>Oh no... {error.message}</p>

  return <ComingSoon />
}
