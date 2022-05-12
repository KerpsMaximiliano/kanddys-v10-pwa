import gql from 'graphql-tag'


export const updateTag = gql`
   mutation updateTag( $input: TagInput!, $tagId: ObjectID!) {
    updateTag( input: $input, tagId: $tagId ) {
        name
        messageNotify
        notify
        _id
      }
    }
`

export const createTag = gql`
 mutation createTag($input: TagInput!){
    createTag(input: $input){
        _id
        }
    }
`

export const tagsByUser = gql`
  query {
      tagsByUser{
          name
          messageNotify
          notify
      }
  }
`

export const addTagsInOrder = gql`
    mutation addTagsInOrder( $merchantId: ObjectID!, $tagId: ObjectID!, $orderId: ObjectID!){
        addTagsInOrder( merchantId: $merchantId, tagId: $tagId, orderId: $orderId){
        _id
        subtotals
        items
        user
        userNotification
        merchants
        tags
        }
    }
`
export const tag = gql`
 query tag($tagId: ObjectID!){
    tag(tagId: $tagId){
        name
        messageNotify
        notify
        }
    }
`