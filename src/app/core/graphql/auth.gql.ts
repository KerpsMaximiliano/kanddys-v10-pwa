import gql from 'graphql-tag';

const user = `
  _id
  email
  phone
  name
  birthdate
  image

  validatedAt
  deliveryLocations{
    _id
    googleMapsURL
    city
    street
    houseNumber
    note
  }
`;
const sessionBody = `
  token
  expiredAt
  info
  user { ${user} }
`;

export const me = gql`
  query {
    me { ${user} }
  }
`;

export const userExists = gql`
  query userExists($emailOrPhone: String!) {
    exists: userExists(emailOrPhone: $emailOrPhone)
  }
`;

export const updateme = gql`
  mutation updateme($input: UserInput!) {
    me: updateme(input: $input) { ${user} }
  }
`;

export const refresh = gql`
  mutation {
    session: refresh { ${sessionBody} }
  }
`;

export const generateMagicLink = gql`
  mutation generateMagicLink(
    $phoneNumber: String!,
    $redirectionRoute: String!,
    $redirectionRouteId: String!,
    $entity: String!,
    $redirectionRouteQueryParams: JSON
  ) {
    generateMagicLink(
      phoneNumber: $phoneNumber, 
      redirectionRoute: $redirectionRoute, 
      redirectionRouteId: $redirectionRouteId, 
      entity: $entity,
      redirectionRouteQueryParams: $redirectionRouteQueryParams
    )
  }
`;

export const analizeMagicLink = gql`
  query analizeMagicLink($tempcode: String!) {
    analizeMagicLink(tempcode: $tempcode) 
  }
`;

export const signin = gql`
  mutation signin($emailOrPhone: String!, $password: String!) {
    session: signin(emailOrPhone: $emailOrPhone, password: $password) { ${sessionBody} }
  }
`;

export const signup = gql`
  mutation signup($input: UserInput!,$notificationMethod:String!, $code: String) {
    user: signup(input: $input,notificationMethod:$notificationMethod, assignPassword: false, code: $code) { ${user} }
  }
`;

export const verifyUser = gql`
  mutation verifyUser($code: String!, $userId: ObjectID!) {
    session: vefiryUser(code: $code, userId: $userId) { ${sessionBody} }
  }
`;

export const signupSocial = gql`
  mutation signupSocial($token: String!, $social: String!) {
    session: signupSocial(token: $token, social: $social) { ${sessionBody} }
  }
`;

export const signout = gql`
  mutation signout($all: Boolean) {
    success: signout(all: $all)
  }
`;

export const checkUser = gql`
  query checkUser($emailOrPhone: String!,$notificationMethod:String) {
    checkUser(emailOrPhone: $emailOrPhone,notificationMethod:$notificationMethod) { ${user} }
  }
`;

export const userData = gql`
  query user($_id: ObjectID!) {
    user: user(id: $_id) { ${user} }
  }
`;

export const generateOTP = gql`
  query generateOTP($emailOrPhone: String!) {
    generateOTPData: generateOTP(emailOrPhone: $emailOrPhone) { ${user} }
  }
`;

export const signinSocial = gql`
  mutation signinSocial($input: SignInTokenInput!) {
    signinSocial: signinSocial(input: $input) {
      _id
      user {
        _id
        email
        phone
        name
        birthdate
        image
        defaultCommunity {
          _id
          name
          kindcode
        }
        validatedAt
        deliveryLocations {
          _id
          googleMapsURL
          city
          street
          houseNumber
          note
        }
      }
      token
      remember
      expiredAt
      createdAt
      updatedAt
    }
  }
`;
export const simplifySignup = gql`
  mutation simplifySignup($emailOrPhone: String!, $notificationMethod: String) {
    simplifySignup(
      emailOrPhone: $emailOrPhone
      notificationMethod: $notificationMethod
    )
  }
`;

export const getTempCodeData = gql`
  query getTempCodeData($token: String!) {
    getTempCodeData(token: $token) {
      metadata
    }
  }
`;
