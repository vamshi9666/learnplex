import React, { useEffect, useState } from 'react'
import NProgress from 'nprogress'
import { useMutation } from 'urql'
import { useRouter } from 'next/router'
import { Alert, Button, message, Skeleton, Space } from 'antd'

import { useUser } from '../../lib/hooks/useUser'
import { useSections } from '../../lib/hooks/useSections'
import useProgress from '../../lib/hooks/useProgress'
import MarkdownEditor from './MarkdownEditor'
import {
  SaveOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
} from '@ant-design/icons'
import usePreventRouteChangeIf from '../../lib/hooks/usePreventRouteChangeIf'

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
  const FORK_RESOURCE_MUTATION = `
    mutation($data: ForkResourceInput!) {
      forkResource(data: $data) {
        id
        slug
        user {
          username
        }
      }
    }
  `
  if (pageContent === undefined) {
    pageContent = ''
  }
  const [editorState, setEditorState] = useState(pageContent)
  const [, savePage] = useMutation(SAVE_PAGE_MUTATION)
  const [, forkResource] = useMutation(FORK_RESOURCE_MUTATION)

  useEffect(() => {
    setEditorState(pageContent || '')
  }, [pageContent])

  const save = async () => {
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
        const forkedResource = result.data.forkResource
        await router.push(
          `/[username]/learn/edit/[resource]/resource-index?username=${forkedResource.user.username}&resource=${forkedResource.slug}`,
          `/${forkedResource.user.username}/learn/edit/${forkedResource.slug}/resource-index`,
          { shallow: true }
        )
      }
    })
    NProgress.done()
  }

  const { getNeighbourSectionSlugs, body } = useSections({
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

  const isSaved = () => pageContent === editorState

  const handleWindowClose = (e: any) => {
    if (!isSaved()) {
      NProgress.done()
      e.preventDefault()
      // TODO: A default message is being shown instead of this, figure out why
      return (e.returnValue =
        'You have unsaved changes - are you sure you wish to close?')
    }
  }

  useEffect(() => {
    if (inEditMode) {
      window.addEventListener('beforeunload', handleWindowClose)
    }

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose)
    }
  })

  usePreventRouteChangeIf({
    shouldPreventRouteChange: !isSaved(),
    onRouteChangePrevented: () =>
      message.error('You have some unsaved changes.', 1),
  })

  if (fetching) return <Skeleton active={true} />

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
    }).then((result) => {
      if (result.error) {
        console.log({ completeSectionError: result.error })
      } else {
        console.log({ result })
      }
    })
    NProgress.done()
  }

  const exitEditMode = async () => {
    const slugs = router.query.slugs as string[]
    const slugsPath = slugs.reduce((a, b) => `${a}/${b}`)
    await router.push(
      `/[username]/learn/[resource]/[...slugs]?username=${username}&resource=${resourceSlug}&slugs=${slugs}`,
      `/${username}/learn/${resourceSlug}/${slugsPath}`,
      { shallow: true }
    )
  }

  const reset = () => {
    setEditorState(pageContent || '')
  }

  const TopActionControls = () => {
    return inEditMode ? (
      <>
        <Space className={'float-left'}>
          <Alert
            message={'You are currently in edit mode.'}
            type={'info'}
            showIcon={true}
          />
          <Button
            type={'primary'}
            size={'large'}
            onClick={() => exitEditMode()}
          >
            Exit
          </Button>
        </Space>
        {!isSaved() && (
          <Space className={'float-right'}>
            <Button type={'primary'} size={'large'} onClick={() => reset()}>
              Reset
            </Button>
            <Alert
              className={'float-right'}
              message={'You have some unsaved changes.'}
              type={'warning'}
              showIcon={true}
            />
          </Space>
        )}
      </>
    ) : (
      <>
        <Button
          className={'float-left'}
          type={'primary'}
          icon={<EditOutlined />}
          onClick={() => fork()}
          disabled={!user}
        >
          Edit
        </Button>
        {!user && (
          <Alert
            className={'float-right'}
            message={
              'Please login to track your progress or edit this resource'
            }
            type={'info'}
            showIcon={true}
          />
        )}
      </>
    )
  }

  const BottomActionControls = () => (
    <div
      className={'text-center bg-component border-0 m-0 p-2'}
      style={{ position: 'sticky', bottom: 0 }}
    >
      <Button
        className={'float-left'}
        disabled={!prevSectionPath}
        onClick={() => goToPreviousSection()}
      >
        <ArrowLeftOutlined />
        Previous
      </Button>
      {inEditMode ? (
        <Button
          type={'primary'}
          onClick={async (e) => await save()}
          icon={<SaveOutlined />}
        >
          Save
        </Button>
      ) : isSectionComplete({
          section: sectionsMap.get(currentSectionId)!,
        }) ? (
        <Button
          type={'primary'}
          className={'bg-success'}
          icon={<CheckOutlined />}
        >
          Completed
        </Button>
      ) : (
        <Button
          type={'primary'}
          onClick={() => completeSection()}
          disabled={editorState === '' || !user}
          icon={<CheckOutlined />}
        >
          Complete
        </Button>
      )}
      <Button
        className={'float-right'}
        disabled={!nextSectionPath}
        onClick={() => goToNextSection()}
      >
        Next
        <ArrowRightOutlined />
      </Button>
    </div>
  )

  return (
    <>
      <TopActionControls />
      <div className={'clearfix'} />

      <MarkdownEditor
        editorState={editorState}
        setEditorState={setEditorState}
        save={save}
        inEditMode={inEditMode}
      />

      <BottomActionControls />
    </>
  )
}
