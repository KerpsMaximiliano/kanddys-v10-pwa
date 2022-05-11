import gql from 'graphql-tag'


export const updateTag = gql`
   mutation updateTag( $input: TagInput!, $tagId: ObjectID!) {
    updateTag( input: $input, tagId: $tagID ) {
        name
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