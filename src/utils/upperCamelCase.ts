const upperCamelCase = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

const titleCase = (slug: string) => {
  console.log(slug)
  const wordsArray = slug.toLowerCase().split('-')
  console.log({ wordsArray })
  const upperCased = wordsArray.map(
    (word) => word.charAt(0).toUpperCase() + word.substr(1)
  )
  console.log({ upperCased })
  return upperCased.join(' ')
}

export { upperCamelCase, titleCase }
