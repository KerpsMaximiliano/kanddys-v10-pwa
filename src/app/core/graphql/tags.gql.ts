import gql from 'graphql-tag';

export const updateTag = gql`
  mutation updateTag($input: TagInput!, $tagId: ObjectID!) {
    updateTag(input: $input, tagId: $tagId) {
      name
      _id
    }
  }
`;

export const createTag = gql`
  mutation createTag($input: TagInput!) {
    createTag(input: $input) {
      _id
    }
  }
`;

export const tagsByUser = gql`
  query tagsByUser($paginate: PaginationInput) {
    tagsByUser(paginate: $paginate) {
      _id
      name
      images
      status
    }
  }
`;

export const tagsByMerchant = gql`
  query tagsByMerchant($merchantId: ObjectID!) {
    tagsByMerchant(merchantId: $merchantId)
  }
`;

export const addTagsInOrder = gql`
  mutation addTagsInOrder(
    $merchantId: ObjectID!
    $tagId: ObjectID!
    $orderId: ObjectID!
  ) {
    addTagsInOrder(merchantId: $merchantId, tagId: $tagId, orderId: $orderId) {
      _id
      tags
    }
  }
`;

export const itemAddTag = gql`
  mutation itemAddTag($tagId: ObjectID!, $id: ObjectID!) {
    itemAddTag(tagId: $tagId, id: $id) {
      _id
      tags
    }
  }
`;

export const itemRemoveTag = gql`
  mutation itemRemoveTag($tagId: ObjectID!, $id: ObjectID!) {
    itemRemoveTag(tagId: $tagId, id: $id) {
      _id
      tags
    }
  }
`;

export const removeTagsInOrder = gql`
  mutation removeTagsInOrder(
    $merchantId: ObjectID!
    $tagId: ObjectID!
    $orderId: ObjectID!
  ) {
    removeTagsInOrder(
      merchantId: $merchantId
      tagId: $tagId
      orderId: $orderId
    ) {
      _id
      tags
    }
  }
`;
export const addTagsInUserOrder = gql`
  mutation addTagsInUserOrder($tagId: ObjectID!, $orderId: ObjectID!) {
    addTagsInUserOrder(tagId: $tagId, orderId: $orderId) {
      _id
      tags
    }
  }
`;

export const removeTagsInUserOrder = gql`
  mutation removeTagsInUserOrder($tagId: ObjectID!, $orderId: ObjectID!) {
    removeTagsInUserOrder(tagId: $tagId, orderId: $orderId) {
      _id
      tags
    }
  }
`;

export const addTagContainersPublic = gql`
  mutation addTagContainersPublic(
    $input: TagContainersInput!
    $tagId: ObjectID!
  ) {
    addTagContainersPublic(input: $input, tagId: $tagId) {
      phone
    }
  }
`;

export const itemAddTag = gql`
  mutation itemAddTag($tagId: ObjectID!, $id: ObjectID!) {
    itemAddTag(tagId: $tagId, id: $id) {
      _id
      tags
    }
  }
`;

export const itemRemoveTag = gql`
  mutation itemRemoveTag($tagId: ObjectID!, $id: ObjectID!) {
    itemRemoveTag(tagId: $tagId, id: $id) {
      _id
      tags
    }
  }
`;

export const tag = gql`
  query tag($tagId: ObjectID!) {
    tag(tagId: $tagId) {
      _id
      name
      status
      images
      notifications
    }
  }
`;

export const tags = gql`
  query tags($paginate: PaginationInput) {
    tags(paginate: $paginate) {
      _id
      name
      user
      status
      images
    }
  }
`;

export const ordersByTag = gql`
  query ordersByTag(
    $orderStatus: [String!]
    $limit: Float
    $tagId: [ObjectID!]!
  ) {
    ordersByTag(orderStatus: $orderStatus, limit: $limit, tagId: $tagId) {
      tag
      orders {
        _id
        subtotals {
          amount
        }
        user {
          phone
          email
          name
          image
        }
        ocr {
          _id
        }
        items {
          item {
            name
            images
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
        orderStatus
        status {
          status
          access
        }
        dateId
        createdAt
        tags
      }
    }
  }
`;
