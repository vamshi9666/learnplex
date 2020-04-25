import React from 'react'

import { useUser } from '../lib/hooks/useUser'

export default function Profile() {
  const { user, fetching, error } = useUser()

  if (fetching) return <p>Loading....</p>
  if (error) return <p>Oh no... {error.message}</p>

  return <p>Hello {user.username}!</p>
}
