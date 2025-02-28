import gql from 'graphql-tag';

export const createReservation = gql`
  mutation createReservation($input: ReservationInput!) {
    createReservation(input: $input) {
      _id
    }
  }
`;

export const createReservationAuthLess = gql`
  mutation createReservationAuthLess($input: ReservationInput!) {
    createReservationAuthLess(input: $input) {
      _id
    }
  }
`;

export const updateReservation = gql`
  mutation updateReservation($input: ReservationInput!, $id: ObjectID!) {
    updateReservation(input: $input, id: $id) {
      _id
    }
  }
`;

export const validateExpirableReservation = gql`
  mutation validateExpirableReservation($id: ObjectID!) {
    validateExpirableReservation(id: $id) {
      _id
      status
      createdAt
    }
  }
`;

export const confirmMerchantOrder = gql`
  mutation confirmMerchantOrder($merchantID: ObjectID!, $orderID: ObjectID!) {
    confirmMerchantOrder(merchantID: $merchantID, orderID: $orderID) {
      _id
      orderStatus
    }
  }
`;

export const getReservation = gql`
  query getReservation($id: ObjectID!) {
    getReservation(id: $id) {
      _id
      createdAt
      status
      expiration
      breakTime
      calendar
      date {
        from
        until
        fromHour
        toHour
      }
    }
  }
`;

export const getReservationByCalendar = gql`
  query getReservationByCalendar($paginate: PaginationInput!) {
    getReservationByCalendar(paginate: $paginate) {
      _id
      createdAt
      status
      expiration
      breakTime
      user {
        _id
        name
      }
      date {
        from
        until
        fromHour
        toHour
      }
    }
  }
`;

export const getReservationByMerchant = gql`
  query getReservationByMerchant($merchantId: ObjectID!) {
    getReservationByMerchant(merchantId: $merchantId) {
      _id
      createdAt
      status
      expiration
      breakTime
      calendar
      user {
        _id
        name
      }
      date {
        from
        until
        fromHour
        toHour
      }
    }
  }
`;

export const listReservations = gql`
  query listReservations($params: PaginationInput, $merchantId: ObjectID!) {
    listReservations(params: $params, merchantId: $merchantId) {
      _id
      status
      type
      date {
        dateType
        from
        until
        fromHour
        toHour
      }
    }
  }
`;

export const deleteReservation = gql`
  mutation deleteReservation($id: ObjectID!) {
    deleteReservation(id: $id)
  }
`;

export const reservationSpacesAvailable = gql`
  query reservationSpacesAvailable(
    $until: Date!
    $from: Date
    $calendarId: ObjectID!
  ) {
    reservationSpacesAvailable(
      until: $until
      from: $from
      calendarId: $calendarId
    )
  }
`;
