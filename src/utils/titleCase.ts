import { camelCase } from 'camel-case'

const convertFirstLetterToCaps = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

export const titleCase = (text: string) => {
  const textInCamelCase = camelCase(text)
  const titleCase = textInCamelCase.replace(/([A-Z])/g, ' $1')
  return convertFirstLetterToCaps(titleCase)
}
