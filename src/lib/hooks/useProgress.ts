import { useQuery } from 'urql'
import { useEffect } from 'react'

import { Section } from '../../graphql/types'

export default function useProgress({
  resourceSlug,
  sectionsMap,
}: {
  resourceSlug: string
  sectionsMap: Map<string, Section>
}) {
  const USER_PROGRESS_QUERY = `
    query($resourceSlug: String!) {
      userProgress(resourceSlug: $resourceSlug) {
        completedSections {
          id
        }
      }
    }
  `

  const [{ data, fetching, error }, reExecuteUserProgressQuery] = useQuery({
    query: USER_PROGRESS_QUERY,
    variables: {
      resourceSlug,
    },
  })

  useEffect(() => {
    reExecuteUserProgressQuery()
  }, [reExecuteUserProgressQuery])

  const completedSectionIds =
    data?.userProgress?.completedSections.map(
      (section: Section) => section.id
    ) ?? []

  function isSectionComplete({ section }: { section: Section }): boolean {
    if (section?.sections.length === 0) {
      return completedSectionIds.includes(section.id)
    }
    const subSectionIds =
      section?.sections.map((currentSection) => currentSection.id) ?? []

    return subSectionIds.every((id) =>
      isSectionComplete({ section: sectionsMap.get(id)! })
    )
  }

  return { fetching, error, isSectionComplete }
}
