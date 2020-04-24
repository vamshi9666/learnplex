import Head from 'next/head'
import { FunctionComponent } from 'react'

interface Props {
  title?: string
  description?: string
}

const DEFAULT_DESCRIPTION =
  'A GitHub like collaborative platform that enables Educators across the world to create high quality interactive online learning resources that help people not just learn, but truly  master  any technology and become a Professional Software Engineer'

export const SEO: FunctionComponent<Props> = ({
  title = 'Coderplex',
  description = DEFAULT_DESCRIPTION,
}) => (
  <Head>
    <title>Coderplex - {title}</title>
    <meta name={'description'} content={description} />
  </Head>
)
