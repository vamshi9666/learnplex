import React from 'react'
import { useRouter } from 'next/router'
import { render, waitFor } from '@testing-library/react'

import { SEO } from '../components/SEO'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  GET_TITLE,
  OG_URL,
  SITE_NAME,
  TWITTER_HANDLE,
} from '../constants'

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

  test('should render with default title when no title is provided', async () => {
    const { container } = render(<SEO />)
    expect(container.childNodes[0].nodeName).toEqual('TITLE')
    await waitFor(() =>
      expect(document.title).toEqual(GET_TITLE(DEFAULT_TITLE))
    )
    expect(container.childNodes[3]).toHaveAttribute('name', 'description')
    expect(container.childNodes[3]).toHaveAttribute(
      'content',
      DEFAULT_DESCRIPTION
    )
    expect(container.childNodes[7]).toHaveAttribute(
      'property',
      'og:description'
    )
    expect(container.childNodes[7]).toHaveAttribute(
      'content',
      DEFAULT_DESCRIPTION
    )
  })

  test('should render with title', async () => {
    const title = 'Home'
    const description = 'some-description'
    const { container } = render(
      <SEO title={title} description={description} />
    )
    expect(container.childNodes).toHaveLength(11)
    expect(container.childNodes[0].nodeName).toEqual('TITLE')
    await waitFor(() => expect(document.title).toEqual(GET_TITLE(title)))
    expect(container.childNodes[3]).toHaveAttribute('name', 'description')
    expect(container.childNodes[3]).toHaveAttribute('content', description)
    expect(container.childNodes[7]).toHaveAttribute(
      'property',
      'og:description'
    )
    expect(container.childNodes[7]).toHaveAttribute('content', description)
  })

  test('should render meta tags', () => {
    const { container } = render(<SEO />)
    expect(container.childNodes).toHaveLength(11)
    container.childNodes.forEach((node, index) => {
      if (index > 1) expect(node.nodeName).toEqual('META')
      switch (index) {
        case 1:
          expect(node).toHaveAttribute('charset', 'utf-8')
          break
        case 2:
          expect(node).toHaveAttribute('name', 'viewport')
          expect(node).toHaveAttribute(
            'content',
            'width=device-width, initial-scale=1'
          )
          break
        case 3:
          expect(node).toHaveAttribute('name', 'description')
          expect(node).toHaveAttribute('content', DEFAULT_DESCRIPTION)
          break
        case 4:
          expect(node).toHaveAttribute('name', 'twitter:card')
          expect(node).toHaveAttribute('content', 'summary')
          break
        case 5:
          expect(node).toHaveAttribute('name', 'twitter:creator')
          expect(node).toHaveAttribute('content', TWITTER_HANDLE)
          break
        case 6:
          expect(node).toHaveAttribute('property', 'og:title')
          expect(node).toHaveAttribute('content', GET_TITLE(DEFAULT_TITLE))
          break
        case 7:
          expect(node).toHaveAttribute('property', 'og:description')
          expect(node).toHaveAttribute('content', DEFAULT_DESCRIPTION)
          break
        case 8:
          expect(node).toHaveAttribute('property', 'og:url')
          expect(node).toHaveAttribute(
            'content',
            `${OG_URL}${mockRouter.asPath}`
          )
          break
        case 9:
          expect(node).toHaveAttribute('property', 'og:image')
          expect(node).toHaveAttribute('content', '/logo.png')
          break
        case 10:
          expect(node).toHaveAttribute('property', 'og:site_name')
          expect(node).toHaveAttribute('content', SITE_NAME)
          break
      }
    })
  })
})
