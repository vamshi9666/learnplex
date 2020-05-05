import { useQuery } from 'urql'
import { useEffect } from 'react'

import { Section } from '../../graphql/types'

export default function useProgress({
  resourceSlug,
  sectionsMap,
  ownerUsername,
}: {
  resourceSlug: string
  ownerUsername: string
  sectionsMap: Map<string, Section>
}) {
  const USER_PROGRESS_QUERY = `
    query($resourceSlug: String!, $ownerUsername: String!) {
      userProgress(resourceSlug: $resourceSlug, ownerUsername: $ownerUsername) {
        completedSections {
          id
        }
      }
    }
  `

  const [{ data, fetching }, reExecuteUserProgressQuery] = useQuery({
    query: USER_PROGRESS_QUERY,
    variables: {
      resourceSlug,
      ownerUsername,
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

  return { fetching, isSectionComplete }
}
