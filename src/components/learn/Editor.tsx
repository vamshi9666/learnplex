import React from 'react'
import { convertToRaw } from 'draft-js'
import NProgress from 'nprogress'
import { useMutation } from 'urql'
import { useRouter } from 'next/router'

import { useUser } from '../../lib/hooks/useUser'
import CustomDraftEditor from './CustomDraftEditor'
import { useSections } from '../../lib/hooks/useSections'

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
  const EMPTY_PAGE_CONTENT = JSON.stringify({
    entityMap: {},
    blocks: [
      {
        text: ' ',
        key: 'empty',
        type: 'unstyled',
        entityRanges: [],
      },
    ],
  })
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
  const FORK_RESOURCE_MUTATION = `
    mutation($data: ForkResourceInput!) {
      forkResource(data: $data) {
        id
      }
    }
  `

  if (pageContent === undefined) {
    pageContent = EMPTY_PAGE_CONTENT
  }

  const [, savePage] = useMutation(SAVE_PAGE_MUTATION)
  const [, forkResource] = useMutation(FORK_RESOURCE_MUTATION)

  const save = async ({ content }: { content: any }) => {
    const pageContentJson = convertToRaw(content)
    const pageContent = JSON.stringify(pageContentJson)
    NProgress.start()
    savePage({
      data: {
        pageContent,
        sectionId: currentSectionId,
      },
    }).then((result) => {
      if (result.error) {
        console.log({ savePageError: result.error })
      } else {
        console.log({ result })
      }
    })
    NProgress.done()
  }

  const { user } = useUser()

  const fork = () => {
    NProgress.start()
    forkResource({
      data: {
        username,
        resourceSlug,
      },
    }).then(async (result) => {
      if (result.error) {
        console.log({ forkResourceError: result.error })
      } else {
        console.log({ result })
        const slugs = router.query.slugs as string[]
        const slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
        await router.push(
          `/${user?.username}/learn/edit/${resourceSlug}/${slugsPath}`
        )
      }
    })
    NProgress.done()
  }

  const { getNeighbourSectionSlugs, body } = useSections({
    username,
    resourceSlug,
  })

  if (body) return body

  const goTo = async ({ path }: { path: string }) => {
    if (inEditMode) {
      await router.push(`/${username}/learn/edit/${resourceSlug}/${path}`)
    } else {
      await router.push(`/${username}/learn/${resourceSlug}/${path}`)
    }
  }

  const { prevSectionPath, nextSectionPath } = getNeighbourSectionSlugs({
    sectionId: currentSectionId,
  })

  const goToPreviousSection = async () => {
    if (!prevSectionPath) {
      return
    }
    await goTo({ path: prevSectionPath })
  }

  const goToNextSection = async () => {
    if (!nextSectionPath) {
      return
    }
    await goTo({ path: nextSectionPath })
  }

  return (
    <CustomDraftEditor
      fork={fork}
      save={save}
      inEditMode={inEditMode}
      editorKey={`editor-${currentSectionId}`}
      pageContent={pageContent}
      showPrevButton={!!prevSectionPath}
      showNextButton={!!nextSectionPath}
      goToNextSection={goToNextSection}
      goToPreviousSection={goToPreviousSection}
    />
  )
}
