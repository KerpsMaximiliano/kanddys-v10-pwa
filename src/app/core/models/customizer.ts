import { Model } from '../objects/model';
import { Position } from './customizer-value';

// Customizer
export interface CustomizerFixedValue {
  name: string;
  fixedValue: string;
}

interface textItemsRule {
  defaultText: string;
  onlyFixedFonts: boolean;
  fixedFonts?: string[];
  onlyFixedColor: boolean;
  fixedColors?: CustomizerFixedValue[];
  fixPositionOnly: boolean;
  fixPosition?: Position;
  fixSizeOnly: boolean;
  fixSize?: number;
  fixedLengthOnly: boolean;
  fixedLength?: number;
}

interface stickerItemsRule {
  fixSizeOnly?: boolean;
  fixSize?: boolean;
  fixPositionOnly: boolean;
  fixPosition?: Position;
  onlyFixed: boolean;
  fixed?: string[];
  svgRule: {
    active?: boolean;
    fixedColors: boolean;
    colors: CustomizerFixedValue[];
  }
}

export class Customizer extends Model<Customizer> {
  active: boolean;
  backgroundColor: {
    active: boolean;
    onlyFixed: boolean;
    fixed?: string[];
  };
  backgroundImage: {
    active: boolean;
    onlyFixed: boolean;
    fixed?: string[];
    filters: {
      bw: boolean;
      sepia: boolean;
      contrast: boolean;
    };
  };
  canvas: {
    onlyFixed: boolean;
    fixedSize?: {
      height: number;
      width: number;
      ratio: string;
    };
    rounded: boolean;
  };
  stickers: {
    active: boolean;
    fixedAmountItems: boolean;
    fixedAmount?: number;
    itemsRule: stickerItemsRule[];
  };
  texts: {
    active: boolean;
    fixedAmountItems: boolean;
    fixedAmount?: number;
    itemsRule: textItemsRule[];
  };
  lines: {
    active: boolean;
    onlyFixedColor: boolean;
    fixedColors?: CustomizerFixedValue[];
  };
}

// Customizer Input
interface textItemsRuleInput {
  defaultText: string;
  onlyFixedFonts: boolean;
  fixedFonts?: string[];
  onlyFixedColor: boolean;
  fixedColors?: CustomizerFixedValue[];
  fixPositionOnly: boolean;
  fixPosition?: Position;
  fixSizeOnly: boolean;
  fixSize?: number;
  fixedLengthOnly: boolean;
  fixedLength?: number;
}

interface stickerFixedInput {
  image: File;
  fixedColorsOnly: boolean;
  fixedColors: string[];
}

interface stickerItemsRuleInput {
  onlyFixed: boolean;
  fixed?: File[];
  urls?: string[];
  fixPositionOnly: boolean;
  fixPosition?: Position;
  svgRule: {
    fixedColors: boolean;
    colors: CustomizerFixedValue[];
  }
}

export class CustomizerInput {
  backgroundColor: {
    active: boolean;
    onlyFixed: boolean;
    fixed?: string[];
  };
  backgroundImage: {
    active: boolean;
    onlyFixed: boolean;
    filters: {
      bw: boolean;
      sepia: boolean;
      contrast: boolean;
    };
    fixed?: File[];
    urls?: string[];
  };
  canvas: {
    onlyFixed: boolean;
    fixedSize?: {
      height: number;
      width: number;
      ratio: string;
    };
    rounded: boolean;
  };
  stickers: {
    active: boolean;
    fixedAmountItems: boolean;
    fixedAmount?: number;
    itemsRule: stickerItemsRuleInput[];
  };
  texts: {
    active: boolean;
    fixedAmountItems: boolean;
    fixedAmount?: number;
    itemsRule: textItemsRuleInput[];
    
  };
  lines: {
    active: boolean;
    onlyFixedColor: boolean;
    fixedColors?: string[];
  };
  merchant?: string;
}