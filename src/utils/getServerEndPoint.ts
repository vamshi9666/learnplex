export function getServerEndPoint() {
  return process.env.SERVER_ENDPOINT ?? 'http://localhost:4000'
}
