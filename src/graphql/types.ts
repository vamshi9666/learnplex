export type Maybe<T> = T | null
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any
}

export type Query = {
  __typename?: 'Query'
  me: LoginResponse
  hello: Scalars['String']
  bye: Scalars['String']
  users: Array<User>
  topics: Array<Topic>
  resources: Array<Resource>
  primaryResourceBySlug: Resource
  resourcesByUsername: Array<Resource>
  resourcesByTopic: Array<Resource>
  resource?: Maybe<Resource>
  allResources: Array<Resource>
  allVerifiedResources: Array<Resource>
  baseSection: Section
  sections: Array<Section>
  sectionsList: Array<Section>
  userProgress?: Maybe<Progress>
  userProgressList: Array<Progress>
  hasEnrolled: Scalars['Boolean']
}

export type QueryPrimaryResourceBySlugArgs = {
  resourceSlug: Scalars['String']
}

export type QueryResourcesByUsernameArgs = {
  username: Scalars['String']
}

export type QueryResourcesByTopicArgs = {
  slug: Scalars['String']
}

export type QueryResourceArgs = {
  resourceSlug: Scalars['String']
  username: Scalars['String']
}

export type QueryBaseSectionArgs = {
  resourceSlug: Scalars['String']
  username: Scalars['String']
}

export type QuerySectionsArgs = {
  resourceId: Scalars['String']
}

export type QuerySectionsListArgs = {
  resourceSlug: Scalars['String']
  username: Scalars['String']
}

export type QueryUserProgressArgs = {
  ownerUsername: Scalars['String']
  resourceSlug: Scalars['String']
}

export type QueryHasEnrolledArgs = {
  resourceSlug: Scalars['String']
  username: Scalars['String']
}

export type LoginResponse = {
  __typename?: 'LoginResponse'
  accessToken: Scalars['String']
  user: User
}

export type User = {
  __typename?: 'User'
  id: Scalars['ID']
  name?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
  username: Scalars['String']
  confirmed: Scalars['Boolean']
  roles: Array<UserRole>
  githubId?: Maybe<Scalars['Int']>
  resources: Array<Resource>
  progressList: Array<Progress>
}

export enum UserRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export type Resource = {
  __typename?: 'Resource'
  id: Scalars['ID']
  title: Scalars['String']
  slug: Scalars['String']
  isFork: Scalars['Boolean']
  forkedFrom: User
  forkedVersion?: Maybe<Scalars['Int']>
  forks: Array<Resource>
  baseSection: Section
  user: User
  topic: Topic
  verified: Scalars['Boolean']
  description?: Maybe<Scalars['String']>
  userId: Scalars['Int']
  createdDate: Scalars['DateTime']
  updatedDate: Scalars['DateTime']
  version: Scalars['Int']
  firstPageSlugsPath: Scalars['String']
}

export type Section = {
  __typename?: 'Section'
  id: Scalars['ID']
  title: Scalars['String']
  slug: Scalars['String']
  deleted: Scalars['Boolean']
  isFork: Scalars['Boolean']
  order: Scalars['Int']
  resource?: Maybe<Resource>
  sections: Array<Section>
  parentSection?: Maybe<Section>
  baseSection?: Maybe<Section>
  page?: Maybe<Page>
  createdDate: Scalars['DateTime']
  updatedDate: Scalars['DateTime']
  version: Scalars['Int']
  forkedVersion?: Maybe<Scalars['Int']>
  isPage: Scalars['Boolean']
  hasSubSections: Scalars['Boolean']
  isSection: Scalars['Boolean']
  isBaseSection: Scalars['Boolean']
  isRoot: Scalars['Boolean']
  depth: Scalars['Int']
  isDeleted: Scalars['Boolean']
  filteredSections: Array<Section>
}

export type Page = {
  __typename?: 'Page'
  id: Scalars['ID']
  content: Scalars['String']
  type: PageType
  isFork: Scalars['Boolean']
}

export enum PageType {
  Text = 'TEXT',
  Video = 'VIDEO',
  Link = 'LINK',
  Quiz = 'QUIZ',
}

export type Topic = {
  __typename?: 'Topic'
  id: Scalars['ID']
  title: Scalars['String']
  slug: Scalars['String']
  resources: Array<Resource>
}

export type Progress = {
  __typename?: 'Progress'
  id: Scalars['ID']
  user: User
  completedSections: Array<Section>
  resource: Resource
}

