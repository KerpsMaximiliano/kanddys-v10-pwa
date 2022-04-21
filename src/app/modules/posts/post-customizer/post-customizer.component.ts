import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  NgZone,
  AfterContentChecked,
} from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ActivatedRoute, Router } from '@angular/router';
import { Customizer } from 'src/app/core/models/customizer';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { CustomizerService } from 'src/app/core/services/customizer.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomizerStickersComponent } from './customizer-stickers/customizer-stickers.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { HeaderService } from 'src/app/core/services/header.service';
import { Platform } from '@angular/cdk/platform';
import {
  CustomizerValue,
  CustomizerValueInput,
  Position,
  BackgroundImageInput,
  StickerInput,
  TextInput,
  LinePoints,
  LinesInput,
  Texts,
  Stickers,
  Lines,
  BackgroundColor,
  BackgroundImage,
  Canvas,
} from 'src/app/core/models/customizer-value';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { take } from 'rxjs/operators';
import { LocationStrategy } from '@angular/common';

interface CanvasElement {
  // ------- General properties -----------
  fixPositionOnly?: boolean;
  isDragging?: boolean;
  willDelete?: boolean;
  originalSize?: number;

  position: Position;

  // ------- Stickers properties ----------
  sticker?: {
    image?: HTMLImageElement;
    decoded?: string;
    color?: string;
    number: number;
    url?: string;
  };
  // ------- Typography properties --------
  typography?: {
    text: string;
    size: string;
    font: string;
    color: string;
    fixSizeOnly: boolean;
    number: number;
    hidden?: boolean;
  };

  // ---------- Lines properties -----------
  lines?: {
    width: number;
    color: string;
    points: LinePoints[];
  };
}

interface TextData {
  imageText: string;
  fontSize: string;
  fontStyle: string;
  fontColor: string;
}

const allColors: string[] = [
  '#D5D5D5',
  '#DEDEDB',
  '#D3D0CE',
  '#DFD098',
  '#EBDA0E',
  '#EEC721',
  '#D13A28',
  '#BE3D27',
  '#A3392A',
  '#B03C26',
  '#B54C23',
  '#8D2229',
  '#B5262A',
  '#308A82',
  '#4CA596',
  '#2F9410',
  '#318526',
  '#1F662A',
  '#5BBB2F',
  '#96C35E',
  '#75921E',
  '#294A30',
  '#3C8223',
  '#45838B',
  '#9584A1',
  '#50AABF',
  '#4878AE',
  '#7E85C2',
  '#4059AC',
  '#1D5CA2',
  '#474EA5',
  '#4A89C6',
  '#46449B',
  '#535C99',
  '#513689',
  '#D080A9',
  '#B55B8C',
  '#E56394',
  '#E0B1C2',
  '#DFA7CB',
  '#DF8EB2',
  '#D22A86',
  '#7F72AE',
  '#69549F',
  '#BE4595',
  '#614A92',
  '#553A8C',
  '#BF679C',
  '#C26495',
  '#DEBE10',
  '#DAC60E',
  '#E1D80C',
  '#DDC50C',
  '#E4BA25',
  '#DEC717',
  '#D7BD18',
  '#D9CE34',
  '#652228',
  '#621C26',
  '#4C232C',
  '#382022',
  '#959595',
  '#A7A3AA',
  '#AEAEAE',
  '#959193',
  '#ACA9A6',
  '#827E83',
  '#565855',
  '#323135',
  '#24262C',
  '#1E2426',
  '#121115',
  '#3B1F22',
];

