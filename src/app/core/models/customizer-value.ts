import { Model } from '../objects/model';
import { Customizer, CustomizerFixedValue } from './customizer';

export interface Position {
  x?: number;
  y?: number;
  z: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export class CanvasInput {
  rounded: boolean;
  size: {
    height: number;
    width: number;
    ratio: string;
  };
}

export class TextInput {
  color: CustomizerFixedValue;
  text: string;
  font: string;
  size: number;
  position: Position;
}

export class StickerInput {
  sticker?: File;
  url?: string;
  position: Position;
  svgOptions?: {
    color: CustomizerFixedValue;
  };
}

export class LinePoints {
  x: number;
  y: number;
}

export class LinesInput {
  color: string;
  width: number;
  points: LinePoints[];
  position: {
    z: number;
  };
}

export class BackgroundColorInput {
  color?: CustomizerFixedValue;
}

export class BackgroundImageInput {
  image?: File;
  url?: string;
  filters?: {
    bw: number;
    sepia: number;
    contrast: number;
  };
}

export class BackgroundColor {
  color?: CustomizerFixedValue;
};

export class BackgroundImage {
  image?: string;
  filters?: {
    bw: number;
    sepia: number;
    contrast: number;
  };
}

export class Canvas {
  rounded: boolean;
  size: {
    height: number;
    width: number;
    ratio: string;
  };
}

export class Stickers {
  sticker: string;
  position: Position;
  svgOptions: {
    color: CustomizerFixedValue;
  }
};

export class Texts {
  color: CustomizerFixedValue;
  text: string;
  font: string;
  size: number;
  position: Position;
};

export class Lines {
  color: string;
  width: number;
  points: LinePoints[];
  position: {
    z: number;
  };
};

export class CustomizerValue extends Model<Customizer> {
  backgroundColor: BackgroundColor;
  backgroundImage: BackgroundImage;
  canvas: Canvas;
  stickers: Stickers[];
  texts: Texts[];
  lines: Lines[];
  rules: Customizer;
  preview: string;
}

export class CustomizerValueInput {
  rules: string;
  canvas: CanvasInput;
  backgroundColor: BackgroundColorInput;
  backgroundImage: BackgroundImageInput;
  stickers: StickerInput[];
  texts: TextInput[];
  lines?: LinesInput[];
  preview?: File;
  url?: string;
}
