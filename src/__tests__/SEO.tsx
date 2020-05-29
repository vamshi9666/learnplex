import React from 'react'
import { useRouter } from 'next/router'
import { render } from '@testing-library/react'

import { SEO } from '../components/SEO'

describe('SEO', () => {
  const mockRouter = {
    asPath: '/test',
  }
  beforeAll(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  afterAll(() => {
    ;(useRouter as jest.Mock).mockReset()
  })

  test('should match snapshot when no title and description are given', () => {
    const { container } = render(<SEO />)
    expect(container).toMatchInlineSnapshot(`
      <div>
        <title>
          Coderplex - Coderplex
        </title>
        <meta
          content="Master any Technology"
          name="description"
        />
        <meta
          content="Coderplex - Coderplex"
          property="og:title"
        />
        <meta
          content="Master any Technology"
          property="og:description"
        />
        <meta
          content="https://coderplex.in/test"
          property="og:url"
        />
      </div>
    `)
  })

  test('should match snapshot when title and description are given', () => {
    const { container } = render(
      <SEO title={'Home'} description={'This is some test description'} />
    )
    expect(container).toMatchInlineSnapshot(`
      <div>
        <title>
          Coderplex - Home
        </title>
        <meta
          content="This is some test description"
          name="description"
        />
        <meta
          content="Coderplex - Home"
          property="og:title"
        />
        <meta
          content="This is some test description"
          property="og:description"
        />
        <meta
          content="https://coderplex.in/test"
          property="og:url"
        />
      </div>
    `)
  })
})
