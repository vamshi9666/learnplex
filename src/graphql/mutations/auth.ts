import { client } from '../../utils/urqlClient'

export async function login({
  usernameOrEmail,
  password,
}: {
  usernameOrEmail: string
  password: string
}) {
  const LOGIN_MUTATION = `
    mutation($usernameOrEmail: String!, $password: String!) {
      login(usernameOrEmail: $usernameOrEmail, password: $password) {
        accessToken
        user {
          name
          email
          username
          roles
          confirmed
          disabledOrConfirmed
        }
      }
    }
  `
  const result = await client
    .mutation(LOGIN_MUTATION, {
      usernameOrEmail,
      password,
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.login
}

export async function register({
  name,
  email,
  username,
  password,
}: {
  name: string
  email: string
  username: string
  password: string
}) {
  const REGISTER_MUTATION = `
    mutation($data: RegisterInput!) {
      register(data: $data) {
        accessToken
        user {
          name
          email
          username
          roles
          confirmed
          disabledOrConfirmed
        }
      }
    }
  `
  const result = await client
    .mutation(REGISTER_MUTATION, {
      data: {
        name,
        email,
        username,
        password,
      },
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.register
}

export async function validateUsername({ username }: { username: string }) {
  const VALIDATE_USERNAME_MUTATION = `
    mutation($username: String!) {
      validateUsername(username: $username)
    }
  `
  const result = await client
    .mutation(VALIDATE_USERNAME_MUTATION, {
      username,
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.validateUsername
}

export async function validateEmail({ email }: { email: string }) {
  const VALIDATE_EMAIL_MUTATION = `
    mutation($email: String!) {
      validateEmail(email: $email)
    }
  `
  const result = await client
    .mutation(VALIDATE_EMAIL_MUTATION, {
      email,
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.validateEmail
}

export async function updateUser({
  name,
  email,
  username,
}: {
  name: string
  email: string
  username: string
}) {
  const UPDATE_USER_MUTATION = `
    mutation($data: UpdateUserInput!) {
      updateUser(data: $data)
    }
  `
  const result = await client
    .mutation(UPDATE_USER_MUTATION, {
      data: {
        name,
        email,
        username,
      },
    })
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.updateUser
}

export async function updatePassword({
  password,
  currentPassword,
}: {
  password: string
  currentPassword: string
}) {
  const UPDATE_PASSWORD_MUTATION = `
    mutation($data: UpdatePasswordInput!) {
      updatePassword(data: $data)
    }
  `
  const result = await client
    .mutation(UPDATE_PASSWORD_MUTATION, {
      data: {
        password,
        currentPassword,
      },
    })
    .toPromise()

  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.updatePassword
}

export async function resendVerificationEmail() {
  const RESEND_VERIFICATION_EMAIL_MUTATION = `
    mutation {
      resendConfirmationEmail
    }
  `
  const result = await client
    .mutation(RESEND_VERIFICATION_EMAIL_MUTATION)
    .toPromise()
  if (result.error) {
    return {
      error: true,
      message: result.error.message,
    }
  }
  return result.data.resendConfirmationEmail
}
