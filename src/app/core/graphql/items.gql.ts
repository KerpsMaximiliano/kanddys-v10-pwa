import gql from 'graphql-tag';

const body = `
  _id
  name
  image
  description
  purchaseLocations
  merchant {
    _id
    name
    location
    email
    image
    bio
  }
  category { name, description }
  createdAt
  updatedAt
`;

const itemBody = `
  _id
  name
  pricing
  pricePerUnit
  description
  createdAt
  images
  fixedQuantity
  size
  quality
  iconImage
  hasExtraPrice
  category {
    _id
    name
  }
  params {
    _id
    name
    values {
      _id
      name
      price
      image
      quantity
    }
  }
  itemExtra {
    _id
  }
`;

export const items = gql`
  query items($merchantId: ObjectID, $params: ListParams) {
    items(merchantId: $merchantId, params: $params) { ${body} }
  }
`;

export const itemsByMerchant = gql`
  query itemsByMerchant($id: ObjectID) {
    itemsByMerchant(id: $id) {
      _id
      name
      images
      category {
        _id
        name
      }
      featuredImage
      pricing
    }
  }
`;

export const itemsByCategory = gql`
  query itemsByCategory($saleflowID: ObjectID, $params: PaginationInput, $categoryID: ObjectID!) {
    itemsByCategory(saleflowID: $saleflowID, params: $params, categoryID: $categoryID) {
      ${itemBody}
    }
  }
`;

export const bestSellersByMerchant = gql`
  query bestSellersByMerchant($limit: Int, $merchantID: ObjectID!) {
    bestSellersByMerchant(limit: $limit, merchantID: $merchantID)
  }
`;

export const itemExtraByMerchant = gql`
  query itemExtraByMerchant($merchantId: ObjectID!) {
    itemExtraByMerchant(merchantId: $merchantId) {
      _id
      name
      images
      categories {
        _id
      }
    }
  }
`;

export const item = gql`
  query item($id: ObjectID!) {
    item(id: $id) {
      _id
      name
      pricing
      pricePerUnit
      description
      createdAt
      images
      fixedQuantity
      size
      quality
      iconImage
      hasExtraPrice
      content
      hasSelection
      status
      calendar {
        _id
      }
      category {
        _id
        name
      }
      params {
        _id
        name
        values {
          _id
          name
          price
          image
          quantity
        }
      }
      itemExtra {
        _id
        images
        name
        isActive
        createdAt
      }
      merchant {
        _id
        name
        owner {
          _id
          phone
        }
      }
    }
  }
`;

export const itemPackageByMerchant = gql`
  query itemPackageByMerchant($merchant: ObjectID!) {
    itemPackageByMerchant(merchant: $merchant) {
      _id
      createdAt
      name
      images

      merchant {
        _id
      }
      price
      categories {
        _id
        name
      }
    }
  }
`;
export const listItems = gql`
  query listItems($params: PaginationInput) {
    listItems(params: $params) {
      _id
      createdAt
      name
      images
      merchant {
        _id
      }
      pricing
      category {
        _id
        name
      }
    }
  }
`;
export const listItemPackage = gql`
  query listItemPackage($params: PaginationInput) {
    listItemPackage(params: $params) {
      _id
      createdAt
      name
      images

      merchant {
        _id
      }
      price
      categories {
        _id
        name
      }
    }
  }
`;

export const itemPackage = gql`
  query itemPackage($id: ObjectID!) {
    itemPackage(id: $id) {
      _id
      name
      images
      price
      description
      packageRules {
        item {
          _id
        }
        fixedQuantity
        maxQuantity
        minQuantity
      }
    }
  }
`;

export const createItem = gql`
  mutation createItem($input: ItemInput!) {
    createItem(input: $input) {
      _id
    }
  }
`;

export const createPreItem = gql`
  mutation createPreItem($input: ItemInput!) {
    createPreItem(input: $input) {
      _id
    }
  }
`;

export const createItemPackage = gql`
  mutation createItemPackage($input: ItemPackageInput!) {
    createItemPackage(input: $input) {
      _id
    }
  }
`;

export const addItem = gql`
  mutation addItem($input: ItemInput!) {
    addItem(input: $input) {
      _id
    }
  }
`;

export const updateItem = gql`
  mutation updateItem($id: ObjectID!, $input: ItemInput!) {
    updateItem(id: $id, input: $input) {
      _id
      status
    }
  }
`;

export const itemCategoriesList = gql`
  query itemCategoriesList($merchantId: ObjectID, $params: PaginationInput) {
    itemCategoriesList(merchantId: $merchantId, params: $params) {
      _id
      name
      description
    }
  }
`;

export const createItemCategory = gql`
  mutation createItemCategory($input: ItemCategoryInput!) {
    createItemCategory(input: $input) {
      merchant {
        _id
      }
      name
    }
  }
`;

export const deleteItemCategory = gql`
  mutation deleteItemCategory($id: ObjectID!) {
    deleteItemCategory(id: $id)
  }
`;

export const itemextra = gql`
  query itemextra($id: ObjectID!) {
    itemextra(id: $id) {
      _id
      name
      images
    }
  }
`;

export const itemExtras = gql`
  query itemExtras($params: PaginationInput) {
    itemExtras(params: $params) {
      results
    }
  }
`;

export const itemCategoryHeadlineByMerchant = gql`
  query itemCategoryHeadlineByMerchant($merchant: ObjectID!) {
    itemCategoryHeadlineByMerchant(merchant: $merchant) {
      _id
      headline
      itemsCategories
    }
  }
`;
