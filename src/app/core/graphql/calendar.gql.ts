import gql from 'graphql-tag';

export const getCalendar = gql`
  query getCalendar($id: ObjectID!) {
    getCalendar(id: $id) {
      _id
      name
      reservationLimits
      expirationTime
      breakTime
      merchant
      limits {
        dateType
        fromDay
        toDay
        inDays
        fromHour
        toHour
      }
      timeChunkSize
      mode
      active
      reservations {
        reservation
        date {
          dateType
          from
          until
          fromHour
          toHour
        }
      }
    }
  }
`;

export const getCalendarWithMerchantInfo = gql`
  query getCalendar($id: ObjectID!) {
    getCalendar(id: $id) {
      _id
      name
      reservationLimits
      expirationTime
      limits {
        dateType
        fromDay
        toDay
        fromHour
        toHour
      }
      merchant {
        _id
        name
        owner {
          _id
          name
          phone
          email
        }
      }
      timeChunkSize
      mode
      active
      reservations {
        reservation
        date {
          dateType
          from
          until
          fromHour
          toHour
        }
      }
    }
  }
`;

export const getCalendarsByMerchant = gql`
  query getCalendarsByMerchant($merchant: ObjectID!) {
    getCalendarsByMerchant(merchant: $merchant) {
      _id
      name
      reservationLimits
      expirationTime
      breakTime
      limits {
        dateType
        fromDay
        toDay
        inDays
        fromHour
        toHour
      }
      timeChunkSize
      mode
      active
      reservations {
        reservation
        date {
          dateType
          from
          until
          fromHour
          toHour
        }
      }
    }
  }
`;

export const identifyCalendarAdmin = gql`
  mutation identifyCalendarAdmin($id: ObjectID!) {
    Boolean: identifyCalendarAdmin(id: $id)
  }
`;

export const createCalendar = gql`
  mutation createCalendar($input: CalendarInput!) {
    createCalendar: createCalendar(input: $input) {
      _id
    }
  }
`;
