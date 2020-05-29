const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include',
  })
  const data = await res.json()

  if (res.status === 500) {
    console.log({ data })
    throw new Error(data.message)
  }
  return data
}

export { fetcher }
