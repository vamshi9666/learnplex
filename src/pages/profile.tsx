import React from 'react'
import { useQuery } from 'urql'

export default function Profile() {
  const ME_QUERY = `
    query {
        me {
          user {
            username
          }
        }
    }
  `

  const [{ data, fetching, error }] = useQuery({
    query: ME_QUERY,
  })

  if (fetching) return <p>Loading....</p>
  if (error) return <p>Oh no... {error.message}</p>

  return <p>Hello {data.me.user.username}!</p>
}