export type Mutation = {
  __typename?: 'Mutation'
  changePassword?: Maybe<LoginResponse>
  confirmUser: Scalars['Boolean']
  forgotPassword: Scalars['Boolean']
  login: LoginResponse
  logout: Scalars['Boolean']
  register: Scalars['Boolean']
  revokeTokensForUser: Scalars['Boolean']
  validateEmail: Scalars['Boolean']
  validateUsername: Scalars['Boolean']
  sendConfirmationMail: Scalars['Boolean']
  createTopic: Topic
  createResource: Resource
  addSection: Section
  makePrimary: Resource
  updateSection: Section
  deleteSection: Scalars['Boolean']
  reorderSections: Section
  savePage: Section
  forkResource?: Maybe<Resource>
  startProgress: Progress
  completeSection?: Maybe<Progress>
  updateResourceDescription: Resource
  updateResourceTitle: Resource
  searchResources: Array<Resource>
  updateUser: Scalars['Boolean']
  updatePassword: Scalars['Boolean']
  updateUserDetailsAsAdmin: Scalars['Boolean']
}

export type MutationChangePasswordArgs = {
  data: ChangePasswordInput
}

export type MutationConfirmUserArgs = {
  token: Scalars['String']
}

export type MutationForgotPasswordArgs = {
  email: Scalars['String']
}

export type MutationLoginArgs = {
  password: Scalars['String']
  email: Scalars['String']
}

export type MutationRegisterArgs = {
  data: RegisterInput
}

export type MutationRevokeTokensForUserArgs = {
  userId: Scalars['Float']
}

export type MutationValidateEmailArgs = {
  email: Scalars['String']
}

export type MutationValidateUsernameArgs = {
  username: Scalars['String']
}

export type MutationSendConfirmationMailArgs = {
  email: Scalars['String']
}

export type MutationCreateTopicArgs = {
  data: CreateTopicInput
}

export type MutationCreateResourceArgs = {
  data: CreateResourceInput
}

export type MutationAddSectionArgs = {
  data: AddSectionInput
}

export type MutationMakePrimaryArgs = {
  resourceId: Scalars['String']
}

export type MutationUpdateSectionArgs = {
  data: UpdateSectionInput
}

export type MutationDeleteSectionArgs = {
  sectionId: Scalars['String']
}

export type MutationReorderSectionsArgs = {
  data: ReorderSectionsInput
}

export type MutationSavePageArgs = {
  data: SavePageInput
}

export type MutationForkResourceArgs = {
  data: ForkResourceInput
}

export type MutationStartProgressArgs = {
  resourceId: Scalars['String']
}

export type MutationCompleteSectionArgs = {
  data: CompleteSectionInput
}

export type MutationUpdateResourceDescriptionArgs = {
  description: Scalars['String']
  resourceSlug: Scalars['String']
}

export type MutationUpdateResourceTitleArgs = {
  title: Scalars['String']
  resourceSlug: Scalars['String']
}

export type MutationSearchResourcesArgs = {
  value: Scalars['String']
}

export type MutationUpdateUserArgs = {
  data: UpdateUserInput
}

export type MutationUpdatePasswordArgs = {
  data: UpdatePasswordInput
}

export type MutationUpdateUserDetailsAsAdminArgs = {
  data: UpdateUserOptionalInput
}

export type ChangePasswordInput = {
  password: Scalars['String']
  token: Scalars['String']
}

export type RegisterInput = {
  password: Scalars['String']
  name: Scalars['String']
  email: Scalars['String']
  username: Scalars['String']
}

export type CreateTopicInput = {
  title: Scalars['String']
}

export type CreateResourceInput = {
  title: Scalars['String']
  topicId: Scalars['String']
  description: Scalars['String']
}

export type AddSectionInput = {
  parentSectionId: Scalars['String']
  title: Scalars['String']
  content?: Maybe<Scalars['String']>
}

export type UpdateSectionInput = {
  sectionId: Scalars['String']
  title: Scalars['String']
}

export type ReorderSectionsInput = {
  parentSectionId: Scalars['String']
  sourceOrder: Scalars['Float']
  destinationOrder: Scalars['Float']
}

export type SavePageInput = {
  sectionId: Scalars['String']
  pageContent: Scalars['String']
}

export type ForkResourceInput = {
  username: Scalars['String']
  resourceSlug: Scalars['String']
}

export type CompleteSectionInput = {
  sectionId: Scalars['String']
}

export type UpdateUserInput = {
  name: Scalars['String']
  email: Scalars['String']
  username: Scalars['String']
}

export type UpdatePasswordInput = {
  password: Scalars['String']
  currentPassword: Scalars['String']
}

export type UpdateUserOptionalInput = {
  name?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
  username?: Maybe<Scalars['String']>
  currentUsername: Scalars['String']
}
