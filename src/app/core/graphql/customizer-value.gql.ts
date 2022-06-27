import gql from 'graphql-tag';
import { customizer } from './customizer.gql';

export const customizerValue = `
  _id
  rules {
    ${customizer}
  }
  createdAt
  updatedAt
  backgroundColor {
    color {
      name
      fixedValue
    }
  }
  backgroundImage {
    image
    filters {
      bw
      sepia
      contrast
    }
  }
  canvas {
    rounded
    size {
      height
      width
      ratio
    }
  }
  stickers {
    sticker
    position {
      x
      y
      z
      height
      width
      rotation
    }
    svgOptions {
      color {
        name
        fixedValue
        nickname
      }
    }
  }
  texts {
    color {
      name
      fixedValue
      nickname
    }
    text
    font
    size
    position {
      x
      y
      z
      height
      width
      rotation
    }
  }
  lines {
    color
    width
    points {
      x
      y
    }
    position {
      z
    }
  }
  preview
`;

export const getCustomizerValue = gql`
  query getCustomizerValue($id: ObjectID!) {
    getCustomizerValue(id: $id) { ${customizerValue} }
  }
`;

export const getCustomizerValuePreview = gql`
  query getCustomizerValue($id: ObjectID!) {
    getCustomizerValue(id: $id) { 
      _id
      preview
    }
  }
`;

export const getCustomizerValuesByCustomizer = gql`
  query getCustomizerValuesByCustomizer($customizer: ObjectID!) {
    getCustomizerValuesByCustomizer(customizer: $customizer) { _id }
  }
`;

export const createCustomizerValue = gql`
  mutation createCustomizerValue($input: CustomizerValueInput!) {
    createCustomizerValue(input: $input) { _id }
  }
`;

export const updateCustomizerValue = gql`
  mutation updateCustomizerValue($input: CustomizerValueInput!, $id: ObjectID!) {
    updateCustomizerValue(input: $input, id: $id) { _id }
  }
`;
