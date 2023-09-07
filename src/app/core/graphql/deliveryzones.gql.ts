import gql from 'graphql-tag';

export const createDeliveryZone = gql`
  mutation createDeliveryZone(
    $merchantId: ObjectID!
    $input: DeliveryZoneInput!
  ) {
    createDeliveryZone(merchantId: $merchantId, input: $input) {
      _id
    }
  }
`;

export const updateDeliveryZone = gql`
  mutation updateDeliveryZone($input: DeliveryZoneInput!, $id: ObjectID!) {
    updateDeliveryZone(input: $input, id: $id) {
      _id
    }
  }
`;

export const deleteDeliveryZone = gql`
  mutation deleteDeliveryZone($id: ObjectID!) {
    deleteDeliveryZone(id: $id)
  }
`;

export const deliveryZoneAddExpenditure = gql`
  mutation deliveryZoneAddExpenditure(
    $expenditureId: ObjectID!
    $id: ObjectID!
  ) {
    deliveryZoneAddExpenditure(expenditureId: $expenditureId, id: $id) {
      _id
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

export const deliveryZone = gql`
  query deliveryZone($id: ObjectID!) {
    deliveryZone(id: $id) {
      _id
      zona
      type
      amount
      greaterAmount
      lesserAmount
      lesserAmountLimit
      greaterAmountLimit
      expenditure
      createdAt
    }
  }
`;

export const deliveryZones = gql`
  query deliveryZones($paginate: PaginationInput) {
    deliveryZones(paginate: $paginate) {
      _id
      name
      zona
      type
      amount
      greaterAmount
      lesserAmount
      lesserAmountLimit
      greaterAmountLimit
      expenditure
      createdAt
    }
  }
`;

export const incomeTotalDeliveryZoneByMerchant = gql`
  query incomeTotalDeliveryZoneByMerchant(
    $merchantId: ObjectID!
    $range: PaginationRangeInput
  ) {
    incomeTotalDeliveryZoneByMerchant(
      merchantId: $merchantId
      range: $range
    )
  }
`;
