import gql from 'graphql-tag';

export const addMark = gql`
  mutation addMark ($input: [MarkInput!]!) {
    addMark (input: $input) {
        _id
    }
  }
`;

export const removeMark = gql`
  mutation removeMark ($input: [ObjectID!]!) {
    Boolean: removeMark (input: $input)
  }
`;


export const bookmarkByUser = gql`
  query {
    bookmarkByUser  {  
        _id
        marks {
          _id
        }
  }
}
`;