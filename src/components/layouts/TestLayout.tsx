import { getSiteLayout } from './SiteLayout'

export function TestLayout({ children }: { children: any }) {
  return <div style={{ background: 'yellow' }}>{children}</div>
}

TestLayout.getLayout = (page: any) =>
  getSiteLayout(<TestLayout>{page}</TestLayout>)

/*
      Usage in the pages to use this layout
      TestPage.getLayout = TestLayout.getLayout
 */
