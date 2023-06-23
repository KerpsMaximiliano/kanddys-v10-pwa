import gql from 'graphql-tag';

export const entityTemplate = gql`
  query entityTemplate(
    $id: ObjectID!
    $password: String
    $notificationsToTrigger: [String!]
  ) {
    entityTemplate(
      id: $id
      password: $password
      notificationsToTrigger: $notificationsToTrigger
    ) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        recipient
        edit
      }
      hasPassword
      access
    }
  }
`;

export const entityTemplates = gql`
  query entityTemplates($paginate: PaginationInput) {
    entityTemplates(paginate: $paginate) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        recipient
        edit
      }
      hasPassword
      access
    }
  }
`;

export const entityTemplateRecipient = gql`
  query entityTemplateRecipient(
    $id: ObjectID!
    $notificationsToTrigger: [String!]
  ) {
    entityTemplateRecipient(
      id: $id
      notificationsToTrigger: $notificationsToTrigger
    ) {
      _id
      entity
      reference
      user
      recipients {
        _id
        edit
        recipient
      }
      access
      hasPassword
    }
  }
`;

export const entityTemplateByDateId = gql`
  query entityTemplateByDateId($dateId: String!) {
    entityTemplateByDateId(dateId: $dateId) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        edit
        recipient
      }
    }
  }
`;

export const entityTemplateByReference = gql`
  mutation entityTemplateByReference($reference: ObjectID!, $entity: String!) {
    entityTemplateByReference(reference: $reference, entity: $entity) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        edit
        recipient
      }
    }
  }
`;

export const entityTemplateSetData = gql`
  mutation entityTemplateSetData($id: ObjectID!, $input: EntityTemplateInput!) {
    entityTemplateSetData(id: $id, input: $input) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        edit
        recipient
      }
    }
  }
`;

export const entityTemplateAuthSetData = gql`
  mutation entityTemplateAuthSetData(
    $id: ObjectID!
    $input: EntityTemplateInput!
  ) {
    entityTemplateAuthSetData(id: $id, input: $input) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        edit
        recipient
      }
      access
    }
  }
`;

export const entityTemplateRemoveRecipient = gql`
  mutation entityTemplateRemoveRecipient(
    $idRecipients: ObjectID!
    $entityTemplateId: ObjectID!
  ) {
    entityTemplateRemoveRecipient(
      idRecipients: $idRecipients
      entityTemplateId: $entityTemplateId
    ) {
      _id
      reference
      entity
      status
      recipients {
        recipient
        edit
      }
      access
      dateId
      createdAt
    }
  }
`;

export const entityTemplateUpdateRecipient = gql`
  mutation entityTemplateUpdateRecipient(
    $entityTemplateId: ObjectID!
    $idRecipients: ObjectID!
    $input: RecipientsInput!
  ) {
    entityTemplateUpdateRecipient(
      entityTemplateId: $entityTemplateId
      idRecipients: $idRecipients
      input: $input
    ) {
      _id
      reference
      entity
      status
      recipients {
        _id
        recipient
        edit
      }
      access
      dateId
      createdAt
    }
  }
`;

export const entityTemplateAddRecipient = gql`
  mutation entityTemplateAddRecipient(
    $entityTemplateId: ObjectID!
    $input: RecipientsInput!
  ) {
    entityTemplateAddRecipient(
      entityTemplateId: $entityTemplateId
      input: $input
    ) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        edit
        recipient
      }
    }
  }
`;

export const entityTemplateAddRecipientWithoutAuth = gql`
  mutation entityTemplateAddRecipientWithoutAuth(
    $entityTemplateId: ObjectID!
    $input: RecipientsInput!
  ) {
    entityTemplateAddRecipientWithoutAuth(
      entityTemplateId: $entityTemplateId
      input: $input
    ) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        edit
        recipient
      }
    }
  }
`;

export const createEntityTemplate = gql`
  mutation createEntityTemplate {
    createEntityTemplate {
      _id
      reference
      status
    }
  }
`;

export const createRecipient = gql`
  mutation createRecipient($input: RecipientInput!) {
    createRecipient(input: $input) {
      _id
      email
      phone
      lastName
      user
    }
  }
`;

export const createRecipientWithoutAuth = gql`
  mutation createRecipientWithoutAuth($input: RecipientInput!, $userId: ObjectID!) {
    createRecipientWithoutAuth(input: $input, userId: $userId) {
      _id
      email
      phone
      lastName
      user
    }
  }
`;

export const preCreateEntityTemplate = gql`
  mutation preCreateEntityTemplate {
    preCreateEntityTemplate {
      _id
      reference
      status
    }
  }
`;

export const entityTemplateAddNotification = gql`
  mutation entityTemplateAddNotification(
    $notificationId: ObjectID!
    $merchantId: ObjectID!
    $id: ObjectID!
  ) {
    entityTemplateAddNotification(
      notificationId: $notificationId
      merchantId: $merchantId
      id: $id
    ) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients {
        _id
        edit
        recipient
      }
    }
  }
`;
