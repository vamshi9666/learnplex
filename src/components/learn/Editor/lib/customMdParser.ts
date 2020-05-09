import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import insert from 'markdown-it-ins'
import markdownItContainer from 'markdown-it-container'
import Token from 'markdown-it/lib/token'

export default function customMdParser() {
  function getYoutubeVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? match[2] : null
  }

  const getYoutubeIframeMarkup = ({ url }: { url: string }) => {
    console.log({ url })
    const videoId = getYoutubeVideoId(url)
    if (!videoId) {
      return ''
    }
    return `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  }

  return new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value
        } catch (__) {}
      }

      return '' // use external default escaping
    },
  })
    .use(insert)
    .use(markdownItContainer, 'youtube', {
      validate: function (params: string) {
        return params.trim().match(/^yt\s*\[(.*)]$/)
      },
      render: function (tokens: Token[], idx: number) {
        if (tokens[idx].type === 'container_youtube_open') {
          const matches = tokens[idx].info.trim().match(/^yt\s*\[(.*)]$/)
          if (matches && matches[1]) {
            return (
              '<div class="text-center video-container">' +
              getYoutubeIframeMarkup({ url: matches[1].trim() }) +
              '</div><div class="text-center font-weight-light text-capitalize">'
            )
          }
          return
        } else if (tokens[idx].type === 'container_youtube_close') {
          return '</div>'
        }
      },
    })
}
