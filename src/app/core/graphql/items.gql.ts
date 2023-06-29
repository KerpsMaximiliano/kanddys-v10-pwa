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
  images {
    value
    index
    active
  }
  fixedQuantity
  size
  quality
  iconImage
  hasExtraPrice
  status
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

const fullItem = `
  _id
  name
  pricing
  pricePerUnit
  description
  createdAt
  amountMerchantCoin
  stock
  images {
    _id
    active
    value
    original
    index
  }
  fixedQuantity
  size
  quality
  iconImage
  hasExtraPrice
  content
  hasSelection
  status
  showImages
  notifications
  tags
  visitorCounter {
    entity
    counter
    reference
  }
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
    category
    formType
    values {
      _id
      name
      price
      description
      image
      quantity
    }
  }
  itemExtra {
    _id
    images
    name
    active
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
  webForms {
    _id
    reference
    active
  }
  active
`;

export const items = gql`
  query items($merchantId: ObjectID, $params: ListParams) {
    items(merchantId: $merchantId, params: $params) { ${body} }
  }
`;

export const itemsByMerchant = gql`
  query itemsByMerchant($id: ObjectID, $sort: Boolean) {
    itemsByMerchant(id: $id, sort: $sort) {
      _id
      name
      images {
        value
        index
        active
      }
      notifications
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
      featuredImage
      pricing
      status
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
  query bestSellersByMerchant(
    $isObjectID: Boolean
    $paginate: PaginationInput!
  ) {
    bestSellersByMerchant(isObjectID: $isObjectID, paginate: $paginate)
  }
`;

export const totalByItem = gql`
  query totalByItem($itemId: [ObjectID!], $merchantId: ObjectID!) {
    totalByItem(itemId: $itemId, merchantId: $merchantId)
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
    item(id: $id) { ${fullItem} }
  }
`;

export const authItem = gql`
  mutation authItem($merchantId: ObjectID!, $id: ObjectID!) {
    authItem(merchantId: $merchantId, id: $id) {
      _id
      merchant {
        _id
        name
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
      images {
        _id
        value
        index
        active
      }
      merchant {
        _id
      }
      pricing
      category {
        _id
        name
      }
      tags
      webForms {
        _id
        createdAt
        updatedAt
        reference
        active
      }
      status
      visitorCounter {
        counter
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
    createItem(input: $input) { ${fullItem} }
  }
`;

export const duplicateItem = gql`
  mutation duplicateItem($id: ObjectID!) {
    duplicateItem(id: $id) {
      _id
    }
  }
`;

export const createItemParam = gql`
  mutation createItemParam(
    $merchantId: ObjectID!
    $itemId: ObjectID!
    $input: ItemParamInput!
  ) {
    createItemParam(merchantId: $merchantId, itemId: $itemId, input: $input) {
      _id
    }
  }
`;

export const addItemParamValue = gql`
  mutation addItemParamValue(
    $itemParamId: ObjectID!
    $merchantId: ObjectID!
    $itemId: ObjectID!
    $input: [ItemParamValueInput!]!
  ) {
    addItemParamValue(
      itemParamId: $itemParamId
      merchantId: $merchantId
      itemId: $itemId
      input: $input
    ) {
      _id
    }
  }
`;

export const deleteItemParamValue = gql`
  mutation deleteItemParamValue(
    $itemParamValueId: ObjectID!
    $itemParamId: ObjectID!
    $merchantId: ObjectID!
    $itemId: ObjectID!
  ) {
    deleteItemParamValue(
      itemParamValueId: $itemParamValueId
      itemParamId: $itemParamId
      merchantId: $merchantId
      itemId: $itemId
    ) {
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

export const deleteItem = gql`
  mutation deleteItem($id: ObjectID!) {
    deleteItem(id: $id)
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

export const itemAddImage = gql`
  mutation itemAddImage($input: [ItemImageInput!]!, $id: ObjectID!) {
    itemAddImage(input: $input, id: $id) {
      _id
      name
      pricing
      pricePerUnit
      description
      createdAt
      images {
        _id
        value
        index
        original
        active
      }
      fixedQuantity
      size
      quality
      iconImage
      hasExtraPrice
      content
      hasSelection
      status
      showImages
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
        active
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

export const itemRemoveImage = gql`
  mutation itemRemoveImage($imageId: [ObjectID!]!, $itemId: ObjectID!) {
    itemRemoveImage(imageId: $imageId, itemId: $itemId) {
      _id
      name
      pricing
      pricePerUnit
      description
      createdAt
      images {
        value
        index
        active
      }
      fixedQuantity
      size
      quality
      iconImage
      hasExtraPrice
      content
      hasSelection
      status
      showImages
      calendar {
        _id
      }
      category {
        _id
        name
        active
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
        active
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

export const itemUpdateImage = gql`
  mutation itemUpdateImage($input: ItemImageInput!, $imageId: ObjectID!, $id: ObjectID!) {
    itemUpdateImage(input: $input, imageId: $imageId, id: $id) { ${fullItem} }
  }
`;

export const itemCategory = gql`
  query itemCategory($id: ObjectID!) {
    itemCategory(id: $id) {
      merchant {
        _id
      }
      _id
      name
      description
      active
    }
  }
`;

export const itemCategoriesList = gql`
  query itemCategoriesList($merchantId: ObjectID, $params: PaginationInput) {
    itemCategoriesList(merchantId: $merchantId, params: $params) {
      _id
      name
      description
      active
    }
  }
`;

export const createItemCategory = gql`
  mutation createItemCategory($input: ItemCategoryInput!) {
    createItemCategory(input: $input) {
      merchant {
        _id
      }
      _id
      name
      active
    }
  }
`;

export const updateItemCategory = gql`
  mutation updateItemCategory($input: ItemCategoryInput!, $id: ObjectID!) {
    updateItemCategory(input: $input, id: $id) {
      merchant {
        _id
      }
      _id
      name
      active
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

export const itemsArchived = gql`
  query itemsArchived($params: PaginationInput) {
    itemsArchived(params: $params) {
      _id
    }
  }
`;

export const itemTotalPagination = gql`
  query itemTotalPagination($paginate: PaginationInput) {
    itemTotalPagination(paginate: $paginate)
  }
`;

export const itemsByMerchantNosale = gql`
  query itemsByMerchantNosale($paginate: PaginationInput) {
    itemsByMerchantNosale(paginate: $paginate) {
      _id
      name
      description
      images {
        value
        index
        active
      }
      notifications
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
      featuredImage
      pricing
      status
      visitorCounter {
        entity
        counter
        reference
      }
    }
  }
`;
