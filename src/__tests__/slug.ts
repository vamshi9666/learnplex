import { slug } from '../utils/slug'
import { titleCase } from '../utils/titleCase'

test('convert title to slug', () => {
  expect(slug('This is Some Title with Spaces  and Uppercase letters')).toBe(
    'this-is-some-title-with-spaces-and-uppercase-letters'
  )
})

test('convert slug to title', () => {
  expect(titleCase('this-is-some-slug')).toBe('This Is Some Slug')
})
