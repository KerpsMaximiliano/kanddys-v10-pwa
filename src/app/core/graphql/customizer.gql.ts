import gql from 'graphql-tag';

export const customizer =`
  _id
  active
  canvas {
    onlyFixed
    fixedSize {
      width
      height
      ratio
    }
    rounded
  }
  backgroundColor {
    active
    onlyFixed
    fixed
  }
  backgroundImage {
    active
    onlyFixed
    fixed
    filters {
      bw
      contrast
      sepia
    }
  }
  stickers {
    active
    fixedAmountItems
    fixedAmount
    itemsRule {
      fixPositionOnly
      fixPosition {
        x
        y
        z
        height
        width
        rotation
      }
      onlyFixed
      fixed
      svgRule {
        active
        fixedColors
        colors {
          name
          fixedValue
        }
      }
    }
  }
  texts {
    active
    fixedAmountItems
    fixedAmount
    itemsRule {
      defaultText
      onlyFixedFonts
      fixedFonts
      onlyFixedColor
      fixedColors {
        name
        fixedValue
      }
      fixPositionOnly
      fixPosition {
        x
        y
        z
        rotation
      }
      fixSizeOnly
      fixSize
      fixedLengthOnly
      fixedLength
    }
  }
  lines {
    active
    onlyFixedColor
    fixedColors
  }
  createdAt
  updatedAt
`

export const getCustomizer = gql`
  query getCustomizer($id: ObjectID!) {
    getCustomizer(id: $id) { ${customizer} }
  }
`;

export const createCustomizer = gql`
  mutation createCustomizer($input: CustomizerInput!) {
    createCustomizer(input: $input) { _id }
  }
`;

export const updateCustomizer = gql`
  mutation updateCustomizer($input: CustomizerInput!, $id: ObjectID!) {
    updateCustomizer(input: $input, id: $id) { _id }
  }
`;