@Component({
  selector: 'app-post-customizer',
  templateUrl: './post-customizer.component.html',
  styleUrls: ['./post-customizer.component.scss'],
})
export class PostCustomizerComponent
  implements OnInit, AfterViewInit, AfterContentChecked
{
  @ViewChild('myCanvas', { static: false })
  canvasRef: ElementRef<HTMLCanvasElement>;
  public context: CanvasRenderingContext2D;

  @ViewChild('imageTextRef') set imageTextRef(ref: ElementRef) {
    if (!!ref) {
      ref.nativeElement.focus();
    }
  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  // CUSTOMIZER
  // apiURL = 'http://localhost:3500';
  isMobile: boolean = false;
  apiURL = 'https://api.kanddys.com';
  itemId: string;
  item: any;
  customizerValueID: string;
  customizerRuleID: string;
  customizeOptions: string[] = [];
  selectedOption: string = '';
  selectedElementOption: string;
  textOptions: string = 'texto';
  backgroundImageOptions: string[] = [
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253670596.jpeg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253671738.jpeg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253672264.jpeg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253672811.jpeg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253673466.jpeg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253674025.jpeg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253674566.jpeg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253675317.jpeg',
  ];
  offsetX: number;
  offsetY: number;
  canvasWidth: number;
  canvasHeight: number;
  customizerRules: Customizer;
  ratioOptions: string[] = ['1:1', '3:4', '9:16'];
  canvasRatio: string = '1:1';
  // CUSTOMIZER

  // EFECTOS
  filters: {
    bw: number;
    sepia: number;
    contrast: number;
  } = {
    bw: 0,
    sepia: 0,
    contrast: 100,
  };
  backgroundColors: string[] = ['none', ...allColors];
  // EFECTOS

  // STICKERS
  stickerSize: number;
  elementRotation: number;
  currentStickerList: string[] = [];
  stickerList: string[] = [
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253675986.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253676418.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253676901.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253677268.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253677696.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253678069.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253678617.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253679447.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253679803.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253680168.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253680975.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253681387.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253681909.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253682271.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253682652.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253683141.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253683952.svg',
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1644253684463.svg',
  ];
  stickerColors: string[] = allColors;
  currentStickersAmount: number = 0;
  stickerMax: boolean = false;
  stickerColor: string = '';
  // STICKERS

  // LÁPIZ
  isDrawing: boolean = false;
  canDraw: boolean = false;
  lineWidth: number = 2;
  lineColor: string = '#D5D5D5';
  lineColors: string[] = allColors;
  // LÁPIZ

  // TIPOGRAFIA
  isEditing: boolean = false;
  typographyData: TextData = {
    imageText: '',
    fontSize: '24',
    fontStyle: 'Arial',
    fontColor: '#D5D5D5',
  };
  fontStyles: string[] = [
    'Arial',
    'RobotoMedium',
    'GeorgiaRegular',
    'GiddyupStd',
    'Cheltenham',
    'Empire',
  ];
  fontFileName: { fileName: string; fontName: string }[] = [
    {
      fileName: 'GiddyupStd.otf',
      fontName: 'GiddyupStd',
    },
    {
      fileName: 'NIRVANA.TTF',
      fontName: 'Nirvana',
    },
    {
      fileName: 'GeorgiaRegular.ttf',
      fontName: 'GeorgiaRegular',
    },
    {
      fileName: 'CheltenhamStdBold.otf',
      fontName: 'Cheltenham',
    },
    {
      fileName: 'Dorsa-Regular.ttf',
      fontName: 'Dorsa',
    },
    {
      fileName: 'VILLAGE.TTF',
      fontName: 'Village',
    },
    {
      fileName: 'PomfritDandyNFRegular.ttf',
      fontName: 'PomfritDandyNFRegular',
    },
    {
      fileName: `HorsDoeuvresTheGarter.otf`,
      fontName: 'HorsDoeuvresTheGarter',
    },
    {
      fileName: 'CheltenhamStdBoldCondIt.otf',
      fontName: 'CheltenhamStdBoldCondIt',
    },
    {
      fileName: 'CheltenhamStd-HdtooledBold.otf',
      fontName: 'CheltenhamStd-HdtooledBold',
    },
    {
      fileName: 'CFCraigRobinson-Regular.ttf',
      fontName: 'CFCraigRobinson-Regular',
    },
    {
      fileName: 'TypoOvalRegularDemo.otf',
      fontName: 'TypoOvalRegularDemo',
    },
    {
      fileName: 'empire-bt.ttf',
      fontName: 'Empire',
    },
  ];
  fontColors: string[] = allColors;
  currentTextsAmount: number = 0;
  currentMaxLength: number;
  textMax: boolean = false;
  inputMaxLength: number;
  willHideInput: boolean = false;
  willShowInput: boolean = false;
  isLongText: boolean = false;
  hiddenFontText: string = '';
  // TIPOGRAFIA

  // IMAGE
  imageFile: File;
  imageUrl: string;
  selectedBackgroundImage: string;
  imageElement: HTMLImageElement;
  selectedBackgroundColor: string = '#ffffff';
  // IMAGE

  // EDITING
  elementList: CanvasElement[] = [];
  startX: number;
  startY: number;
  touchtime: number;
  TO_RADIANS = Math.PI / 180;
  modifyingElement: number = -1;
  modifyingSticker: number = -1;
  modifyingText: number = -1;
  dragok: boolean = false;
  editingCustomizer: boolean = false;
  // EDITING

  //AUXILIAR
  done: boolean = false;
  //AUXILIAR

  constructor(
    private customizerService: CustomizerService,
    private customizerValueService: CustomizerValueService,
    public merchant: MerchantsService,
    private header: HeaderService,
    private dialog: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private platform: Platform,
    private _ngZone: NgZone,
    private location: LocationStrategy
  ) {
    if (this.header.customizerData) {
      history.pushState(null, null, window.location.href);
      this.location.onPopState(() => {
        history.pushState(null, null, window.location.href);
      });
    }
  }

  @HostListener('window:keydown.esc', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (this.isEditing) this.exitEditing(this.typographyData);
  }

  async fetchSVG(url): Promise<string | void> {
    let myHeaders = new Headers();
    myHeaders.append(
      'App-Key',
      '14a2bb1188a81743df583354dbb0fd154bfea7b8ee6ba48e04e143c7cc2cbc3a'
    );
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };
    return fetch(
      `${this.apiURL}/image-transformer/svg?url=${url}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        return this.encodeSVG(result.svg);
      })
      .catch((error) => console.log('error', error));
  }

  getCustomizerRules(customizer: Customizer) {
    this.customizerRules = customizer;
    const { canvas, stickers, texts, lines } = customizer;
    if (canvas.onlyFixed) {
      // this.canvasHeight = canvas.fixedSize.height;
      // this.canvasRatio = canvas.fixedSize.ratio;
      this.canvasRatio = '1:1';
      // if(canvas.fixedSize.ratio === '1:1') this.canvasHeight = this.canvasWidth;
      // if(canvas.fixedSize.ratio === '3:4') this.canvasHeight = Math.floor(this.canvasWidth * 1.33);
      // if(canvas.fixedSize.ratio === '9:16') this.canvasHeight = Math.floor(this.canvasWidth * 1.78);
      // this.canvasRef.nativeElement.height = this.canvasHeight;
      this.canvasHeight = this.canvasWidth;
      this.canvasRef.nativeElement.height = this.canvasWidth;
    }
    if (stickers.active) this.customizeOptions.push('stickers');
    if (texts.active) this.customizeOptions.push('tipografía');
    if (lines.active) this.customizeOptions.push('lápiz');

    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.textBaseline = 'top';
    this.context.textAlign = 'left';

    if (this.header.customizerData && this.header.customizerData.willModify) {
      this.elementList = this.header.customizerData.elementList;
      this.currentStickersAmount = this.header.customizerData.stickersAmount;
      this.currentTextsAmount = this.header.customizerData.textsAmount;
      if (this.header.customizerData.backgroundUrl)
        this.selectedBackgroundImage = this.header.customizerData.backgroundUrl;
      if (this.header.customizerData.backgroundImage)
        this.imageFile = this.header.customizerData.backgroundImage;
      if (this.header.customizerData.backgroundColor)
        this.selectedBackgroundColor =
          this.header.customizerData.backgroundColor;
      if (stickers.fixedAmountItems) {
        if (this.currentStickersAmount === stickers.fixedAmount) {
          this.stickerMax = true;
        }
      }
      if (texts.fixedAmountItems) {
        // Text input below canvas
        this.willShowInput = true;
        this.inputMaxLength = texts.itemsRule.reduce(
          (prev, curr) => prev + curr.fixedLength,
          0
        );
        this.hiddenFontText = texts.itemsRule.reduce(
          (prev, curr) => prev + curr.defaultText,
          ''
        );
        if (
          texts.itemsRule[0].fixedFonts[0] === 'Oval' ||
          texts.itemsRule[0].fixedFonts[0] === 'Elegant'
        ) {
          if(texts.itemsRule[0].fixedFonts[0] === 'Elegant') this.isLongText = true
          this.willHideInput = true;
        }
        // Text input below canvas
        if (this.currentTextsAmount === texts.fixedAmount) {
          this.textMax = true;
        }
      }
    } else {
      if (this.route.snapshot.url[0].path === 'post-customizer') {
        if (stickers.fixedAmountItems) {
          const urlList: string[] = stickers.itemsRule.map((sticker) => {
            let url;
            if (sticker.onlyFixed) url = sticker.fixed[0];
            else url = this.stickerList[0];
            return url;
          });
          const promises = urlList.map((url) => this.fetchSVG(url));
          Promise.all(promises).then((result) => {
            result.forEach((svg) => {
              if (svg) {
                this.addSticker(svg, 0);
              }
            });
          });
        }
        if (texts.fixedAmountItems) {
          // Text input below canvas
          this.willShowInput = true;
          this.inputMaxLength = texts.itemsRule.reduce(
            (prev, curr) => prev + curr.fixedLength,
            0
          );
          this.hiddenFontText = texts.itemsRule.reduce(
            (prev, curr) => prev + curr.defaultText,
            ''
          );
          if (
            texts.itemsRule[0].fixedFonts[0] === 'Oval' ||
            texts.itemsRule[0].fixedFonts[0] === 'Elegant'
          ) {
            if(texts.itemsRule[0].fixedFonts[0] === 'Elegant') this.isLongText = true
            this.willHideInput = true;
          }
          // Text input below canvas
          texts.itemsRule.forEach((text) => {
            if (text.defaultText) {
              let textData: TextData = {
                imageText: text.defaultText,
                fontSize: text.fixSizeOnly ? text.fixSize + '' : '24',
                fontColor: text.onlyFixedColor
                  ? text.fixedColors[0]
                  : '#ffffff',
                fontStyle: text.onlyFixedFonts ? text.fixedFonts[0] : 'Arial',
              };
              this.typographyData = textData;
              this.exitEditing(textData);
            }
          });
        }
      }
    }
  }

  getCustomizerValue(value: CustomizerValue) {
    const {
      backgroundColor,
      backgroundImage,
      canvas,
      stickers,
      texts,
      lines,
      rules,
    } = value;
    this.customizerRules = rules;
    // Canvas
    // this.canvasWidth = canvas.size.width;
    // this.canvasHeight = canvas.size.height;
    // this.canvasRatio = canvas.size.ratio;
    // this.canvasRef.nativeElement.width = this.canvasWidth;
    // this.canvasRef.nativeElement.height = this.canvasHeight;
    const { left, top } = this.canvasRef.nativeElement.getBoundingClientRect();
    this.offsetX = left;
    this.offsetY = top;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.textBaseline = 'top';
    this.context.textAlign = 'left';
    // Background Color
    if (this.header.customizerData && this.header.customizerData.willModify) {
      this.elementList = this.header.customizerData.elementList;
      this.currentStickersAmount = this.header.customizerData.stickersAmount;
      this.currentTextsAmount = this.header.customizerData.textsAmount;
      if (this.header.customizerData.backgroundUrl)
        this.selectedBackgroundImage = this.header.customizerData.backgroundUrl;
      if (this.header.customizerData.backgroundImage)
        this.imageFile = this.header.customizerData.backgroundImage;
      if (this.header.customizerData.backgroundColor)
        this.selectedBackgroundColor =
          this.header.customizerData.backgroundColor;
      this.draw();
      unlockUI();
    } else {
      if (backgroundColor.color)
        this.selectedBackgroundColor = backgroundColor.color;
      // Background Image
      if (backgroundImage.image) {
        this.selectedBackgroundImage = backgroundImage.image;
        this.imageElement = new Image();
        this.imageElement.src = backgroundImage.image;
        this.imageElement.onload = () => {
          this.draw();
        };
      }
      if (backgroundImage.filters && rules.backgroundImage.active) {
        const { bw, sepia, contrast } = backgroundImage.filters;
        if (rules.backgroundImage.filters.bw) this.filters.bw = bw;
        if (rules.backgroundImage.filters.sepia) this.filters.sepia = sepia;
        if (rules.backgroundImage.filters.contrast)
          this.filters.contrast = contrast;
      }
      // Stickers, Texts y Lines
      let elementArray = [];
      if (rules.stickers.active) elementArray.push(...stickers);
      if (rules.texts.active) elementArray.push(...texts);
      if (rules.lines.active) elementArray.push(...lines);

      this.elementList = elementArray
        .map((el, index) => {
          let newArray: CanvasElement;
          if ('sticker' in el) {
            const element: Stickers = el;
            newArray = {
              ...element,
              sticker: {
                number: this.currentStickersAmount,
                color: element.svgOptions?.color,
                url: element.sticker,
              },
              isDragging: false,
              originalSize: element.position.width,
              willDelete: false,
            };
            const num = rules.stickers.fixedAmountItems
              ? this.currentStickersAmount
              : 0;
            const stickerRules = rules.stickers.itemsRule[num];
            if (stickerRules.fixPositionOnly) {
              newArray.fixPositionOnly = true;
            }
            this.currentStickersAmount++;
          }
          if ('text' in el) {
            const element: Texts = el;
            newArray = {
              typography: {
                color: element.color,
                font: element.font,
                size: element.size + '',
                text: element.text,
                fixSizeOnly: false,
                number: this.currentTextsAmount,
              },
              isDragging: false,
              originalSize: element.position.width,
              willDelete: false,
              position: element.position,
            };
            const num = rules.texts.fixedAmountItems
              ? this.currentTextsAmount
              : 0;
            const textRules = rules.texts.itemsRule[num];
            const getWidth = (textString: string[]) => {
              let greatestWidth: number[] = [];

              textString.forEach((line: string, i: number) => {
                const lineWidth = this.context.measureText(line).width;
                greatestWidth.push(lineWidth);
              });

              return Math.max(...greatestWidth);
            };
            let width: number;
            let height: number;
            const newText = newArray.typography.text;
            const newFontSize = newArray.typography.size;
            this.context.font = `${newArray.typography.size}px ${newArray.typography.font}`;
            width = this.context.measureText(newText).width;
            height = parseInt(newFontSize);

            if (width > 400 || newText.includes('\n')) {
              let text: string[] = [];

              const lineBreaks = newText.split('\n');
              let line = '';
              let y = 0;
              for (let lb = 0; lb < lineBreaks.length; lb++) {
                const words = lineBreaks[lb].split(' ');

                for (var n = 0; n < words.length; n++) {
                  var testLine = line + words[n] + ' ';
                  var metrics = this.context.measureText(testLine);
                  var testWidth = metrics.width;
                  if (testWidth > 400 && n > 0) {
                    text.push(line);
                    line = words[n] + ' ';
                    y++;
                  } else {
                    line = testLine;
                  }
                }
                text.push(line);
                line = '';
                y++;
              }
              width = getWidth(text);
              height = Math.floor(y * parseInt(newFontSize));
            }
            newArray.position.x = Math.floor(
              this.canvasWidth * (textRules.fixPosition.x / 100) - width / 2
            );
            newArray.position.y = Math.floor(
              this.canvasHeight * (textRules.fixPosition.y / 100) - height / 2
            );
            newArray.position.width = width;
            newArray.position.height = height;
            if (textRules.fixPositionOnly) {
              newArray.fixPositionOnly = true;
              // newArray.position = textRules.fixPosition;
            }
            if (textRules.fixSizeOnly) {
              newArray.typography.fixSizeOnly = true;
              // newArray.typography.size = textRules.fixSize + '';
            }
            this.currentTextsAmount++;
          }
          if ('points' in el) {
            const element: Lines = el;
            // el as Lines;
            newArray = {
              lines: {
                color: element.color,
                points: element.points,
                width: element.width,
              },
              position: element.position,
            };
          }
          return newArray;
        })
        .sort((a, b) =>
          a.position.z > b.position.z ? 1 : b.position.z > a.position.z ? -1 : 0
        );
      if (this.elementList.find((el) => el.sticker)) {
        const stickers = this.elementList
          .filter((el) => el.sticker)
          .map((el) => el.sticker.url);
        const promises = stickers.map((url) => this.fetchSVG(url));
        Promise.all(promises).then((result) => {
          let stickerAmount = 0;
          for (let i = 0; i <= this.elementList.length - 1; i++) {
            if (this.elementList[i].sticker) {
              const value = (result[stickerAmount] as string)
                .trim()
                .replace(/background-image:\s{0,}url\(/, ``)
                .replace(/["']{0,}data:image\/svg\+xml,/, ``)
                .replace(/["']\);{0,}$/, ``);
              const decodedValue = decodeURIComponent(value);
              // const decodedSticker = result[stickerAmount] as string;
              const currentColor = this.getCurrentColor(decodedValue);
              const dimensions = this.getWidthHeight(decodedValue);
              this.elementList[i].position.width = +dimensions.width;
              this.elementList[i].position.height = +dimensions.height;
              this.elementList[i].position.x = Math.floor(
                this.canvasWidth * (this.elementList[i].position.x / 100) -
                  +dimensions.width / 2
              );
              this.elementList[i].position.y = Math.floor(
                this.canvasHeight * (this.elementList[i].position.y / 100) -
                  +dimensions.height / 2
              );
              const re = new RegExp('#' + currentColor[0], 'g');
              const replacedColor = decodedValue.replace(
                re,
                this.elementList[i].sticker.color
              );
              this.elementList[i].sticker.decoded = replacedColor;
              const canvasImage = new Image();
              this.elementList[i].sticker.image = canvasImage;
              canvasImage.src =
                'data:image/svg+xml;charset=UTF-8,' +
                this.encodeSVG(replacedColor);
              canvasImage.onload = () => {
                this.draw();
              };
              stickerAmount++;
            }
          }
          unlockUI();
          if (rules.stickers.fixedAmountItems) {
            if (this.currentStickersAmount === rules.stickers.fixedAmount) {
              this.stickerMax = true;
            }
          }
          if (rules.texts.fixedAmountItems) {
            if (this.currentTextsAmount === rules.texts.fixedAmount) {
              this.textMax = true;
            }
          }
        });
      } else {
        this.draw();
        unlockUI();
        if (rules.stickers.fixedAmountItems) {
          if (this.currentStickersAmount === rules.stickers.fixedAmount) {
            this.stickerMax = true;
          }
        }
        if (rules.texts.fixedAmountItems) {
          // Text input below canvas
          this.willShowInput = true;
          this.inputMaxLength = rules.texts.itemsRule.reduce(
            (prev, curr) => prev + curr.fixedLength,
            0
          );
          this.hiddenFontText = rules.texts.itemsRule.reduce(
            (prev, curr) => prev + curr.defaultText,
            ''
          );
          if (
            rules.texts.itemsRule[0].fixedFonts[0] === 'Oval' ||
            rules.texts.itemsRule[0].fixedFonts[0] === 'Elegant'
          ) {
            if(rules.texts.itemsRule[0].fixedFonts[0] === 'Elegant') this.isLongText = true
            this.willHideInput = true;
          }
          // Text input below canvas
          if (this.currentTextsAmount === rules.texts.fixedAmount) {
            this.textMax = true;
          }
        }
      }
    }
  }

  loadFonts() {
    if (this.elementList.some((element) => element.typography)) {
      const elementIndex = this.elementList.findIndex(
        (element) => element.typography
      );
      if (
        this.elementList[elementIndex].typography.font === 'Oval' ||
        this.elementList[elementIndex].typography.font === 'Elegant'
      )
        return;
      const fontElement = this.fontFileName.find(
        (fontFileName) =>
          fontFileName.fontName ===
          this.elementList[elementIndex].typography.font
      );

      this.fontFileName.forEach((font) => {
        if (this.elementList[elementIndex].typography.font !== font.fontName) {
          console.log(
            this.elementList[elementIndex].typography.font +
              ' No es ' +
              font.fontName
          );
        } else {
          console.log(
            this.elementList[elementIndex].typography.font +
              ' es ' +
              font.fontName
          );
        }
      });

      console.log('FUENTE', this.elementList[elementIndex].typography.font);

      if (fontElement) {
        /*let myFont = new FontFace('My Font', `url(${fontElement.fileName})`);

        myFont.load().then((font) => {
          (document as any).fonts.add(font);

          setTimeout(() => {
            // alert('PRE-RENDER');
            this.draw();
          }, 200);
        });*/
      }
    }
  }

  ngOnInit(): void {
    if (this.platform.ANDROID || this.platform.IOS) {
      this.isMobile = true;
    }
    if (this.header.customizerData) {
      if (this.header.customizerData.willModify) this.editingCustomizer = true;
    }
    this.customizerValueService.urlEmitter.subscribe(({ url, id }) => {
      this.addSticker(url, id);
    });
    this.itemId = this.route.snapshot.params['itemId'];
    if (this.route.snapshot.url[0].path === 'post-customizer') {
      this.customizerRuleID = this.route.snapshot.params['customizerId'];
      if (this.customizerRuleID) {
        lockUI();
        this.customizerService
          .getCustomizer(this.customizerRuleID)
          .then((value) => {
            this.getCustomizerRules(value);
            this.loadFonts();
            this.resetSelected();
            unlockUI();
          });
      }
    }
    if (this.route.snapshot.url[0].path === 'edit-customizer') {
      this.customizerValueID = this.route.snapshot.params['customizerId'];
      if (this.customizerValueID) {
        lockUI();
        this.customizerValueService
          .getCustomizerValue(this.customizerValueID)
          .then((value) => {
            this.getCustomizerRules(value.rules);
            this.getCustomizerValue(value);
            if (!this.header.customizerData) {
              this.loadFonts();
            }
            this.resetSelected();
            unlockUI();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }

  ngAfterContentChecked(): void {
    /*this.done = true;
    setTimeout(() => {this.draw()}, 1000);
    let myFont = new FontFace('My Font', 'url(NIRVANA.TTF)');
    myFont.load().then(function (font) {
      console.log(font);
      
      // with canvas, if this is ommited won't work
      (document as any).fonts.add(font);
      console.log('Font loaded');
    });*/
  }

  // Initializes Customizer
  ngAfterViewInit() {
    this.context = (
      this.canvasRef.nativeElement as HTMLCanvasElement
    ).getContext('2d');
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.textBaseline = 'top';
    this.context.textAlign = 'left';
    this.canvasWidth = this.canvasRef.nativeElement.offsetWidth;
    this.canvasRef.nativeElement.width = this.canvasWidth;
    this.canvasHeight = this.canvasRef.nativeElement.offsetWidth;
    this.canvasRef.nativeElement.height = this.canvasWidth;

    // if(this.canvasRatio === '1:1') this.canvasHeight = this.canvasWidth;
    // if(this.canvasRatio === '3:4') this.canvasHeight = Math.floor(this.canvasWidth * 1.33);
    // if(this.canvasRatio === '9:16') this.canvasHeight = Math.floor(this.canvasWidth * 1.78);
    // this.canvasRef.nativeElement.height = this.canvasHeight;

    // if (!this.canvasHeight) {
    //   this.canvasRef.nativeElement.height = this.canvasHeight;
    // }

    const { left, top } = this.canvasRef.nativeElement.getBoundingClientRect();
    this.offsetX = left;
    this.offsetY = top;

    window.addEventListener('resize', () => {
      const { left, top } =
        this.canvasRef.nativeElement.getBoundingClientRect();
      this.offsetX = left;
      this.offsetY = top;
    });

    window.addEventListener('scroll', () => {
      const { left, top } =
        this.canvasRef.nativeElement.getBoundingClientRect();
      this.offsetX = left;
      this.offsetY = top;
    });

    this.canvasRef.nativeElement.onmousedown = (e) => {
      this.mouseDown(e);
    };
    this.canvasRef.nativeElement.ontouchstart = (e) => {
      if (e.touches.length < 2) return this.mouseDown(e);
    };
    this.canvasRef.nativeElement.onmousemove = (e) => {
      this.preventDefault(e);
      this.mouseMove(e);
    };
    this.canvasRef.nativeElement.ontouchmove = (e) => {
      this.mouseMove(e);
    };
    this.canvasRef.nativeElement.onmouseup = (e) => {
      this.preventDefault(e);
      this.mouseUp();
    };
    this.canvasRef.nativeElement.ontouchend = (e) => {
      this.mouseUp();
    };
    this.canvasRef.nativeElement.ondblclick = (e) => {
      this.dbClicked(e);
    };

    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.textBaseline = 'top';
    this.context.textAlign = 'left';
  }

  resetSelected() {
    this.modifyingElement = -1;
    this.modifyingSticker = -1;
    this.modifyingText = -1;
    // this.selectedOption = '';
    this.selectedElementOption = '';
  }

  // Logic for changing Customizer modules
  changeCustomizer(option: string, ignore?: boolean) {
    const { left, top } = this.canvasRef.nativeElement.getBoundingClientRect();
    this.offsetX = left;
    this.offsetY = top;
    if (this.canDraw) {
      this.canDraw = false;
      this.customizeOptions[this.customizeOptions.indexOf('confirmar')] =
        'lápiz';
      this.selectedOption = 'lápiz';
    }
    if (this.isEditing) {
      this.exitEditing(this.typographyData);
      this.selectedOption = 'tipografía';
    }
    if (option !== 'confirmar') this.selectedOption = option;
    // Efectos
    if (option === 'efectos') {
      this.resetSelected();
    }
    // Stickers
    if (option === 'stickers') {
      if (this.modifyingElement >= 0) {
        if (this.elementList[this.modifyingElement].sticker) {
          this.modifyingSticker =
            this.elementList[this.modifyingElement].sticker.number;
          this.modifyingElement = -1;
        }
      }
      if (ignore) return;
      this.openDialog();
    }
    // Tipografía
    if (
      option === 'tipografía' &&
      !this.typographyData.imageText.trim() &&
      !ignore
    ) {
      if (
        this.modifyingText < 0 &&
        this.customizerRules.texts.fixedAmountItems &&
        this.currentTextsAmount === this.customizerRules.texts.fixedAmount
      ) {
        return;
      }
      this.modifyingElement = -1;
      this.isEditing = true;
      this.getFixedLength();
    }
    // Lápiz
    if (option === 'lápiz') {
      this.resetSelected();
      this.canDraw = true;
      this.customizeOptions[this.customizeOptions.indexOf('lápiz')] =
        'confirmar';
    }
    this.selectedElementOption = '';
  }

  elementOptions() {
    let options: string[] = [];
    if (this.modifyingElement >= 0) {
      if (this.elementList[this.modifyingElement].sticker) {
        options = ['iconos'];
        if (this.showStickerPosition()) options.push(...['tamaño', 'angulo']);
        options.push('color');
      }
      if (
        this.elementList[this.modifyingElement].typography &&
        !this.isEditing
      ) {
        // if (this.isEditing) options = ['confirmar'];
        options = ['editar'];
        if (!this.isFixedSize()) options.push('tamaño');
        if (!this.isFixedPosition()) options.push('angulo');
        // options.push('tipografia');
        options.push('color');
      }
    }
    // else if (this.isEditing) {
    //   options = ['confirmar'];
    //   if (!this.isFixedSize() && this.isEditing) options.push('tamaño');
    //   if (!this.isFixedPosition()) options.push('angulo');
    //   options.push('tipografia');
    // }
    return options;
  }

  changeElementOption(option: string) {
    if (this.selectedOption === 'stickers') {
      this.modifyingSticker =
        this.elementList[this.modifyingElement].sticker.number;
      // this.modifyingElement = -1;
      if (option === 'iconos') {
        this.openDialog();
        return;
      }
    }
    if (this.selectedOption === 'tipografía') {
      const r = this.elementList[this.modifyingElement];
      if (option === 'editar') {
        this.onEditText(r);
        return;
      }
      if (option === 'confirmar') {
        this.exitEditing(this.typographyData);
        return;
      }
    }
    this.selectedElementOption = option;
  }

  get disableButton() {
    return this.isEditing && !this.typographyData.imageText.trim();
  }

  // ------------------------------------- CANVAS -------------------------------------
  // Changes the canvas aspect ratio
  onChangeAspectRatio(value: string) {
    let ratio: number;
    if (value === '1:1') ratio = 1;
    if (value === '3:4') ratio = 1.33;
    if (value === '9:16') ratio = 1.78;
    this.canvasHeight = Math.floor(ratio * this.canvasWidth);
    this.canvasRef.nativeElement.height = this.canvasHeight;
    const canvasClient = this.canvasRef.nativeElement.getBoundingClientRect();
    this.offsetX = canvasClient.left;
    this.offsetY = canvasClient.top;
    this.canvasRatio = value;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.textBaseline = 'top';
    this.context.textAlign = 'left';
    this.draw();
  }

  // ------------------------------------- STICKERS -------------------------------------

  // GETTERS

  // Shows stickers options if a sticker is selected
  showStickerOptions(): boolean {
    if (this.modifyingElement < 0) return false;
    if (this.elementList.length === 0) return false;
    if (this.elementList[this.modifyingElement].sticker) return true;
  }

  // Shows modify Size and Rotation sliders
  showStickerPosition(): boolean {
    return !this.elementList[this.modifyingElement].fixPositionOnly;
  }

  getStickerColors(): string[] {
    if (this.modifyingElement >= 0) {
      if (this.customizerRules.stickers.fixedAmountItems) {
        const element = this.elementList[this.modifyingElement].sticker.number;
        if (
          this.customizerRules.stickers.itemsRule[element].svgRule.fixedColors
        )
          return this.customizerRules.stickers.itemsRule[element].svgRule
            .colors;
        else return this.stickerColors;
      } else if (this.customizerRules.stickers.itemsRule[0].svgRule.fixedColors)
        return this.customizerRules.stickers.itemsRule[0].svgRule.colors;
      else return this.stickerColors;
    }
  }

  // Opens stickers dialog to choose a sticker
  openDialog() {
    if (!this.customizerRules.stickers.active) return;
    let stickerList: string[];
    if (this.customizerRules.stickers.fixedAmountItems) {
      if (this.modifyingSticker < 0) {
        if (
          this.currentStickersAmount ===
          this.customizerRules.stickers.fixedAmount
        )
          return;
        if (
          this.currentStickersAmount < this.customizerRules.stickers.fixedAmount
        ) {
          if (
            this.customizerRules.stickers.itemsRule[this.currentStickersAmount]
              .onlyFixed
          )
            stickerList =
              this.customizerRules.stickers.itemsRule[
                this.currentStickersAmount
              ].fixed;
          else stickerList = this.stickerList;
        }
      }
      // Verifies if there's an editing sticker
      if (this.modifyingSticker >= 0) {
        if (
          this.customizerRules.stickers.itemsRule[this.modifyingSticker]
            .onlyFixed
        ) {
          stickerList =
            this.customizerRules.stickers.itemsRule[this.modifyingSticker]
              .fixed;
        } else {
          stickerList = this.stickerList;
        }
      }
    } else if (this.customizerRules.stickers.itemsRule[0].onlyFixed) {
      stickerList = this.customizerRules.stickers.itemsRule[0].fixed;
    } else {
      stickerList = this.stickerList;
    }
    lockUI();
    const promises = stickerList.map((url) => this.fetchSVG(url));
    Promise.all(promises).then((result) => {
      this.dialog.open(CustomizerStickersComponent, {
        type: 'action-sheet',
        flags: ['no-header'],
        customClass: 'app-dialog transparent',
        // props: { stickers: stickerList },
        props: { stickers: result },
      });
      unlockUI();
    });
  }

  // DRAWERS

  // Modifies the size of a sticker
  modifySize() {
    const s = this.elementList[this.modifyingElement];
    if (!s.fixPositionOnly) {
      s.position.width = this.stickerSize;
      s.position.height = this.stickerSize;
      this.draw();
    }
  }

  // Changes sticker color, only should work on unicolor stickers
  onChangeStickerColor(color: string) {
    const newSticker = this.elementList[this.modifyingElement].sticker;

    const re = new RegExp(newSticker.color, 'g');
    const replacedColor = newSticker.decoded.replace(re, color);
    const encodedSVG = this.encodeSVG(replacedColor);
    const img = new Image();
    img.onload = async () => {
      this.draw();
      if (this.elementList[this.modifyingElement].fixPositionOnly)
        this.drawOutline(this.elementList[this.modifyingElement].position);
    };
    img.src = 'data:image/svg+xml;charset=UTF-8,' + encodedSVG;
    newSticker.image = img;
    newSticker.decoded = replacedColor;
    newSticker.color = color;
    this.elementList[this.modifyingElement].sticker = newSticker;
  }

  // Draws a sticker on the canvas
  drawImage(i: CanvasElement) {
    if (i.position.rotation !== 0) {
      this.context.translate(
        i.position.x + i.position.width / 2,
        i.position.y + i.position.height / 2
      );
      this.context.rotate(i.position.rotation);
      this.context.drawImage(
        i.sticker.image,
        -i.position.width / 2,
        -i.position.height / 2,
        i.position.width,
        i.position.height
      );
      this.context.rotate(-i.position.rotation);
      this.context.translate(
        -(i.position.x + i.position.width / 2),
        -(i.position.y + i.position.height / 2)
      );
    } else {
      this.context.drawImage(
        i.sticker.image,
        i.position.x,
        i.position.y
        // Temporal
        // i.position.width,
        // i.position.height
        // Temporal
      );
    }
  }

  // Encondes SVG HTML into a readable image source
  encodeSVG(data: string): string {
    if (data.indexOf(`http://www.w3.org/2000/svg`) < 0) {
      data = data.replace(/<svg/g, `<svg xmlns='http://www.w3.org/2000/svg'`);
    }
    data = data.replace(/>\s{1,}</g, `><`);
    data = data.replace(/\s{2,}/g, ` `);

    return data.replace(/[\r\n%#()<>?[\\\]^`{|}]/g, encodeURIComponent);
  }

  // Changes a Sticker that was already in the canvas
  modifySticker(
    url: string,
    element: CanvasElement,
    srcUrl: string,
    color?: string
  ) {
    element.sticker.url = srcUrl;
    let canvasSticker = new Image();
    const value = url
      .trim()
      .replace(/background-image:\s{0,}url\(/, ``)
      .replace(/["']{0,}data:image\/svg\+xml,/, ``)
      .replace(/["']\);{0,}$/, ``);
    let decodedValue = decodeURIComponent(value);
    const currentColor = this.getCurrentColor(decodedValue);
    // Temporal
    const dimensions = this.getWidthHeight(decodedValue);
    if (this.isMobile) {
      dimensions.width = Math.floor(+dimensions.width * 0.85) + '';
      dimensions.height = Math.floor(+dimensions.height * 0.85) + '';
      decodedValue = this.replaceWidthHeight(decodedValue, {
        width: +dimensions.width,
        height: +dimensions.height,
      });
    }
    // Temporal
    if (color) {
      const re = new RegExp('#' + currentColor[0], 'g');
      const replacedColor = decodedValue.replace(re, color);
      canvasSticker.src =
        'data:image/svg+xml;charset=UTF-8,' + this.encodeSVG(replacedColor);
      canvasSticker.onload = () => {
        this.draw();
      };
      element.sticker.decoded = replacedColor;
      element.sticker.color = color;
    } else {
      canvasSticker.src = 'data:image/svg+xml;charset=UTF-8,' + url;
      canvasSticker.onload = () => {
        this.draw();
      };
      element.sticker.decoded = decodedValue;
      element.sticker.color = '#' + currentColor[0];
    }
    // Temporal
    const stickerRules =
      this.customizerRules.stickers.itemsRule[this.modifyingSticker];
    if (stickerRules.fixPositionOnly) {
      element.position = {
        ...element.position,
        x: Math.floor(
          this.canvasWidth * (stickerRules.fixPosition.x / 100) -
            +dimensions.width / 2
        ),
        y: Math.floor(
          this.canvasHeight * (stickerRules.fixPosition.y / 100) -
            +dimensions.height / 2
        ),
        width: +dimensions.width,
        height: +dimensions.height,
      };
    }
    // Temporal
    element.sticker.image = canvasSticker;
    this.modifyingElement = this.elementList.indexOf(element);
  }

  // Sends a sticker for modification or adds a new one
  addSticker(url: string, id: number) {
    let srcUrl: string;
    let specifiedColor: string;
    if (this.customizerRules.stickers.fixedAmountItems) {
      if (this.modifyingSticker >= 0) {
        if (
          this.customizerRules.stickers.itemsRule[this.modifyingSticker]
            .onlyFixed
        ) {
          srcUrl =
            this.customizerRules.stickers.itemsRule[this.modifyingSticker]
              .fixed[id];
          if (
            this.customizerRules.stickers.itemsRule[this.modifyingSticker]
              .svgRule.fixedColors
          ) {
            if (
              this.customizerRules.stickers.itemsRule[this.modifyingSticker]
                .svgRule.colors.length > 0
            )
              specifiedColor =
                this.customizerRules.stickers.itemsRule[this.modifyingSticker]
                  .svgRule.colors[0];
          }
        } else srcUrl = this.stickerList[id];
      }
      if (this.modifyingSticker < 0) {
        if (
          this.customizerRules.stickers.itemsRule[this.currentStickersAmount]
            .onlyFixed
        ) {
          srcUrl =
            this.customizerRules.stickers.itemsRule[this.currentStickersAmount]
              .fixed[id];
          if (
            this.customizerRules.stickers.itemsRule[this.currentStickersAmount]
              .svgRule.fixedColors
          ) {
            if (
              this.customizerRules.stickers.itemsRule[
                this.currentStickersAmount
              ].svgRule.colors.length > 0
            )
              specifiedColor =
                this.customizerRules.stickers.itemsRule[
                  this.currentStickersAmount
                ].svgRule.colors[0];
          }
        } else srcUrl = this.stickerList[id];
      }
    } else if (this.customizerRules.stickers.itemsRule[0].onlyFixed) {
      srcUrl = this.customizerRules.stickers.itemsRule[0].fixed[id];
      if (this.customizerRules.stickers.itemsRule[0].svgRule.fixedColors) {
        if (
          this.customizerRules.stickers.itemsRule[0].svgRule.colors.length > 0
        )
          specifiedColor =
            this.customizerRules.stickers.itemsRule[0].svgRule.colors[0];
      }
    } else srcUrl = this.stickerList[id];
    //Temporal
    const value2 = url
      .trim()
      .replace(/background-image:\s{0,}url\(/, ``)
      .replace(/["']{0,}data:image\/svg\+xml,/, ``)
      .replace(/["']\);{0,}$/, ``);
    const decodedValue2 = decodeURIComponent(value2);
    let dimensions = this.getWidthHeight(decodedValue2);
    if (this.isMobile) {
      dimensions.width = Math.floor(+dimensions.width * 0.85) + '';
      dimensions.height = Math.floor(+dimensions.height * 0.85) + '';
    }
    // Temporal
    if (this.modifyingSticker >= 0) {
      const element = this.elementList.find(
        (el) => el.sticker && el.sticker.number === this.modifyingSticker
      );
      this.modifySticker(url, element, srcUrl, specifiedColor);
      return;
    }
    this.stickerSize = 125;
    this.elementRotation = 0;
    const canvasSticker = new Image();
    canvasSticker.src = 'data:image/svg+xml;charset=UTF-8,' + url;

    const stickerElement: CanvasElement = {
      sticker: {
        image: canvasSticker,
        number: this.currentStickersAmount,
        url: srcUrl,
      },
      position: {
        // Temporal
        // x: this.canvasWidth / 2 - this.stickerSize / 2,
        // y: this.canvasHeight / 2 - this.stickerSize / 2,
        // z: this.elementList.length < 1 ? 0 : this.elementList.length - 1,
        // width: this.stickerSize,
        // height: this.stickerSize,
        x: Math.floor(this.canvasWidth / 2 - +dimensions.width / 2),
        y: Math.floor(this.canvasHeight / 2 - +dimensions.height / 2),
        z: this.elementList.length < 1 ? 0 : this.elementList.length - 1,
        width: +dimensions.width,
        height: +dimensions.height,
        // Temporal
        rotation: 0,
      },
      isDragging: false,
      willDelete: false,
      originalSize: this.stickerSize,
      fixPositionOnly: false,
    };

    let willDrawOutline = false;
    if (this.customizerRules.stickers.fixedAmountItems) {
      if (
        this.currentStickersAmount < this.customizerRules.stickers.fixedAmount
      ) {
        const stickerRules =
          this.customizerRules.stickers.itemsRule[this.currentStickersAmount];
        if (stickerRules.fixPositionOnly) {
          // Temporal
          // stickerElement.position = stickerRules.fixPosition;
          stickerElement.position = {
            ...stickerRules.fixPosition,
            x: Math.floor(
              this.canvasWidth * (stickerRules.fixPosition.x / 100) -
                +dimensions.width / 2
            ),
            y: Math.floor(
              this.canvasHeight * (stickerRules.fixPosition.y / 100) -
                +dimensions.height / 2
            ),
            z: this.currentStickersAmount,
            width: +dimensions.width,
            height: +dimensions.height,
          };
          // Temporal
          stickerElement.fixPositionOnly = true;
          willDrawOutline = true;
        }
      }
    } else {
      const stickerRules = this.customizerRules.stickers.itemsRule[0];
      if (stickerRules.fixPositionOnly) {
        stickerElement.position.height =
          stickerRules.fixPosition.height && this.stickerSize;
        stickerElement.position.width =
          stickerRules.fixPosition.width && this.stickerSize;
        stickerElement.position.rotation = stickerRules.fixPosition.rotation;
        willDrawOutline = true;
      }
    }
    const current = this.currentStickersAmount;
    this.currentStickersAmount++;
    if (this.customizerRules.stickers.fixedAmountItems) {
      if (
        this.currentStickersAmount === this.customizerRules.stickers.fixedAmount
      ) {
        this.stickerMax = true;
      }
    }
    this.elementList.push(stickerElement);
    this.changeCustomizer('stickers', true);
    // this.stickerSize = width;
    // this.elementRotation = r.position.rotation / this.TO_RADIANS;
    canvasSticker.onload = () => {
      this.draw();
      if (willDrawOutline) this.drawOutline(stickerElement.position);
      const value = url
        .trim()
        .replace(/background-image:\s{0,}url\(/, ``)
        .replace(/["']{0,}data:image\/svg\+xml,/, ``)
        .replace(/["']\);{0,}$/, ``);
      let decodedValue = decodeURIComponent(value);
      const currentColor = this.getCurrentColor(decodedValue);
      if (this.isMobile) {
        decodedValue = this.replaceWidthHeight(decodedValue, {
          width: +dimensions.width,
          height: +dimensions.height,
        });
      }
      const stickerElements = this.elementList.filter(element => element.sticker)
      if (specifiedColor) {
        const re = new RegExp('#' + currentColor[0], 'g');
        const replacedColor = decodedValue.replace(re, specifiedColor);
        const canvasImage = new Image();
        stickerElements[current].sticker.image = canvasImage;
        stickerElements[current].sticker.color = specifiedColor;
        stickerElements[current].sticker.decoded = replacedColor;
        canvasImage.src =
          'data:image/svg+xml;charset=UTF-8,' + this.encodeSVG(replacedColor);
        canvasImage.onload = () => {
          this.draw();
        };
      } else {
        stickerElements[current].sticker.decoded = decodedValue;
        stickerElements[current].sticker.color =
          '#' + currentColor[0];
      }
    };
  }

  // Logic for getting the sticker hexadecimal color from its HTML
  getCurrentColor(svg: string) {
    const color = svg.match(/[0-9A-Fa-f]{6}/g);
    return color;
  }

  // Temporal
  // Returns specified width and height from SVG code
  getWidthHeight(svg: string) {
    let width = svg
      .match(/width="(.*?)" height/g)[0]
      .replace(/width="/, '')
      .replace(/" height/, '');
    const height = svg
      .match(/height="(.*?)" viewBox/g)[0]
      .replace(/height="/, '')
      .replace(/" viewBox/, '');
    return { width, height };
  }

  replaceWidthHeight(
    svg: string,
    dimensions: { width: number; height: number }
  ) {
    const newWidth = svg.replace(
      /width="(.*?)" height/,
      `width="${dimensions.width}" height`
    );
    const newHeight = newWidth.replace(
      /height="(.*?)" viewBox/,
      `height="${dimensions.height}" viewBox`
    );
    return newHeight;
  }
  // Temporal
  // --------------------------------------- TEXT ---------------------------------------

  // GETTERS

  showTextOptions() {
    if (this.isEditing) return true;
    if (this.modifyingElement >= 0) {
      if (this.elementList[this.modifyingElement].typography) return true;
    }
  }

  isFixedPosition() {
    if (this.isEditing) return true;
    if (this.modifyingElement >= 0)
      return this.elementList[this.modifyingElement].fixPositionOnly;
  }

  isFixedSize() {
    if (this.modifyingElement >= 0)
      return this.elementList[this.modifyingElement].typography.fixSizeOnly;
    if (this.isEditing) {
      if (this.customizerRules.texts.fixedAmountItems) {
        let textIndex = this.currentTextsAmount;
        if (this.customizerRules.texts.itemsRule[textIndex].fixSizeOnly) {
          this.typographyData.fontSize =
            this.customizerRules.texts.itemsRule[textIndex].fixSize + '';
        }
        return this.customizerRules.texts.itemsRule[textIndex].fixSizeOnly;
      }
    }
  }

  getFixedLength() {
    if (this.modifyingElement >= 0) {
      if (this.customizerRules.texts.fixedAmountItems) {
        const element =
          this.elementList[this.modifyingElement].typography.number;
        if (this.customizerRules.texts.itemsRule[element].fixedLengthOnly)
          this.currentMaxLength =
            this.customizerRules.texts.itemsRule[element].fixedLength;
        else this.currentMaxLength = 200;
      } else if (this.customizerRules.texts.itemsRule[0].fixedLengthOnly)
        this.currentMaxLength =
          this.customizerRules.texts.itemsRule[0].fixedLength;
      else this.currentMaxLength = 200;
    } else {
      if (this.customizerRules.texts.fixedAmountItems) {
        let textIndex = this.currentTextsAmount;
        if (this.customizerRules.texts.itemsRule[textIndex].fixedLengthOnly)
          this.currentMaxLength =
            this.customizerRules.texts.itemsRule[textIndex].fixedLength;
        else this.currentMaxLength = 200;
      } else if (this.customizerRules.texts.itemsRule[0].fixedLengthOnly)
        this.currentMaxLength =
          this.customizerRules.texts.itemsRule[0].fixedLength;
      else this.currentMaxLength = 200;
    }
  }

  checkMaxLength(event: InputEvent) {
    let { value } = event.target as HTMLInputElement;
    this.typographyData.imageText = value;
    if (value.length >= this.currentMaxLength) {
      this.typographyData.imageText = this.typographyData.imageText.substring(
        0,
        this.currentMaxLength
      );
    }
  }

  getFontStyles(): string[] {
    if (this.modifyingElement >= 0) {
      if (this.customizerRules.texts.fixedAmountItems) {
        const element =
          this.elementList[this.modifyingElement].typography.number;
        if (this.customizerRules.texts.itemsRule[element].onlyFixedFonts)
          return this.customizerRules.texts.itemsRule[element].fixedFonts;
        else return this.fontStyles;
      } else if (this.customizerRules.texts.itemsRule[0].onlyFixedFonts)
        return this.customizerRules.texts.itemsRule[0].fixedFonts;
      else return this.fontStyles;
    }
    if (this.isEditing) {
      if (this.customizerRules.texts.fixedAmountItems) {
        let textIndex = this.currentTextsAmount;
        if (this.customizerRules.texts.itemsRule[textIndex].onlyFixedFonts)
          return this.customizerRules.texts.itemsRule[textIndex].fixedFonts;
        else return this.fontStyles;
      } else if (this.customizerRules.texts.itemsRule[0].onlyFixedFonts)
        return this.customizerRules.texts.itemsRule[0].fixedFonts;
      else return this.fontStyles;
    }
  }

  getFontColors(): string[] {
    if (this.modifyingElement >= 0) {
      if (this.customizerRules.texts.fixedAmountItems) {
        const element =
          this.elementList[this.modifyingElement].typography.number;
        if (this.customizerRules.texts.itemsRule[element].onlyFixedColor)
          return this.customizerRules.texts.itemsRule[element].fixedColors;
        else return this.fontColors;
      } else if (this.customizerRules.texts.itemsRule[0].onlyFixedColor)
        return this.customizerRules.texts.itemsRule[0].fixedColors;
      else return this.fontColors;
    }
    if (this.isEditing) {
      if (this.customizerRules.texts.fixedAmountItems) {
        let textIndex = this.currentTextsAmount;
        if (this.customizerRules.texts.itemsRule[textIndex].onlyFixedColor)
          return this.customizerRules.texts.itemsRule[textIndex].fixedColors;
        else return this.fontColors;
      } else if (this.customizerRules.texts.itemsRule[0].onlyFixedColor)
        return this.customizerRules.texts.itemsRule[0].fixedColors;
      else return this.fontColors;
    }
  }

  // Resizes textarea on fontSize change
  triggerResize() {
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  // Changes font color. If not editing text, draws the new color
  onChangeFontColor(color: string) {
    this.typographyData.fontColor = color;
    if (this.isEditing) return;
    const element = this.elementList[this.modifyingElement];
    element.typography.color = this.typographyData.fontColor;

    /* 
      Hardcoded solution 08/04/2022
    */
    this.elementList.forEach((element) => {
      if (element.typography) {
        element.typography.color = this.typographyData.fontColor;
        this.draw();
      }
    });

    /* 
      End of Hardcoded solution 08/04/2022
    */

    this.draw();
    this.drawOutline(element.position, true);
  }

  // Changes text font. If not editing text, draws the new font
  onChangeFontStyle(style: string) {
    this.typographyData.fontStyle = style;
    if (this.isEditing) return;
    const element = this.elementList[this.modifyingElement];
    element.typography.font = this.typographyData.fontStyle;
    // this.draw();
    this.modifyingText = element.typography.number;
    this.exitEditing({
      imageText: element.typography.text,
      fontColor: element.typography.color,
      fontSize: element.typography.size,
      fontStyle: style,
    });
    this.drawOutline(element.position, true);
  }

  // Changes FontSize out of editing. Needs to recalculate width and height WIP
  // onChangeFontSize() {
  // }

  // Draws text on te canvas.
  drawText(t: CanvasElement) {
    const lineBreaks = t.typography.text.split('\n');
    let line = '';
    let y = -(t.position.height / 2);
    this.context.font = `${t.typography.size}px ${t.typography.font}`;
    this.context.fillStyle = t.typography.color;
    for (let lb = 0; lb < lineBreaks.length; lb++) {
      const words = lineBreaks[lb].split(' ');

      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = this.context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > 400 && n > 0) {
          const lineWidth = this.context.measureText(line).width;
          this.context.translate(
            t.position.x + t.position.width / 2,
            t.position.y + t.position.height / 2
          );
          this.context.rotate(t.position.rotation);
          if (t.typography.color === this.selectedBackgroundColor) {
            if (t.typography.color !== '#000000')
              this.context.fillStyle = 'black';
            else this.context.fillStyle = 'white';
            this.context.fillText(line, 1 - lineWidth / 2, y + 1);
            this.context.fillStyle = t.typography.color;
          }
          this.context.fillText(line, -(lineWidth / 2), y);
          this.context.rotate(-t.position.rotation);
          this.context.translate(
            -(t.position.x + t.position.width / 2),
            -(t.position.y + t.position.height / 2)
          );
          line = words[n] + ' ';
          y += parseInt(t.typography.size);
        } else {
          line = testLine;
        }
      }
      const lineWidth = this.context.measureText(line).width;
      this.context.translate(
        t.position.x + t.position.width / 2,
        t.position.y + t.position.height / 2
      );
      this.context.rotate(t.position.rotation);
      if (t.typography.color === this.selectedBackgroundColor) {
        if (t.typography.color !== '#000000') this.context.fillStyle = 'black';
        else this.context.fillStyle = 'white';
        this.context.fillText(line, 1 - lineWidth / 2, y + 1);
        this.context.fillStyle = t.typography.color;
      }
      this.context.fillText(line, -(lineWidth / 2), y);
      this.context.rotate(-t.position.rotation);
      this.context.translate(
        -(t.position.x + t.position.width / 2),
        -(t.position.y + t.position.height / 2)
      );

      line = '';
      y += parseInt(t.typography.size);
    }
  }

  // Sets modifying sticker to currentText
  onEditText(r: CanvasElement) {
    this.modifyingText = r.typography.number;
    // this.customizeOptions[this.customizeOptions.indexOf('tipografía')] =
    //   'confirmar';
    this.typographyData = {
      imageText: r.typography.text,
      fontSize: r.typography.size,
      fontStyle: r.typography.font,
      fontColor: r.typography.color,
    };
    r.typography.hidden = true;
    this.draw();
    this.isEditing = true;
    this.getFixedLength();
  }

  onEnterPress() {
    this.exitEditing(this.typographyData);
  }

  // Gets the max width of a multiline text element
  getMaxWidth(textString: string[]) {
    let greatestWidth: number[] = [];

    textString.forEach((line: string, i: number) => {
      const lineWidth = this.context.measureText(line).width;
      greatestWidth.push(lineWidth);
    });

    return Math.max(...greatestWidth);
  }
  
  validateInput($event: KeyboardEvent) {
    if(this.isLongText && (/[a-zA-Z0-9]/.test($event.key) || $event.code === 'Space')) return $event;
    else if(/[a-zA-Z0-9]/.test($event.key)) return $event;
    else return $event.preventDefault();
  }

  // Text input below canvas
  setInputText() {
    const textElements = this.elementList.filter(element => element.typography)
    this.hiddenFontText = textElements
      .sort((a, b) =>
        a.position.z > b.position.z ? 1 : b.position.z > a.position.z ? -1 : 0
      )
      .reduce(
        (prev, curr) => prev + curr.typography.text,
        ''
      );
  }

  // Changes text from input below canvas
  onChangeInput() {
    if(!this.hiddenFontText) return;
    const textElements = this.elementList
    .filter(element => element.typography)
    .sort((a, b) =>
      a.position.z > b.position.z ? 1 : b.position.z > a.position.z ? -1 : 0
    );
    if(textElements.length > 1) {
      const letters = this.hiddenFontText.split('');
      letters.forEach((letter, index) => {
        this.context.font = `${textElements[index].typography.size}px ${textElements[index].typography.font}`;
        let width = this.context.measureText(letter).width;
        textElements[index].typography.text = letter.toUpperCase();
        textElements[index].position.width = width;
        textElements[index].position.x = Math.floor(this.canvasWidth * (this.customizerRules.texts.itemsRule[index].fixPosition.x / 100) - width / 2);
        this.draw();
        this.drawOutline(textElements[index].position, true);
      })
    } else {
      let width = this.context.measureText(this.hiddenFontText).width;
      this.context.font = `${textElements[0].typography.size}px ${textElements[0].typography.font}`;
      textElements[0].typography.text = this.inputMaxLength < 4 ? this.hiddenFontText.toUpperCase() : this.hiddenFontText;
      textElements[0].position.width = width;
      textElements[0].position.x = Math.floor(this.canvasWidth * (this.customizerRules.texts.itemsRule[0].fixPosition.x / 100) - width / 2);
      this.draw();
      if(!this.willHideInput) this.drawOutline(textElements[0].position, true);
    }
  }
  // Text input below canvas

  // Modifies a text element that was already in the canvas
  modifyText(width: number, height: number, textData: TextData) {
    const { imageText, fontSize, fontStyle, fontColor } = textData;
    const text = this.elementList[this.modifyingElement];
    const textElement = {
      typography: {
        text: imageText,
        size: fontSize,
        font: fontStyle,
        color: fontColor,
        hidden: false,
      },
      position: {
        width: width,
        height: height,
      },
      originalSize: width,
    };
    if (text.fixPositionOnly) {
      textElement.position['x'] =
        text.position.x + text.position.width / 2 - width / 2;
    }
    this.elementList[this.modifyingElement].typography = {
      ...text.typography,
      ...textElement.typography,
    };
    this.elementList[this.modifyingElement].originalSize = width;
    this.elementList[this.modifyingElement].position = {
      ...text.position,
      ...textElement.position,
    };

    this.typographyData.imageText = '';
    // Text input below canvas
    if(this.willShowInput) this.setInputText();
    this.draw();
  }

  // Exits exit mode and sends the text for modification or creates a new element
  exitEditing(textData: TextData) {
    let { imageText, fontSize, fontStyle, fontColor } = textData;
    if (this.isEditing) {
      this.isEditing = false;
      this.selectedElementOption = '';
    }
    // this.customizeOptions[this.customizeOptions.indexOf('confirmar')] =
    //   'tipografía';

    if (!imageText.trim()) {
      this.typographyData.imageText = '';
      if (this.modifyingElement >= 0)
        this.elementList[this.modifyingElement].typography.hidden = false;
      this.draw();
      return;
    }
    imageText.trim();
    this.elementRotation = 0;

    this.context.font = `${fontSize}px ${fontStyle}`;
    if (imageText.length < 4) imageText = imageText.toUpperCase();

    const getWidth = (textString: string[]) => {
      let greatestWidth: number[] = [];

      textString.forEach((line: string, i: number) => {
        const lineWidth = this.context.measureText(line).width;
        greatestWidth.push(lineWidth);
      });

      return Math.max(...greatestWidth);
    };

    let width: number;
    let height: number;

    width = this.context.measureText(imageText).width;
    height = parseInt(fontSize);

    if (width > 400 || imageText.includes('\n')) {
      let text: string[] = [];

      const lineBreaks = imageText.split('\n');
      let line = '';
      let y = 0;
      for (let lb = 0; lb < lineBreaks.length; lb++) {
        const words = lineBreaks[lb].split(' ');

        for (var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = this.context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > 400 && n > 0) {
            text.push(line);
            line = words[n] + ' ';
            y++;
          } else {
            line = testLine;
          }
        }
        text.push(line);
        line = '';
        y++;
      }
      width = getWidth(text);
      height = Math.floor(y * parseInt(fontSize));
    }

    if (this.modifyingText >= 0) {
      this.modifyText(width, height, {
        imageText,
        fontSize,
        fontColor,
        fontStyle,
      });
      return;
    }

    let x: number;
    let y: number;
    x = Math.floor(this.canvasWidth / 2 - width / 2);
    y = Math.floor(this.canvasHeight / 2 - height / 2);
    const textElement: CanvasElement = {
      typography: {
        text: imageText,
        size: fontSize,
        font: fontStyle,
        color: fontColor,
        fixSizeOnly: false,
        number: this.currentTextsAmount,
      },
      position: {
        x,
        y,
        z: this.elementList.length < 1 ? 0 : this.elementList.length - 1,
        width,
        height,
        rotation: 0,
      },
      isDragging: false,
      willDelete: false,
      originalSize: width,
      fixPositionOnly: false,
    };
    let willDrawOutline = false;
    if (this.customizerRules.texts.fixedAmountItems) {
      if (this.currentTextsAmount < this.customizerRules.texts.fixedAmount) {
        const textRules =
          this.customizerRules.texts.itemsRule[this.currentTextsAmount];
        if (textRules.fixPositionOnly) {
          // Temporal
          // textElement.position.x = textRules.fixPosition.x - width / 2;
          // textElement.position.y = textRules.fixPosition.y;
          textElement.position.x = Math.floor(
            this.canvasWidth * (textRules.fixPosition.x / 100) - width / 2
          );
          textElement.position.y = Math.floor(
            this.canvasHeight * (textRules.fixPosition.y / 100) - height / 2
          );
          textElement.position.z = this.currentTextsAmount;
          // Temporal
          textElement.position.rotation = textRules.fixPosition.rotation;
          textElement.fixPositionOnly = true;
          // willDrawOutline = true;
        }
        if (textRules.fixSizeOnly) {
          textElement.typography.size = textRules.fixSize + '';
          textElement.typography.fixSizeOnly = true;
        }
        if (
          textElement.typography.font === 'Oval' ||
          textElement.typography.font === 'Elegant'
        ) {
          willDrawOutline = false;
        }
      }
    } else {
      const textRules = this.customizerRules.texts.itemsRule[0];
      if (textRules.fixPositionOnly) {
        textElement.position.rotation = textRules.fixPosition.rotation;
      }
      if (textRules.fixSizeOnly) {
        textElement.typography.size = textRules.fixSize + '';
        textElement.typography.fixSizeOnly = true;
      }
    }

    this.modifyingText = -1;
    this.elementList.push(textElement);
    this.typographyData.imageText = '';
    this.modifyingElement = this.elementList.length - 1;
    this.currentTextsAmount++;
    if (this.customizerRules.texts.fixedAmountItems) {
      if (this.currentTextsAmount === this.customizerRules.texts.fixedAmount) {
        this.textMax = true;
      }
    }
    this.draw();
    // Text input below canvas
    if (!this.willHideInput) this.drawOutline(textElement.position, true);
  }
  // ------------------------------------ LINES --------------------------------------

  // Returns line colors, either fixed or default
  getLineColors(): string[] {
    if (this.customizerRules.lines.onlyFixedColor)
      return this.customizerRules.lines.fixedColors;
    else return this.lineColors;
  }

  // Draws a line
  drawLine(p1: LinePoints, p2: LinePoints) {
    this.context.beginPath();
    this.context.moveTo(p1.x, p1.y);
    this.context.lineTo(p2.x, p2.y);
    this.context.stroke();
  }

  // --------------------------------- BACKGROUND COLOR ---------------------------------

  // Returns background colors, either fixed or default
  getBackgroundColors() {
    if (this.customizerRules.backgroundColor.onlyFixed)
      return this.customizerRules.backgroundColor.fixed;
    else return this.backgroundColors;
  }

  // Changes background color. Background Image takes priority if one is selected
  onChangeBackgroundColor(color: string) {
    this.selectedBackgroundColor = color;
    this.draw();
  }

  // Draws the selected Background color. Background Image takes priority if one is selected
  drawBackgroundColor() {
    this.context.fillStyle = this.selectedBackgroundColor;
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  // +++++++++++++++++++++++++++++++++ BACKGROUND COLOR +++++++++++++++++++++++++++++++++

  // ------------------------------ BACKGROUND IMAGE ---------------------------------

  // Get background images
  getBackgroundImages(): string[] {
    if (this.customizerRules.backgroundImage.onlyFixed)
      return this.customizerRules.backgroundImage.fixed;
    else return this.backgroundImageOptions;
  }

  onChangeBackgroundImage(url: string) {
    if (this.imageElement && this.imageElement.src)
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.imageElement = new Image();
    this.imageElement.src = url;
    this.selectedBackgroundColor = 'none';
    this.draw();
    this.selectedBackgroundImage = url;
    this.imageFile = null;
  }

  // Uploads background image to Canvas
  uploadBackground(files: FileList) {
    if (this.imageElement && this.imageElement.src)
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageElement = new Image();
      this.imageElement.src = event.target.result;
      this.imageElement.onload = () => {
        this.selectedBackgroundColor = 'none';
        this.draw();
      };
    };
    reader.onerror = (event: any) => {
      console.log('File could not be read: ' + event.target.error.code);
    };
    reader.readAsDataURL(files.item(0));
    this.imageFile = files.item(0);
    this.selectedBackgroundImage = null;
  }

  // Draws the background Image if there's one
  drawBackgroundImage() {
    this.context.filter = `grayscale(${this.filters.bw}%) sepia(${this.filters.sepia}%) contrast(${this.filters.contrast}%)`;
    this.context.drawImage(
      this.imageElement,
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    );
    this.context.filter = 'none';
  }

  // ++++++++++++++++++++++++++++++ BACKGROUND IMAGE ++++++++++++++++++++++++++++++

  // Converts image to File
  async urltoFile(dataUrl: string, fileName: string): Promise<File> {
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: 'image/png' });
  }

  // Creates or updates CustomizerValue
  async onSave() {
    if (this.canDraw || this.isEditing) return;
    if (this.customizerRules.stickers.fixedAmountItems) {
      if (
        this.currentStickersAmount < this.customizerRules.stickers.fixedAmount
      )
        return;
    }
    if (this.customizerRules.texts.fixedAmountItems) {
      if (this.currentTextsAmount < this.customizerRules.texts.fixedAmount)
        return;
    }
    try {
      lockUI();
      const stickers: StickerInput[] = this.elementList
        .filter((el) => el.sticker)
        .map((el) => ({
          url: el.sticker.url,
          position: {
            x: el.position.x,
            y: el.position.y,
            z: el.position.z,
            width: el.position.width,
            height: el.position.height,
            rotation: el.position.rotation,
          },
          svgOptions: {
            color: el.sticker.color,
          },
        }))
        .sort((a, b) =>
          a.position.z > b.position.z ? 1 : b.position.z > a.position.z ? -1 : 0
        );
      const texts: TextInput[] = this.elementList
        .filter((el) => el.typography)
        .map((el) => ({
          color: el.typography.color,
          text: el.typography.text,
          font: el.typography.font,
          size: +el.typography.size,
          position: {
            x: el.position.x,
            y: el.position.y,
            z: el.position.z,
            width: el.position.width,
            height: el.position.height,
            rotation: el.position.rotation,
          },
        }))
        .sort((a, b) =>
          a.position.z > b.position.z ? 1 : b.position.z > a.position.z ? -1 : 0
        );
      const lines: LinesInput[] = this.elementList
        .filter((el) => el.lines)
        .map((el) => ({
          color: el.lines.color,
          width: el.lines.width,
          points: el.lines.points,
          position: {
            z: el.position.z,
          },
        }));
      let backgroundImage: BackgroundImageInput = {};
      if (this.customizerRules.backgroundImage.active) {
        if (this.customizerRules.backgroundImage.onlyFixed) {
          if (this.selectedBackgroundImage)
            backgroundImage.url = this.selectedBackgroundImage;
        } else {
          if (this.imageFile) {
            backgroundImage.image = this.imageFile;
            backgroundImage.url = null;
          }
          if (this.selectedBackgroundImage) {
            backgroundImage.url = this.selectedBackgroundImage;
            backgroundImage.image = null;
          }
        }
        backgroundImage.filters = this.filters;
      }

      if (!this.selectedBackgroundImage) {
        if (!this.imageFile) {
          if (!this.customizerRules.backgroundColor.active) {
            this.customizerRules.backgroundColor.active = true;
          }
        }
      }
      this.draw();
      const url = this.canvasRef.nativeElement.toDataURL('image/png');
      const file = await this.urltoFile(
        url,
        (this.customizerRuleID ?? this.customizerValueID) + '.png'
      );
      const customizerValues: CustomizerValueInput = {
        rules: this.customizerRuleID ?? this.customizerValueID,
        backgroundImage,
        backgroundColor: {
          color: this.selectedBackgroundColor,
        },
        canvas: {
          rounded: false,
          size: {
            height: this.canvasHeight,
            width: this.canvasWidth,
            ratio: this.canvasRatio,
          },
        },
        stickers,
        texts,
        lines,
        preview: file,
      };
      // console.log(customizerValues);
      // unlockUI();
      // return;
      if (!this.customizerValueID) {
        unlockUI();
        this.saveDataInHeader(customizerValues);
        this.router.navigate([`/ecommerce/provider-store/gift-message`]);
        if (!this.header.isComplete.qualityQuantity)
          this.router.navigate([`/ecommerce/provider-store`]);
        else if (
          !this.header.isComplete.message &&
          this.header.saleflow.module.post &&
          this.header.saleflow.module.post.isActive
        )
          this.router.navigate([`ecommerce/provider-store/gift-message`]);
        else this.router.navigate([`ecommerce/provider-store/user-info`]);
      } else {
        await this.customizerValueService.updateCustomizerValue(
          customizerValues,
          this.customizerValueID
        );
        this.router.navigate([`/ecommerce/order-info/${this.itemId}`]);
        unlockUI();
      }
    } catch (err) {
      console.log(err);
    }
    this.draw();
  }

  saveDataInHeader(customizerValues: CustomizerValueInput) {
    // this.header.customizer = {...customizerValues};
    // const customizerElementList = [...this.elementList];
    // console.log(customizerElementList);
    // this.header.customizerData = {
    //   willModify: false,
    //   elementList: customizerElementList.map((value) => { return {...value}}),
    //   backgroundUrl: this.selectedBackgroundImage,
    //   backgroundImage: this.imageFile,
    //   backgroundColor: this.selectedBackgroundColor,
    //   stickersAmount: this.currentStickersAmount,
    //   textsAmount: this.currentTextsAmount,
    //   id: this.customizerRuleID,
    // };
    // this.header.isComplete.giftABox.customizer = true;
    this.header.customizer = customizerValues;
    this.header.customizerData = {
      ...this.header.customizerData,
      willModify: false,
      elementList: this.elementList,
      backgroundUrl: this.selectedBackgroundImage,
      backgroundImage: this.imageFile,
      backgroundColor: this.selectedBackgroundColor,
      stickersAmount: this.currentStickersAmount,
      textsAmount: this.currentTextsAmount,
      id: this.customizerRuleID,
    };
    this.header.isComplete.customizer = true;
  }

  goBack() {
    if (this.customizerValueID)
      this.router.navigate([`/ecommerce/order-info/${this.itemId}`]);
    else
      this.router.navigate([`/ecommerce/provider-store/quantity-and-quality`]);
  }

  // Searches Stickers, currently doing nothing
  search(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // search function
    }
  }

  // Currently removes an element from the canvas
  onDiscard() {
    if (this.elementList.length > 0 && this.selectedOption !== 'efectos') {
      if (this.elementList[this.elementList.length - 1].typography) {
        this.typographyData.imageText = '';
        this.currentTextsAmount--;
      } else {
        this.currentStickersAmount--;
      }
      this.elementList.pop();
      this.resetSelected();
    }
    this.draw();
  }

  // Restart the canvas to its original state
  restart() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.elementList = [];
    this.selectedBackgroundColor = 'none';
  }

  // Clears the canvas, leaves it blank
  clear() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  // Handler for rotating touch event on mobile canvas
  onRotateStart(e: any) {
    this.elementRotation = Math.min(
      Math.max(Math.floor(e.gesture.rotation), -180),
      180
    );
    this.rotateElement();
  }

  // Rotates the selected sticker or text
  rotateElement() {
    const s = this.elementList[this.modifyingElement];
    if (!s.fixPositionOnly) {
      s.position.rotation = this.elementRotation * this.TO_RADIANS;
      this.draw();
    }
  }

  // Draws an outline around the selected fixed element
  drawOutline(position: Position, isText?: boolean) {
    this.context.strokeStyle = '#820AE8';
    const additonalWidth = isText ? position.width * 0.1 : 0;
    const additonalHeight = isText ? position.height * 0.1 : 0;
    this.context.strokeRect(
      position.x - additonalWidth,
      position.y - additonalHeight,
      position.width + additonalWidth,
      position.height
    );
  }

  // Draws everything on the canvas
  draw() {
    this.clear();
    if (this.imageElement) this.drawBackgroundImage();
    if (
      this.customizerRules.backgroundColor.active &&
      this.selectedBackgroundColor !== 'none'
    )
      this.drawBackgroundColor();
    for (let i = 0; i < this.elementList.length; i++) {
      var r = this.elementList[i];
      if (r.sticker && r.sticker.image) {
        this.drawImage(r);
        if (this.dragok && r.isDragging) this.drawOutline(r.position);
      }
      if (
        r.typography &&
        !r.typography.hidden &&
        r.typography.font !== 'Oval' &&
        r.typography.font !== 'Elegant'
      ) {
        this.drawText(r);
        if (this.dragok && r.isDragging) this.drawOutline(r.position, true);
      }
      // if (this.dragok && r.isDragging) this.drawOutline(r.position);

      if (r.lines) {
        this.context.lineWidth = this.elementList[i].lines.width;
        this.context.strokeStyle = this.elementList[i].lines.color;
        for (let p = 0; p < this.elementList[i].lines.points.length - 1; p++) {
          const p1 = this.elementList[i].lines.points[p];
          const p2 = this.elementList[i].lines.points[p + 1];
          this.drawLine(p1, p2);
        }
      }
    }
  }

  // Prevents mouse default
  preventDefault(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Gets mouse position in the canvas
  getPos(e): { x: number; y: number } {
    // const mx = e.pageX - this.offsetX;
    // const my = e.pageY - this.offsetY;
    if (this.offsetY < 0 || this.offsetY > 1000) {
      const { left, top } =
        this.canvasRef.nativeElement.getBoundingClientRect();
      this.offsetX = left;
      this.offsetY = top;
    }
    const mx = e.clientX - this.offsetX;
    const my = e.clientY - this.offsetY;
    return { x: mx, y: my };
  }

  // Adds deletion to current element if inside specified area
  addDelete(el: CanvasElement) {
    el.willDelete = true;
  }

  // Removes deletion to current element if outside specified area
  removeDelete(el: CanvasElement) {
    el.willDelete = false;
  }

  // Mobile touch event for sticker size modification
  pinchMove(e) {
    if (!this.dragok) return;
    this.dragok = false;
    if (this.elementList[this.modifyingElement].typography) return;
    if (this.stickerSize >= 100 && this.stickerSize <= 300) {
      this.stickerSize = Math.floor(
        Math.min(
          Math.max(
            this.elementList[this.modifyingElement].originalSize *
              e.gesture.scale,
            100
          ),
          300
        )
      );
    }
    this.modifySize();
  }

  // Double click mouse event
  dbClicked(e) {
    const m = this.getPos(e);

    for (let i = this.elementList.length - 1; i >= 0; i--) {
      const r = this.elementList[i];
      if (
        m.x >= r.position.x &&
        m.x <= r.position.x + r.position.width &&
        m.y >= r.position.y &&
        m.y <= r.position.y + r.position.height
      ) {
        if (r.sticker) {
          this.changeCustomizer('stickers', true);
        }
        if (r.typography) {
          this.modifyingElement = i;
          this.onEditText(r);
        }
        break;
      }
    }
  }

  // Mouse down and touch event
  mouseDown(e) {
    const { left, top } = this.canvasRef.nativeElement.getBoundingClientRect();
    this.offsetX = left;
    this.offsetY = top;
    if (this.isEditing) {
      this.exitEditing(this.typographyData);
      return;
    }
    if (e.touches && e.touches.length < 2) e = e.touches[0];

    const m = this.getPos(e);

    if (this.canDraw) {
      this.isDrawing = true;
      this.elementList.push({
        lines: {
          color: this.lineColor,
          width: this.lineWidth,
          points: [
            {
              x: m.x,
              y: m.y,
            },
          ],
        },
        position: {
          z: this.elementList.length < 1 ? 0 : this.elementList.length - 1,
        },
      });
      return;
    }

    for (let i = this.elementList.length - 1; i >= 0; i--) {
      const r = this.elementList[i];

      if (
        !r.lines &&
        m.x >= r.position.x &&
        m.x <= r.position.x + r.position.width &&
        m.y >= r.position.y &&
        m.y <= r.position.y + r.position.height
      ) {
        // DoubleClick Logic
        if (this.touchtime == 0) {
          this.touchtime = new Date().getTime();
        } else {
          if (new Date().getTime() - this.touchtime < 150) {
            this.dbClicked(e);
            this.touchtime = 0;
            return;
          } else {
            this.touchtime = new Date().getTime();
          }
        }
        // DoubleClick Logic
        this.draw();
        if (r.sticker) {
          this.changeCustomizer('stickers', true);
          this.stickerSize = r.position.width;
          this.drawOutline(r.position);
        }
        if (
          r.typography &&
          r.typography.font !== 'Oval' &&
          r.typography.font !== 'Elegant'
        ) {
          // if (r.typography) {
          this.changeCustomizer('tipografía', true);
          this.drawOutline(r.position, true);
        }
        if (r.typography?.font !== 'Oval' && r.typography?.font !== 'Elegant') {
          if (r.fixPositionOnly) {
            this.elementList.unshift(this.elementList.splice(i, 1)[0]);
            this.modifyingElement = 0;
            // this.modifyingElement = i;
          } else {
            this.elementList.push(this.elementList.splice(i, 1)[0]);
            this.modifyingElement = this.elementList.length - 1;
            // this.modifyingElement = i;
            this.elementRotation = r.position.rotation / this.TO_RADIANS;
            this.dragok = true;
            r.isDragging = true;
          }
        }
        // this.drawOutline(r.position);
        break;
      } else {
        this.draw();
        this.resetSelected();
      }
    }

    this.startX = m.x;
    this.startY = m.y;
    if (this.dragok || this.isDrawing || this.modifyingElement >= 0) {
      return false;
    }
  }

  // Mouse and touch move event
  mouseMove(e) {
    if (e.touches) e = e.touches[0];
    const m = this.getPos(e);

    if (this.isDrawing && this.elementList.length > 0) {
      this.elementList[this.elementList.length - 1].lines.points.push({
        x: m.x,
        y: m.y,
      });
      this.draw();
      return;
    }

    if (this.dragok) {
      let dx = m.x - this.startX;
      let dy = m.y - this.startY;

      for (let i = 0; i < this.elementList.length; i++) {
        let r = this.elementList[i];
        if (r.isDragging) {
          if (
            m.x >= this.canvasWidth * 0.46 &&
            m.x <= this.canvasWidth * 0.54 &&
            m.y >= this.canvasHeight * 0.8 &&
            m.y <= this.canvasHeight * 0.89
          ) {
            if (!r.willDelete) this.addDelete(r);
          } else {
            if (r.willDelete) this.removeDelete(r);
          }
          r.position.x += dx;
          r.position.y += dy;
        }
      }
      this.startX = m.x;
      this.startY = m.y;
      this.draw();
    }
  }

  // Mouse and touch up event
  mouseUp() {
    if (this.isDrawing) {
      this.isDrawing = false;
    }
    if (this.modifyingElement >= 0) {
      for (let i = 0; i < this.elementList.length; i++) {
        const s = this.elementList[i];
        // if (!s.fixPositionOnly) s.position.z = i;
        if (s.isDragging) s.isDragging = false;
        if (this.elementList[this.modifyingElement].sticker)
          this.elementList[this.modifyingElement].originalSize =
            this.stickerSize;
        if (s.willDelete) {
          if (s.sticker) {
            this.currentStickersAmount--;
            this.stickerMax = false;
          }
          if (s.typography) {
            this.currentTextsAmount--;
            this.textMax = false;
          }
          this.resetSelected();
          this.elementList.splice(i, 1);
          this.draw();
        }
      }
    }
    if (this.dragok) this.dragok = false;
  }

  // Mouse scroll events
  isMouseDown: boolean;
  scrollStartX: number;
  scrollLeft: any;
  startDragging(e, flag, el) {
    this.isMouseDown = true;
    this.scrollStartX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging(e, flag) {
    this.isMouseDown = false;
  }

  moveEvent(e, el) {
    e.preventDefault();
    if (!this.isMouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.scrollStartX;
    el.scrollLeft = this.scrollLeft - scroll;
  }
}
