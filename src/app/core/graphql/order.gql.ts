import gql from 'graphql-tag';

const orderData = `
  _id
  dateId
  createdAt
  tags
  userNotifications
  subtotals {
    amount
  }
  merchants {
    _id
  }
  user {
    _id
    phone
    name
    email
  }
  answers {
    reference
  }
  items {
    _id
    deliveryLocation {
      googleMapsURL
      city
      street
      houseNumber
      referencePoint
      nickName
      note
    }
    saleflow{
      _id
      name 
      headline
      subheadline
      banner
      merchant {
        _id
        name
        slug
        owner {
          _id
          phone
        }
      }
      social {
        name
        url
      }
      module {
        paymentMethod{
          paymentModule{
            _id
          }
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
      }
    }
    post {
      _id
    }
    amount
    item {
      _id
      name
      description
      pricing
      images {
        value
        index
        active
      }
      webForms {
        _id
        reference
        active
      }
      hasSelection
      params {
        _id
        name
        values {
          _id
          name
          image
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
    itemExtra {
      _id
      images
      name
    }
    customizer {
      _id
      preview
    }
  }
  orderStatus
  statusDelivery
  itemPackage {
    _id
    name
    images
    price
  }
  ocr {
    _id
    image
    transactionCode
    total
    status
    platform
    from
  }
`;

const preOrderData = `
  _id
  dateId
  createdAt
  tags
  userNotifications
  subtotals {
    amount
  }
  merchants {
    _id
  }
  items {
    _id
    deliveryLocation {
      googleMapsURL
      city
      street
      houseNumber
      referencePoint
      nickName
      note
    }
    saleflow{
      _id
      name 
      headline
      subheadline
      banner
      merchant {
        _id
        name
        owner {
          phone
        }
      }
      social {
        name
        url
      }
      module {
        paymentMethod{
          paymentModule{
            _id
          }
        }
      }
    }
    post {
      _id
    }
    amount
    item {
      _id
      name
      pricing
      images {
        value
        index
        active
      }
      hasSelection
      params {
        _id
        name
        values {
          _id
          name
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
    itemExtra {
      _id
      images
      name
    }
    customizer {
      _id
      preview
    }
  }
  orderStatus
  itemPackage {
    _id
    name
    images
    price
  }
  ocr {
    _id
    image
    transactionCode
    total
    status
    platform
    from
  }
`;

export const toggleUserNotifications = gql`
  mutation toggleUserNotifications($active: Boolean!, $orderId: ObjectID!) {
    toggleUserNotifications(active: $active, orderId: $orderId) {
      _id
      userNotifications
    }
  }
`;

export const authOrder = gql`
  mutation authOrder(
    $orderId: ObjectID!,
    $userId: ObjectID!,
  ) {
    authOrder(userId: $userId, orderId: $orderId) {
      ${orderData}
    }
  }
`;

export const order = gql`
  query order($orderId: ObjectID!) {
    order(orderId: $orderId) {
      ${orderData}
    }
  }
`;

export const orders = gql`
  query orders($pagination: PaginationInput!) {
    orders(pagination: $pagination) {
      orders {
        ${orderData}
      }
    }
  }
`;

export const preOrder = gql`
  query order($orderId: ObjectID!) {
    order(orderId: $orderId) {
      ${preOrderData}
    }
  }
`;

export const orderStatus = gql`
  query order($orderId: ObjectID!) {
    order(orderId: $orderId) {
      orderStatus
    }
  }
`;

export const createOrder = gql`
  mutation createOrder($input: ItemOrderInput!) {
    createOrder(input: $input) {
      _id
    }
  }
`;

export const createPreOrder = gql`
  mutation createPreOrder($input: ItemOrderInput!) {
    createPreOrder(input: $input) {
      _id
    }
  }
`;

export const ordersByUser = gql`
  query ordersByUser($pagination: PaginationInput) {
    ordersByUser(pagination: $pagination) {
      ${orderData}
    }
  }
`;

export const ordersTotal = gql`
  query ordersTotal(
    $status: [String!]!
    $merchantId: ObjectID!
    $orders: [ObjectID!]
    $itemCategoryId: ObjectID
  ) {
    ordersTotal(
      status: $status
      merchantId: $merchantId
      orders: $orders
      itemCategoryId: $itemCategoryId
    )
  }
`;

export const payOrder = gql`
  mutation payOrder(
    $ocr: OCRInput
    $payMode: String
    $orderId: ObjectID!
    $userId: ObjectID!
  ) {
    payOrder(ocr: $ocr, payMode: $payMode, orderId: $orderId, userId: $userId) {
      _id
    }
  }
`;

export const updateTagsInOrder = gql`
  mutation updateTagsInOrder(
    $merchantId: ObjectID!
    $tags: [String!]!
    $orderId: ObjectID!
  ) {
    updateTagsInOrder(merchantId: $merchantId, tags: $tags, orderId: $orderId) {
      _id
      tags
    }
  }
`;

export const ordersByItem = gql`
  query ordersByItem($itemId: ObjectID!) {
    ordersByItem(itemId: $itemId) {
      _id
      items {
        item {
          name
          images {
            value
            index
            active
          }
        }
      }
      subtotals {
        amount
      }
      dateId
      createdAt
    }
  }
`;

export const ordersByItemHot = gql`
  query ordersByItem($paginate: PaginationInput!) {
    ordersByItem(paginate: $paginate) {
      _id
    }
  }
`;

export const createOCR = gql`
  mutation createOCR($input: OCRInput!) {
    createOCR(input: $input) {
      _id
    }
  }
`;

export const createPartialOCR = gql`
  mutation createPartialOCR(
    $subtotal: Float
    $userID: ObjectID
    $merchant: ObjectID!
    $code: String
    $image: Upload!
  ) {
    createPartialOCR(
      subtotal: $subtotal
      userID: $userID
      merchant: $merchant
      code: $code
      image: $image
    ) {
      _id
      image
    }
  }
`;

export const orderSetStatus = gql`
  mutation orderSetStatus($status: String!, $id: ObjectID!) {
    orderSetStatus(status: $status, id: $id) {
      _id
      status {
        status
      }
    }
  }
`;

export const orderSetStatusDelivery = gql`
  mutation orderSetStatusDelivery(
    $orderStatusDelivery: String!
    $id: ObjectID!
  ) {
    orderSetStatusDelivery(orderStatusDelivery: $orderStatusDelivery, id: $id) {
      _id
      orderStatusDelivery
    }
  }
`;
