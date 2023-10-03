import gql from 'graphql-tag';

export const affiliateTotalpaginate = gql`
query affiliateTotalpaginate($input: PaginationInput, $date: Date!){
  affiliateTotalpaginate(paginate: $input, date: $date)
}`;

export const affiliateComisionTotalByRange = gql`
query affiliateComisionTotalByRange($referenceId: ObjectID!, $range: PaginationRangeInput!){
  affiliateComisionTotalByRange(referenceId: $referenceId, range: $range)
}`;

export const createAffiliate = gql`
  mutation createAffiliate(
    $slugMerchant: String!
    $input: AffiliateInput!
  ) {
    createAffiliate(
      slugMerchant: $slugMerchant
      input: $input
    ) {
      _id
    }
  }
`;