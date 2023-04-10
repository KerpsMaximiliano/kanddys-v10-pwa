import gql from 'graphql-tag';

const notificationData = `
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
}`;

export const notification = gql`
  query notification($merchantId: ObjectID!, $id: ObjectID!) {
    notification(merchantId: $merchantId, id: $id) { ${notificationData} }
  }
`;

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
    ) { ${notificationData} }
  }
`;

export const updateNotification = gql`
  mutation updateNotification($input: NotificationInput!, $id: ObjectID!) {
    updateNotification(input: $input, id: $id) {
      _id
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

export const orderAddNotification = gql`
  mutation orderAddNotification($notificationId: [ObjectID!]!, $id: ObjectID!) {
    orderAddNotification(notificationId: $notificationId, id: $id) {
      _id
    }
  }
`;

export const notificationCheckers = gql`
  query notificationCheckers($paginate: PaginationInput!) {
    notificationCheckers(paginate: $paginate) {
      _id
      notification { ${notificationData} }
      user {
        _id
        phone
      }
      date
      status
    }
  }
`;

export const addNotificationInTag = gql`
  mutation addNotifificationInTag(
    $merchantId: ObjectID!
    $notificationId: ObjectID!
    $tagId: ObjectID!
  ) {
    addNotifificationInTag: addNotifificationInTag(
      merchantId: $merchantId
      notificationId: $notificationId
      tagId: $tagId
    ) {
      _id
      name
    }
  }
`;