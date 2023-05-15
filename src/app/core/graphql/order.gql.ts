import gql from 'graphql-tag';

const orderData = `
  _id
  dateId
  createdAt
  tags
  userNotifications
  subtotals {
    amount
    type
    item
  }
  merchants {
    _id
  }
  user {
    _id
    phone
    name
    email
    image
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
        image
        bio
        slug
        address
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
  orderStatusDelivery
  statusDelivery
  deliveryZone
  expenditures
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
  deliveryData {
    image
  }
  notifications
`;

const shortOrderData = `
  _id
  dateId
  createdAt
  tags
  userNotifications
  subtotals {
    amount
    type
    item
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
  orderStatus
  orderStatusDelivery
  statusDelivery
  deliveryZone
  expenditures
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
  deliveryData {
    image
  }
  notifications
`;

const preOrderData = `
  _id
  dateId
  createdAt
  tags
  userNotifications
  subtotals {
    amount
    type
    item
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
  notifications
`;

const expenditureData = `
  _id
  createdAt
  type
  name
  description
  amount
  useDate
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

export const orderByDateId = gql`
  query orderByDateId($dateId: String!) {
    orderByDateId(dateId: $dateId) {
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
        type
        item
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

export const expenditure = gql`
  query expenditure($id: ObjectID!) {
    expenditure(id: $id) {
      ${expenditureData}
    }
  }
`;

export const expenditures = gql`
  query expenditures($paginate: PaginationInput!) {
    expenditures(paginate: $paginate) {
      ${expenditureData}
    }
  }
`;

export const createExpenditure = gql`
  mutation createExpenditure(
    $merchantId: ObjectID!
    $input: ExpenditureInput!
  ) {
    createExpenditure(merchantId: $merchantId, input: $input) {
      _id
    }
  }
`;

export const updateExpenditure = gql`
  mutation updateExpenditure($input: ExpenditureInput!, $id: ObjectID!) {
    updateExpenditure(input: $input, id: $id) {
      _id
    }
  }
`;

export const orderAddExpenditure = gql`
  mutation orderAddExpenditure($expenditureId: ObjectID!, $id: ObjectID!) {
    orderAddExpenditure(expenditureId: $expenditureId, id: $id) {
      _id
      expenditures
    }
  }
`;

export const orderRemoveExpenditure = gql`
  mutation orderRemoveExpenditure($expenditureId: ObjectID!, $id: ObjectID!) {
    orderRemoveExpenditure(expenditureId: $expenditureId, id: $id) {
      _id
      expenditures
    }
  }
`;

export const orderBenefits = gql`
  query orderBenefits($id: ObjectID!) {
    orderBenefits(id: $id)
  }
`;

export const orderBenefitsByMerchant = gql`
  query orderBenefitsByMerchant($pagination: PaginationInput) {
    orderBenefitsByMerchant(pagination: $pagination)
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

export const orderByMerchantDelivery = gql`
  query orderByMerchantDelivery($pagination: PaginationInput) {
    orderByMerchantDelivery(pagination: $pagination) {
      ${shortOrderData}
    }
  }
`;

export const hotOrderByMerchantDelivery = gql`
  query orderByMerchantDelivery($pagination: PaginationInput) {
    orderByMerchantDelivery(pagination: $pagination) {
      _id
    }
  }
`;

export const updateOrderDeliveryData = gql`
  mutation updateOrderDeliveryData($input: DeliveryDataInput!, $id: ObjectID!) {
    updateOrderDeliveryData(input: $input, id: $id) {
      _id
      orderStatusDelivery
      deliveryData {
        image
      }
    }
  }
`;

export const orderSetStatusDeliveryWithoutAuth = gql`
  mutation orderSetStatusDeliveryWithoutAuth(
    $orderStatusDelivery: String!
    $id: ObjectID!
  ) {
    orderSetStatusDeliveryWithoutAuth(
      orderStatusDelivery: $orderStatusDelivery
      id: $id
    )
  }
`;

export const orderSetDeliveryZone = gql`
  mutation orderSetDeliveryZone(
    $deliveryZoneId: ObjectID!
    $id: ObjectID!
    $userId: ObjectID
  ) {
    orderSetDeliveryZone(
      userId: $userId
      deliveryZoneId: $deliveryZoneId
      id: $id
    ) {
      _id
    }
  }
`;

export const orderConfirm = gql`
  mutation orderConfirm($merchantId: ObjectID!, $orderId: ObjectID!) {
    orderConfirm(merchantId: $merchantId, orderId: $orderId) {
      _id
    }
  }
`;
