import gql from 'graphql-tag';

export const notifications = gql`
  query notifications(
    $paginate: PaginationInput
    $merchantId: ObjectID!
    $notificationId: [ObjectID!]
  ) {
    notifications(
      paginate: $paginate
      merchantId: $merchantId
      notificationId: $notificationId
    ) {
      _id
      message
      entity
      trigger {
        key
        value
      }
      offsetTime {
        quantity
        unit
        hour
      }
    }
  }
`;

export const createNotification = gql`
  mutation createNotification($input: NotificationInput!) {
    createNotification(input: $input) {
      _id
    }
  }
`;

export const itemAddNotification = gql`
  mutation itemAddNotification($notificationId: [ObjectID!]!, $id: ObjectID!) {
    itemAddNotification(notificationId: $notificationId, id: $id) {
      _id
    }
  }
`;
