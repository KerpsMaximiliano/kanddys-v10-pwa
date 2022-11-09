import gql from 'graphql-tag';

// export const body = `
//   _id
//   name
//   location
//   email
//   image
//   bio
//   owner {
//     phone
//     email
//     name
//     _id
//   }
//   createdAt
//   updatedAt
//   activity
// `;

export const body = `
  _id
  name
  location
  email
  image
  bio
  title
  default
  image
  activity
  active
  showItems
  owner { 
    phone
    email
    name
    _id
  }
`;

export const bodyWithoutShowItems = `
  _id
  name
  location
  email
  image
  bio
  default
  active
  owner { 
    phone
    email
    name
    _id
  }
  activity
`;

export const myMerchants = gql`
  query merchants($params: ListParams) {
    myMerchants(params: $params) { ${body} }
  }
`;

export const merchants = gql`
  query merchants($input: PaginationInput) {
    merchants(input: $input) { ${body} }
  }
`;

export const merchantDefault = gql`
  query merchantDefault($userId: ObjectID) {
    merchantDefault(userId: $userId) {
      _id
      name
      title
      showItems
      image
      activity
      bio
      owner {
        _id
        phone
      }
      social {
        name
        url
      }
    }
  }
`;

export const merchantDefault2 = gql`
  query merchantDefault($userId: ObjectID) {
    merchantDefault(userId: $userId) {
      _id
      name
      bio
      image
      owner {
        _id
      }
      social {
        name
        url
      }
    }
  }
`;

export const setDefaultMerchant = gql`
  mutation merchantSetDefault($id: ObjectID!) {
    merchantSetDefault(id: $id) {
      _id
      name
    }
  }
`;

export const hotMerchants = gql`
  query merchants($params: ListParams) {
    merchants(params: $params) {
      _id
      name
      owner {
        email
      }
    }
  }
`;

export const merchant = gql`
  query merchant($id: ObjectID!) {
    merchant(id: $id) { ${body} }
  }
`;

export const isMerchant = gql`
  query isMerchant($user: String!) {
    isMerchant(user: $user)
  }
`;

export const hotMerchant = gql`
  query merchant($id: ObjectID!) {
    merchant(id: $id) {
      _id
      name
      activity
    }
  }
`;

export const createMerchant = gql`
  mutation createMerchant($input: MerchantInput!, $files: [Upload!]) {
    createMerchant(input: $input, files: $files) { ${body} }
  }
`;

export const createMerchant2 = gql`
  mutation createMerchant($input: MerchantInput!) {
    createMerchant(input: $input) { ${bodyWithoutShowItems} }
  }
`;

export const updateMerchant = gql`
  mutation updateMerchant($id: ObjectID!, $input: MerchantInput!, $files: [Upload!]) {
    updateMerchant(id: $id, input: $input, files: $files) { ${body} }
  }
`;

export const addMerchant = gql`
  mutation addMerchant($emailOrPhone: String!, $input: MerchantInput!) {
    addMerchant(emailOrPhone: $emailOrPhone, input: $input) {
      _id
    }
  }
`;

export const merchantAuthorize = gql`
  mutation merchantAuthorize($merchantId: ObjectID!) {
    merchantAuthorize(
      merchantId: $merchantId
    ) { ${bodyWithoutShowItems} }
  } 
`;

export const itemsByMerchant = gql`
  query itemsByMerchant($id: ObjectID!) {
    itemsByMerchant(id: $id) {
      _id
      name
      pricing
      description
      createdAt
      images
      status
    }
  }
`;

export const ordersByMerchant = gql`
  query ordersByMerchant($pagination: PaginationInput, $merchant: ObjectID!) {
    ordersByMerchant(pagination: $pagination, merchant: $merchant) {
      _id
      subtotals {
        amount
      }
      user {
        phone
        email
        name
        image
      }
      ocr {
        _id
      }
      items {
        item {
          name
          images
          pricing
          tags
          params {
            _id
            name
            values {
              _id
              name
              price
            }
          }
        }
        params {
          param
          paramValue
        }
        reservation {
          _id
        }
      }
      orderStatus
      status {
        status
        access
      }
      dateId
      createdAt
      tags
    }
  }
`;

export const ordersByMerchantHot = gql`
  query ordersByMerchant($pagination: PaginationInput, $merchant: ObjectID!) {
    ordersByMerchant(pagination: $pagination, merchant: $merchant) {
      _id
    }
  }
`;

export const item = gql`
  query item($id: ObjectID!) {
    item(id: $id) {
      _id
      name
      pricing
      description
      createdAt
      images
      fixedQuantity
      params {
        _id
        name
        values {
          _id
          name
          price
        }
      }
    }
  }
`;

export const createEmployeeContract = gql`
  mutation createEmployeeContract($input: EmployeeContractInput!) {
    createEmployeeContract(input: $input) {
      _id
      user {
        _id
        email
        phone
      }
    }
  }
`;

export const employeeContractByMerchant = gql`
  query employeeContractByMerchant($merchantId: ObjectID!) {
    employeeContractByMerchant(merchantId: $merchantId) {
      _id
      user {
        _id
        email
        name
        phone
      }
    }
  }
`;

export const tagsByMerchant = gql`
  query tagsByMerchant($merchantId: ObjectID!) {
    tagsByMerchant(merchantId: $merchantId)
  }
`;

export const uploadAirtableAttachments = gql`
  mutation uploadAirtableAttachments($files: [Upload!]!) {
    uploadAirtableAttachments(files: $files)
  }
`;

export const uploadDataToClientsAirtable = gql`
  mutation uploadDataToClientsAirtable(
    $merchantId: ObjectID!
    $automation: String!
    $data: JSON!
    $route: String
  ) {
    uploadDataToClientsAirtable(
      merchantId: $merchantId
      automation: $automation
      data: $data
      route: $route
    )
  }
`;

export const usersOrderMerchant = gql`
  query usersOrderMerchant($merchantId: ObjectID!) {
    usersOrderMerchant(merchantId: $merchantId) {
      _id
      name
      phone
      email
      tags
    }
  }
`;

export const incomeMerchant = gql`
  query incomeMerchant($input: PaginationInput) {
    incomeMerchant(input: $input)
  }
`;
