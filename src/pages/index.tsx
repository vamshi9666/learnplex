import React from 'react'
import { GetServerSideProps } from 'next'
import { parseCookies } from '../lib/parseCookies'
import { useQuery } from 'urql'

export default function Home({ accessToken = '' }) {
  const ME_QUERY = `
    query {
        me {
            id
            name
            email
            roles
            githubId
            username
            confirmed
        }
    }
  `

  const [meResult, reExecuteMeQuery] = useQuery({
    query: ME_QUERY,
  })

  const { data, fetching, error } = meResult

  if (fetching) return <p>Loading....</p>
  if (error) return <p>Oh no... {error.message}</p>

  return <div>Hello {data.me.username}!</div>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = parseCookies(context.req)
  return {
    props: {
      accessToken: cookies.accessToken,
    },
  }
}
