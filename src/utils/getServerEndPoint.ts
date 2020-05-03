export function getServerEndPoint() {
  return process.env.NODE_ENV === 'production'
    ? (process.env.SERVER_ENDPOINT as string) ?? 'http://localhost:4000'
    : 'http://localhost:4000'
}
