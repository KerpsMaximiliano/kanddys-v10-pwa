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
  slug
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
  address
  owner { 
    phone
    email
    name
    _id
  }
  social {
    name
    url
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
      slug
      showItems
      image
      activity
      bio
      address
      contactFooter
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

export const merchantByName = gql`
  query merchantByName($name: String!) {
    merchantByName(name: $name) { ${body} }
  }
`;

export const merchantBySlug = gql`
  query merchantBySlug($slug: String!) {
    merchantBySlug(slug: $slug) { ${body} }
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

export const entryMerchant = gql`
  mutation entryMerchant(
    $merchantID: ObjectID!
    $merchantInput: MerchantInput
    $userInput: UserInput
  ) {
    entryMerchant(
      merchantID: $merchantID
      merchantInput: $merchantInput
      userInput: $userInput
    )
  }
`;

export const createMerchant2 = gql`
  mutation createMerchant($input: MerchantInput!) {
    createMerchant(input: $input) { ${body} }
  }
`;

export const createMerchantWhatsapp = gql`
  mutation createMerchantWhatsapp($itemId: ObjectID!, $nameMerchant: String!) {
    createMerchantWhatsapp(itemId: $itemId, nameMerchant: $nameMerchant)
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
      images {
        value
        index
        active
      }
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
      answers {
        reference
      }
      user {
        phone
        email
        name
        image
        username
      }
      ocr {
        _id
        platform
      }
      items {
        item {
          _id
          name
          images {
            value
            index
            active
          }
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
      orderStatusDelivery
      status {
        status
        access
      }
      expenditures
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
      orderStatus
      orderStatusDelivery
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
      images {
        value
        index
        active
      }
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

export const viewsMerchants = gql`
  query viewsMerchants($paginate: PaginationInput) {
    viewsMerchants(paginate: $paginate) {
      _id
      merchant {
        _id
      }
      type
      description
      numeration {
        value
      }
      socialMedia {
        name
        url
      }
    }
  }
`;

export const viewsMerchant = gql`
  query viewsMerchant($id: ObjectID!) {
    viewsMerchant(id: $id) {
      _id
      description
      type
      merchant {
        _id
      }
      numeration {
        value
      }
    }
  }
`;

export const buyersByMerchant = gql`
  query buyersByMerchant($paginate: PaginationInput!) {
    buyersByMerchant(paginate: $paginate) {
      _id
      name
      phone
      email
      image
    }
  }
`;

export const hotBuyersByMerchant = gql`
  query buyersByMerchant($paginate: PaginationInput!) {
    buyersByMerchant(paginate: $paginate) {
      _id
    }
  }
`;

export const recurringBuyersByMerchant = gql`
  query recurringBuyersByMerchant($paginate: PaginationInput!) {
    recurringBuyersByMerchant(paginate: $paginate)
  }
`;

export const orderByStatusDelivery = gql`
  query orderByStatusDelivery($merchantId: ObjectID!) {
    orderByStatusDelivery(merchantId: $merchantId)
  }
`;

export const higherIncomeBuyersByMerchant = gql`
  query higherIncomeBuyersByMerchant($paginate: PaginationInput!) {
    higherIncomeBuyersByMerchant(paginate: $paginate)
  }
`;

export const currencyStartByMerchant = gql`
  query currencyStartByMerchant($merchantId: ObjectID!) {
    currencyStartByMerchant(merchantId: $merchantId)
  }
`;

export const merchantFuncionality = gql`
  query merchantFuncionality($merchantId: ObjectID!) {
    merchantFuncionality(merchantId: $merchantId) {
      _id
      merchant
      reward {
        expiryMonth
        expires
        rewardPercentage
        rewardPercentageReferral
        buyersLimit
        amountBuyer
        affiliateLimit
        amountAffiliate
        solidaryLimit
        amountSolidary
      }
      queryPercentage
      minOrder
      maxOrder
      countOrder
      payPlataformFee
      questionDeliveryZone{
        value
      }
    }
  }
`;
