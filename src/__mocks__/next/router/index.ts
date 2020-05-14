jest.mock('next/router', () => ({
  ...(jest.requireActual('next/router') as Object),
  useRouter: jest.fn(),
  default: {
    ...jest.requireActual('next/router').default,
    push: jest.fn(),
    replace: jest.fn(),
  },
}))

module.exports = jest.requireMock('next/router')

export {}
