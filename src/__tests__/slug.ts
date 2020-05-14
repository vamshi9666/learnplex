import { slug } from '../utils/slug'

test('convert title to slug', () => {
  expect(slug('This is Some Title with Spaces  and Uppercase letters')).toBe(
    'this-is-some-title-with-spaces-and-uppercase-letters'
  )
})
