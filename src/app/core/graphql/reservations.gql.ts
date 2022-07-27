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

export const validateExpirableReservation  = gql`
  mutation validateExpirableReservation ($id: ObjectID!) {
    validateExpirableReservation (id: $id) {
      _id
      status
      createdAt
    }
  }
`;

export const confirmMerchantOrder  = gql`
  mutation confirmMerchantOrder ($merchantID: ObjectID!, $orderID: ObjectID!) {
    confirmMerchantOrder (merchantID: $merchantID, orderID: $orderID) {
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
      calendar{
        _id
      }
      date{
        from
        until
        fromHour
        toHour
      }
    }
  }
`;

export const getReservationByCalendar = gql`
  query getReservationByCalendar($calendarId: ObjectID!) {
    getReservationByCalendar(calendarId: $calendarId) {
      _id
      createdAt
      status
      expiration
      breakTime
      calendar{
        _id
      }
      date{
        from
        until
        fromHour
        toHour
      }
    }
  }
`;

export const listReservations = gql`
  query listReservations($params: PaginationInput, $merchantId: ObjectID!){
    listReservations(params: $params, merchantId: $merchantId){
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
