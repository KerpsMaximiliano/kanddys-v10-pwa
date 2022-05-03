import gql from 'graphql-tag';

export const getCalendar = gql`
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
      timeChunkSize

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
    createCalendar: createCalendar(input: $input){      
      _id    
    }  
  }
`;