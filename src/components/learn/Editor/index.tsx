import React from 'react'
import NProgress from 'nprogress'
import { useMutation, useQuery } from 'urql'
import { useRouter } from 'next/router'
import { message, Skeleton } from 'antd'

import { useSections } from '../../../lib/hooks/useSections'
import useProgress from '../../../lib/hooks/useProgress'
import MarkdownEditor from './MarkdownEditor'

export default function CustomEditor({
  pageContent,
  currentSectionId,
  username,
  resourceSlug,
  inEditMode = true,
}: {
  pageContent: string | undefined
  currentSectionId: string
  username: string
  resourceSlug: string
  inEditMode?: boolean
}) {
  const router = useRouter()
  const SAVE_PAGE_MUTATION = `
    mutation($data: SavePageInput!) {
      savePage(data: $data) {
        id
        page {
          id
          content
        }
      }
    }
  `
  if (pageContent === undefined) {
    pageContent = ''
  }
  const [, savePage] = useMutation(SAVE_PAGE_MUTATION)

  const save = async ({ editorState }: { editorState: string }) => {
    NProgress.start()
    savePage({
      data: {
        pageContent: editorState,
        sectionId: currentSectionId,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ savePageError: result.error })
      } else {
        console.log({ result, content: result.data.savePage.page.content })
      }
    })
    NProgress.done()
    message.success('Your changes have been saved.', 1)
  }

  const UPDATE_SECTION_MUTATION = `
    mutation($data: UpdateSectionInput!) {
      updateSection(data: $data) {
        id
        title
        slug
        isBaseSection
        isPage
        hasSubSections
        order
        depth
        sections {
          id
          order
          slug
        }
        parentSection {
          id
        }
        page {
          content
        }
        resource {
          id
        }
      }
    }
  `

  const [, updateSectionMutation] = useMutation(UPDATE_SECTION_MUTATION)

  const updateSectionTitle = async ({ title }: { title: string }) => {
    NProgress.start()
    updateSectionMutation({
      data: {
        title,
        sectionId: currentSectionId,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ updateSectionError: result.error })
      } else {
        console.log({ result })
        const slug = result.data.updateSection.slug
        const previousSlug = sectionsMap.get(currentSectionId)!.slug
        setSectionInSectionsMap({ updatedSection: result.data.updateSection })
        const slugs = router.query.slugs as string[]
        slugs[slugs?.length - 1] = slug
        const slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
        if (slug !== previousSlug) {
          router.push(
            `/[username]/learn/edit/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
            `/${username}/learn/edit/${resourceSlug}/${slugsPath}`,
            { shallow: true }
          )
        }
      }
    })
    NProgress.done()
  }

  const {
    getNeighbourSectionSlugs,
    body,
    resourceId,
    setSection: setSectionInSectionsMap,
  } = useSections({
    username,
    resourceSlug,
  })

  const COMPLETE_SECTION_MUTATION = `
    mutation($data: CompleteSectionInput!) {
      completeSection(data: $data) {
        id
        user {
          username
        }
        completedSections {
          slug
        }
      }
    }
  `

  const [, completeSectionMutation] = useMutation(COMPLETE_SECTION_MUTATION)

  const { sectionsMap } = useSections({ resourceSlug, username })
  const { isSectionComplete, fetching } = useProgress({
    resourceSlug,
    ownerUsername: username,
    sectionsMap,
  })

  const HAS_ENROLLED_QUERY = `
    query($username: String!, $resourceSlug: String!) {
      hasEnrolled(username: $username, resourceSlug: $resourceSlug)
    }
  `

  const [{ data, fetching: hasEnrolledFetching }] = useQuery({
    query: HAS_ENROLLED_QUERY,
    variables: {
      username,
      resourceSlug,
    },
  })

  if (fetching || hasEnrolledFetching) return <Skeleton active={true} />

  if (body) return body

  const goTo = async ({ path }: { path: string }) => {
    const slugs = path.split('/')
    if (inEditMode) {
      await router.push(
        `/[username]/learn/edit/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/edit/${resourceSlug}/${path}`,
        { shallow: true }
      )
    } else {
      await router.push(
        `/[username]/learn/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
        `/${username}/learn/${resourceSlug}/${path}`,
        { shallow: true }
      )
    }
  }

  const { prevSectionPath, nextSectionPath } = getNeighbourSectionSlugs({
    sectionId: currentSectionId,
  })

  const goToPreviousSection = async () => {
    console.log('prev')
    if (!prevSectionPath) {
      return
    }
    await goTo({ path: prevSectionPath })
  }

  const goToNextSection = async () => {
    console.log('next')
    if (!nextSectionPath) {
      return
    }
    await goTo({ path: nextSectionPath })
  }

  const completeSection = () => {
    NProgress.start()
    completeSectionMutation({
      data: {
        sectionId: currentSectionId,
      },
    }).then(async (result) => {
      if (result.error) {
        console.log({ completeSectionError: result.error })
      } else {
        console.log({ result })
        await goToNextSection()
      }
    })
    NProgress.done()
  }

  return (
    <MarkdownEditor
      inEditMode={inEditMode}
      save={save}
      pageContent={pageContent}
      title={sectionsMap.get(currentSectionId)?.title || ''}
      showPreviousSection={!!prevSectionPath}
      goToPreviousSection={goToPreviousSection}
      showNextSection={!!nextSectionPath}
      goToNextSection={goToNextSection}
      completeSection={completeSection}
      isSectionComplete={isSectionComplete({
        section: sectionsMap.get(currentSectionId)!,
      })}
      hasEnrolled={data?.hasEnrolled ?? false}
      resourceId={resourceId}
      updateSectionTitle={updateSectionTitle}
    />
  )
}
