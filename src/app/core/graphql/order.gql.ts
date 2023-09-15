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
  receiverData {
    receiver
    receiverPhoneNumber
    sender
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
        secondaryContacts
        receiveNotificationsMainPhone
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
  metadata {
    files
    description
  }
  identification
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
        secondaryContacts
        receiveNotificationsMainPhone
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
  typeCustom{
    _id
    value
  }
  activeDate{
    from
    month
  }
`;

const incomeData = `
  _id
  createdAt
  type{
    _id
    createdAt
    value
    table
    field
  }
  name
  description
  amount
  useDate
  subType
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

export const orderPaginate = gql`
  query orderPaginate($pagination: PaginationInput!) {
    orderPaginate(pagination: $pagination) {
      ${orderData}
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

export const ordersByUserSearchParam = gql`
  query ordersByUserSearchParam(
    $merchantId: ObjectID!
    $paginationOptionsInput: PaginationOptionsInput
    $search: String
    ) {
    ordersByUserSearchParam(
      paginationOptionsInput: $paginationOptionsInput
      merchantId: $merchantId
      search: $search
      )
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
    $setting: PayOrderSettingInput
    $ocr: OCRInput
    $payMode: String
    $orderId: ObjectID!
    $userId: ObjectID!
  ) {
    payOrder(setting: $setting, ocr: $ocr, payMode: $payMode, orderId: $orderId, userId: $userId) {
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
  query ordersByItem($paginate: PaginationInput!) {
    ordersByItem(paginate: $paginate) {
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
      user {
        image
        username
        phone
        email
        name
      }
      dateId
      createdAt
      orderStatusDelivery
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
      type
      useDate
      name
      amount
      description
      activeDate {
        from
        month
      }
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

export const incomes = gql`
  query incomes($pagination: PaginationInput) {
    incomes(paginate: $pagination) {
      ${incomeData}
    }
  }
`;

export const expendituresTotal = gql`
  query expendituresTotal(
    $type: String!
    $merchantId: ObjectID!
    $typeCustomId: ObjectID!
    $range: PaginationRangeInput
  ) {
    expendituresTotal(
      type: $type
      merchantId: $merchantId
      typeCustomId: $typeCustomId
      range: $range
    )
  }
`;

export const expenditureTypesCustom = gql`
  query expenditureTypesCustom($merchantId: ObjectID!) {
    expenditureTypesCustom(merchantId: $merchantId) {
      _id
      value
      merchant
      field
    }
  }
`;

export const expendituresTotalByTypeConstant = gql`
  query expendituresTotalByTypeConstant($activeDateRange: ExpenditureActiveDateRangeInput, $paginate: PaginationInput) {
    expendituresTotalByTypeConstant(activeDateRange: $activeDateRange, paginate: $paginate)
  }
`;

export const itemRemoveExpenditure = gql`
  mutation itemRemoveExpenditure($id: ObjectID!, $webformId: ObjectID!) {
    itemRemoveExpenditure(merchantId: $merchantId, webformId: $webformId) {
      _id
    }
  }
`;

export const deleteExpenditure = gql`
  mutation deleteExpenditure($id: ObjectID!) {
    deleteExpenditure(id: $id)
  }
`;

export const expendituresTotalById = gql`
  query expendituresTotalById(
    $range: PaginationRangeInput
    $id: ObjectID
    $type: String!
    $merchantId: ObjectID
  ) {
    expendituresTotalById(
      range: $range
      id: $id
      type: $type
      merchantId: $merchantId
    )
  }
`;

export const answerIncomeTotal = gql`
  query answerIncomeTotal($webformId: ObjectID!) {
    answerIncomeTotal(webformId: $webformId)
  }
`;

export const incomeTypes = gql`
  query incomeTypes($merchantId: ObjectID!) {
    incomeTypes(merchantId: $merchantId) {
      _id
      value
      table
      merchant
    }
  }
`;

export const incomeTotalByType = gql`
  query incomeTotalByType(
    $range: PaginationRangeInput
    $subType: String!
    $merchantId: ObjectID!
    $typeId: ObjectID!
  ) {
    incomeTotalByType(
      range: $range
      subType: $subType
      merchantId: $merchantId
      typeId: $typeId
    )
  }
`;

export const ordersIncomeMerchantByUser = gql`
  query ordersIncomeMerchantByUser($userId: [ObjectID!]!,$merchantId:ObjectID!) {
    ordersIncomeMerchantByUser(userId:$userId,merchantId:$merchantId)
   }
`;

export const createOrderExternal = gql`
  mutation createOrderExternal($input: ItemOrderExternalInput!) {
    createOrderExternal(input: $input) {
      _id
    }
  }
`;

export const orderQuantityOfFiltersStatusDelivery = gql`
  query orderQuantityOfFiltersStatusDelivery($pagination: PaginationInput) {
    orderQuantityOfFiltersStatusDelivery(pagination: $pagination)
  }
`;

export const orderQuantityOfFiltersDeliveryZone = gql`
  query orderQuantityOfFiltersDeliveryZone($pagination: PaginationInput) {
    orderQuantityOfFiltersDeliveryZone(pagination: $pagination)
  }
`;

export const orderQuantityOfFiltersShippingType = gql`
  query orderQuantityOfFiltersShippingType($pagination: PaginationInput) {
    orderQuantityOfFiltersShippingType(pagination: $pagination)
  }
`;

export const orderPaginate = gql`
   query orderPaginate($pagination: PaginationInput) {
    orderPaginate(pagination: $pagination) {
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
      orderType
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

export const updateOrderExternal = gql`
  mutation updateOrderExternal($input: ItemOrderExternalInput!, $id: ObjectID!) {
    updateOrderExternal(input: $input, id: $id) {
      _id
    }
  }
`;