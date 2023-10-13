import gql from 'graphql-tag';

import { body as merchant } from './merchants.gql';

const user = `
  _id
  email
  phone
  name
  birthdate
  image
`;

export const body = `
  _id
  name
  kindcode
  image
  email
  purpose
  mission
  category
  reason
  collaborationMethod
  media
  cashout
  activity



  owner { ${user} }
  queens { ${user} }
  members { ${user} }
`;

export const myCommunities = gql`
  query myCommunities($params: ListParams ){
    myCommunities(params: $params) { ${body} }
  }
`;

export const community = gql`
  query community($id: ObjectID!) {
    community(id: $id) { _id
      name
      kindcode
      image
      purpose
      mission
      category {
        _id
        name
      }
      reason
      collaborationMethod
      media
      cashout
      activity
      socials {
        name
        url
      }
    
    
    
      owner { ${user} }
      queens { ${user} }
      members { ${user} } 
    }
  }
`;

export const hotCommunity = gql`
  query community($id: ObjectID!) {
    community(id: $id) {
      _id
      name
      kindcode
      image
      activity
      owner { ${user} }
    }
  }
`;

export const createCommunity = gql`
  mutation createCommunity($input: CommunityInput!) {
    createCommunity(input: $input) {
      _id
      owner {
        _id
        email
      }
      name
      image
    }
  }
`;

/*export const createCommunity = gql`
  mutation createCommunity($input: CommunityInput!) {
    createCommunity(input: $input) {
      _id
      owner {
        _id
        email
      }
      name
      image
    }
  }
`;*/

export const updateCommunity = gql`
  mutation updateCommunity($id: ObjectID!, $input: CommunityInput!) {
    updateCommunity(id: $id, input: $input) {
      _id
      owner {
        _id
        email
      }
      name
      image
    }
  }
`;

export const communityMembers = gql`
  query communityMembers($communityId: ObjectID!, $params: ListParams){
    communityMembers(
      community: $communityId
      params: $params
    ){ ${user} }
  }
`;

export const addMember = gql`
  mutation addMember($communityId: ObjectID!, $phone: String!, $as: String) {
    community: addMember (
      communityId: $communityId,
      phone: $phone,
      as: $as
    ) { ${body} }
  }
`;

export const removeMember = gql`
  mutation removeMember($communityId: ObjectID!, $userId: ObjectID!) {
    community: removeMember (
      communityId: $communityId,
      userId: $userId
    ) { ${body} }
  }
`;
// TODO: ???
// export const itemsByMerchants = gql`
//   query itemsByMerchants($merchantsIds: [ObjectID!]!) {
//     itemsByMerchants(merchants: $merchantsIds) { ${merchant} }
//   }
// `;

export const communityMerchants = gql`
  query communityPartners($kindcode: String!) {
    communityMerchants(kindcode: $kindcode) { ${merchant} }
  }
`;

export const communityCollected = gql`
  query communityCollected($kindcode: String!) {
    communityCollected(kindcode: $kindcode)
  }
`;

export const communities = gql`
  query communities($params: ListParams) {
    communities(params: $params) {
      _id
      name
      kindcode
      image
      purpose
      mission
      category {
        _id
        name
      }
      reason
      collaborationMethod
      media
      cashout
      activity
      createdAt



      owner { ${user} }
      queens { ${user} }
      members { ${user} }
    }
  }
`;

export const hotCommunities = gql`
  query communities($params: ListParams) {
    communities(params: $params) {
      _id
      name
      image
      owner {
        email
      }
    }
  }
`;

export const communitycategories = gql`
  query communitycategores($params: ListParams) {
    communitycategories(params: $params) {
      _id
      name
      description
    }
  }
`;

export const communitycategoriesPaginate = gql`
  query communitycategoriesPaginate($paginate: PaginationInput!) {
    communitycategoriesPaginate(paginate: $paginate) {
      results {
        _id
        name
        type
        description
      }
    }
  }
`;
