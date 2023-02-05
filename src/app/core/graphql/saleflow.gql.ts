import gql from 'graphql-tag';

export const body = `
  _id
  name
  headline
  banner
  subheadline
  addressExtraInfo
  banner
  itemNickname
  social {
    name
    url
  }
  module {
    _id
    appointment {
      isActive
      calendar {
        _id
      }
    }
    post {
      isActive
      post
    }
    delivery {
      isActive
      deliveryLocation
      pickUpLocations {
        city
        street
        houseNumber
        referencePoint
        nickName
        note
      }
    }
    paymentMethod {
      paymentModule {
        _id
      }
    }
  }
  merchant {
    _id
    name
    slug
    owner {
      _id
      phone
    }
  }
  packages {
    _id
  }
  items {
    item {
      _id
    }
    customizer {
      _id
    }
    index
  }
  workingHours
  paymentInfo
  createdAt
  canBuyMultipleItems
`;

export const saleflow = gql`
  query saleflow($id: ObjectID!) {
    saleflow(id: $id) { ${body} }
  }
`;

export const saleflowDefault = gql`
  query saleflowDefault($merchantId: ObjectID!) {
    saleflowDefault(merchantId: $merchantId) { ${body} }
  }
`;

export const setDefaultSaleflow = gql`
  mutation saleflowSetDefault($merchantId: ObjectID!, $id: ObjectID!) {
    saleflowSetDefault(merchantId: $merchantId, id: $id) {
      _id
      name
      merchant {
        _id
        name
      }
    }
  }
`;

export const hotSaleflow = gql`
  query saleflow($id: ObjectID!) {
    saleflow(id: $id) {
      _id
      name
      banner
      subheadline
      social {
        name
        url
      }
      merchant {
        _id
        name
      }
      packages {
        _id
      }
      items {
        item {
          _id
        }
        customizer {
          _id
        }
        index
      }
      workingHours
    }
  }
`;

export const saleflows = gql`
  query saleflows($merchant: ObjectID, $params: ListParams) {
    saleflows(merchant: $merchant, params: $params) {
      _id
      name
      banner
      items {
        _id
      }
    }
  }
`;

export const addItemToSaleFlow = gql`
  mutation addItemToSaleFlow($item: SaleFlowItemInput!, $id: ObjectID!) {
    addItemToSaleFlow(item: $item, id: $id) {
      _id
    }
  }
`;

export const removeItemFromSaleFlow = gql`
  mutation removeItemFromSaleFlow($item: ObjectID!, $id: ObjectID!) {
    removeItemFromSaleFlow(item: $item, id: $id) {
      _id
    }
  }
`;

export const createSaleflow = gql`
  mutation createSaleflow($input: SaleFlowInput!) {
    createSaleflow(input: $input) {
      _id
    }
  }
`;

export const createSaleFlowModule = gql`
  mutation createSaleFlowModule($input: SaleFlowModuleInput!) {
    createSaleFlowModule(input: $input) {
      _id
    }
  }
`;
export const updateSaleFlowModule = gql`
  mutation updateSaleFlowModule($input: SaleFlowModuleInput!, $id: ObjectID!) {
    updateSaleFlowModule(input: $input, id: $id) {
      _id
    }
  }
`;

export const addLocation = gql`
  mutation addLocation($input: DeliveryLocationInput!) {
    addLocation(input: $input) {
      _id
      googleMapsURL
      city
      street
      houseNumber
      referencePoint
      nickName
      note
    }
  }
`;
export const deleteLocation = gql`
  mutation deleteLocation($locationId: ObjectID!) {
    deleteLocation(locationId: $locationId)
  }
`;

export const listItems = gql`
  query listItems($params: PaginationInput) {
    listItems(params: $params) {
      _id
      content
      name
      pricing
      pricePerUnit
      description
      createdAt
      images {
        _id
        index
        value
      }
      fixedQuantity
      size
      quality
      status
      iconImage
      hasExtraPrice
      showImages
      tags
      visitorCounter {
        entity
        counter
        reference
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
    }
  }
`;

export const hotListItems = gql`
  query listItems($params: PaginationInput) {
    listItems(params: $params) {
      _id
      status
    }
  }
`;

export const listItemPackage = gql`
  query listItemPackage($params: PaginationInput) {
    listItemPackage(params: $params) {
      _id
      name
      images
      price
      categories {
        _id
      }
      description
      packageRules {
        onlyFixedQuantity
        fixedQuantity
        hasMaxQuantity
        maxQuantity
        hasMinQuantity
        minQuantity
        offsetPrice
        item {
          _id
        }
      }
    }
  }
`;

export const updateSaleflow = gql`
  mutation updateSaleflow($input: SaleFlowInput!, $id: ObjectID!) {
    updateSaleflow(input: $input, id: $id) {
      _id
    }
  }
`;
