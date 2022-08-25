import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customizer, CustomizerInput } from 'src/app/core/models/customizer';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { CustomizerService } from 'src/app/core/services/customizer.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-customizer-list',
  templateUrl: './customizer-list.component.html',
  styleUrls: ['./customizer-list.component.scss'],
})
export class CustomizerListComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customizerService: CustomizerService,
    private customizerValueService: CustomizerValueService,
    private merchant: MerchantsService
  ) {}

  customizerID: string;
  customizer: Customizer;
  customizerList: string[] = [];
  customizerForm: FormGroup;
  userMerchant: string;
  autofillColors: boolean = false;
  autofillFonts: boolean = false;
  autofillStickers: boolean = false;
  autofillBgColors: boolean = false;
  autofillBackground: boolean = false;

  ngOnInit(): void {
    this.initForm();
    this.customizerID = this.route.snapshot.params['id'];
    if (this.route.snapshot.params['id']) {
      console.log('sí hay customizerID');
      this.customizerService.getCustomizer(this.customizerID).then((value) => {
        console.log(value);
        if (value.backgroundColor.active)
          if (value.backgroundColor.onlyFixed)
            for (let i = 0; i < value.backgroundColor.fixed.length; i++) {
              this.onAddArrayItemColor('backgroundColor.fixed');
            }
        if (value.backgroundImage.active)
          if (value.backgroundImage.onlyFixed)
            for (let i = 0; i < value.backgroundImage.fixed.length; i++) {
              this.onAddArrayItem('backgroundImage.urls');
              this.customizerForm
                .get('backgroundImage')
                .get('urls')
                .patchValue(value.backgroundImage.fixed);
            }
        if (value.texts.active) {
          for (let i = 0; i < value.texts.itemsRule.length; i++) {
            if (i > 0) this.onAddArrayItem('texts.itemsRule');
            const itemRule = (
              this.customizerForm.get('texts.itemsRule') as FormArray
            ).at(i) as FormGroup;
            if (value.texts.itemsRule[i].onlyFixedColor)
              for (
                let j = 0;
                j < value.texts.itemsRule[i].fixedColors.length;
                j++
              ) {
                this.onAddArrayItemColor('fixedColors', itemRule);
              }
            if (value.texts.itemsRule[i].onlyFixedFonts)
              for (
                let j = 0;
                j < value.texts.itemsRule[i].fixedFonts.length;
                j++
              ) {
                this.onAddArrayItem('fixedFonts', itemRule);
              }
          }
        }
        if (value.stickers.active) {
          for (let i = 0; i < value.stickers.itemsRule.length; i++) {
            if (i > 0) this.onAddArrayItem('stickers.itemsRule');
            const itemRule = (
              this.customizerForm.get('stickers.itemsRule') as FormArray
            ).at(i) as FormGroup;
            if (value.stickers.itemsRule[i].onlyFixed) {
              for (
                let j = 0;
                j < value.stickers.itemsRule[i].fixed.length;
                j++
              ) {
                this.onAddArrayItem('urls', itemRule);
              }
              (this.customizerForm.get('stickers.itemsRule') as FormArray)
                .at(i)
                .get('urls')
                .patchValue(value.stickers.itemsRule[i].fixed);
              if (
                value.stickers.itemsRule[i].svgRule.fixedColors ||
                value.stickers.itemsRule[i].svgRule.active
              ) {
                for (
                  let j = 0;
                  j < value.stickers.itemsRule[i].svgRule.colors.length;
                  j++
                ) {
                  this.onAddArrayItemColor('svgRule.colors', itemRule);
                }
              }
            }
          }
        }
        if (value.lines.active)
          if (value.lines.onlyFixedColor)
            for (let i = 0; i < value.lines.fixedColors.length; i++) {
              this.onAddArrayItem('lines.fixedColors');
            }
        this.customizerForm.patchValue(value);
      });
      this.customizerValueService
        .getCustomizerValuesByCustomizer(this.customizerID)
        .then((customizerValueList) => {
          console.log(customizerValueList);
          this.customizerList = customizerValueList.map((item) => item._id);
        });
    }
    this.merchant
      .myMerchants()
      .then((merchants) => (this.userMerchant = merchants[0]._id))
      .catch((error) => console.log(error));
  }

  initPosition() {
    return new FormGroup({
      x: new FormControl(0),
      y: new FormControl(0),
      // 'z': new FormControl(0),
      height: new FormControl(0),
      width: new FormControl(0),
      rotation: new FormControl(0),
    });
  }

  initStickerItemsRuleControl() {
    return new FormGroup({
      fixPositionOnly: new FormControl(false),
      fixPosition: this.initPosition(),
      onlyFixed: new FormControl(false),
      fixed: new FormArray([]),
      urls: new FormArray([]),
      svgRule: new FormGroup({
        fixedColors: new FormControl(false),
        colors: new FormArray([]),
      }),
    });
  }

  initTextsItemsRuleControl() {
    return new FormGroup({
      defaultText: new FormControl(),
      fixPositionOnly: new FormControl(false),
      fixPosition: this.initPosition(),
      fixSizeOnly: new FormControl(false),
      fixSize: new FormControl(0),
      fixedLengthOnly: new FormControl(false),
      fixedLength: new FormControl(0),
      onlyFixedColor: new FormControl(false),
      fixedColors: new FormArray([]),
      onlyFixedFonts: new FormControl(false),
      fixedFonts: new FormArray([]),
    });
  }

  initForm() {
    this.customizerForm = new FormGroup({
      canvas: new FormGroup({
        rounded: new FormControl(false, Validators.required),
        onlyFixed: new FormControl(false, Validators.required),
        fixedSize: new FormGroup({
          width: new FormControl(0, Validators.min(0)),
          height: new FormControl(0),
          ratio: new FormControl('1:1'),
        }),
      }),
      backgroundColor: new FormGroup({
        active: new FormControl(false),
        onlyFixed: new FormControl(false),
        fixed: new FormArray([]),
      }),
      backgroundImage: new FormGroup({
        active: new FormControl(false),
        filters: new FormGroup({
          bw: new FormControl(false),
          contrast: new FormControl(false),
          sepia: new FormControl(false),
        }),
        onlyFixed: new FormControl(false),
        fixed: new FormArray([]),
        urls: new FormArray([]),
      }),
      stickers: new FormGroup({
        active: new FormControl(false),
        fixedAmountItems: new FormControl(false),
        itemsRule: new FormArray([this.initStickerItemsRuleControl()]),
      }),
      texts: new FormGroup({
        active: new FormControl(false),
        fixedAmountItems: new FormControl(false),
        itemsRule: new FormArray([this.initTextsItemsRuleControl()]),
      }),
      lines: new FormGroup({
        active: new FormControl(false),
        onlyFixedColor: new FormControl(false),
        fixedColors: new FormArray([]),
      }),
    });
  }

  // updateForm(customizer: Customizer) {
  //   this.customizerForm.patchValue(customizer);
  // }

  getArrayControls(form: FormGroup | AbstractControl, controlName: string) {
    return (form.get(controlName) as FormArray).controls;
  }

  getArrayLength(form: string) {
    return (this.customizerForm.get(`${form}.itemsRule`) as FormArray).length;
  }

  getMaxLength(form: FormGroup | AbstractControl) {
    return form.get('fixedLengthOnly').value
      ? form.get('fixedLength').value
      : 200;
  }

  checkControlValue(form: FormGroup | AbstractControl, controlName: string) {
    return form.get(controlName).value;
  }

  onAddArrayItem(controlName: string, form?: FormGroup | AbstractControl) {
    // -------------------- Default color value --------------------
    // if(form) {
    //   let control = new FormControl(null, Validators.required);
    //   if(controlName === 'svgRule.colors' || controlName.includes('fixedColors')) control = new FormControl('#ffffff', Validators.required);
    //   (<FormArray>form.get(controlName)).push(control);
    //   return;
    // }
    // let control: FormGroup | FormControl;
    // if(controlName === 'stickers.itemsRule') control = this.initStickerItemsRuleControl();
    // else if(controlName === 'texts.itemsRule') control = this.initTextsItemsRuleControl();
    // else if(
    //   controlName === 'backgroundColor.fixed' ||
    //   controlName.includes('fixedColors')
    // ) {
    //   control = new FormControl('#ffffff', Validators.required);
    // }
    // else control = new FormControl(null, Validators.required);
    // (<FormArray>this.customizerForm.get(controlName)).push(control);
    // +++++++++++++++++ Default color value +++++++++++++++++
    if (form) {
      const control = new FormControl(null, Validators.required);
      (<FormArray>form.get(controlName)).push(control);
      return;
    }
    let control: FormGroup | FormControl;
    if (controlName === 'stickers.itemsRule')
      control = this.initStickerItemsRuleControl();
    else if (controlName === 'texts.itemsRule')
      control = this.initTextsItemsRuleControl();
    else control = new FormControl(null, Validators.required);
    (<FormArray>this.customizerForm.get(controlName)).push(control);
  }

  onAddArrayItemColor(controlName: string, form?: FormGroup | AbstractControl) {
    const control = new FormGroup({
      name: new FormControl(null, Validators.required),
      fixedValue: new FormControl(null, Validators.required),
      nickname: new FormControl(null, Validators.required),
    });
    if (form) (<FormArray>form.get(controlName)).push(control);
    else (<FormArray>this.customizerForm.get(controlName)).push(control);
    return;
  }

  onRemoveArrayItem(
    controlName: string,
    i: number,
    form?: FormGroup | AbstractControl
  ) {
    if (form) {
      (<FormArray>form.get(controlName)).removeAt(i);
      return;
    }
    (<FormArray>this.customizerForm.get(controlName)).removeAt(i);
  }

  handleFileInput(e: Event, form: FormControl | AbstractControl) {
    const files = (e.target as HTMLInputElement).files;
    form.setValue(files.item(0));
  }

  handleStickerSize(e: Event, form: FormGroup | AbstractControl) {
    const value = (e.target as HTMLInputElement).value;
    form.patchValue({
      fixPosition: {
        width: +value,
        height: +value,
      },
    });
  }

  copyId() {
    navigator.clipboard.writeText(this.customizerID);
    alert('ID del Customizer: ' + this.customizerID);
  }

  openCustomizer() {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([
        `/posts/post-customizer/620e0c0bd5501adadeef0ddc/${this.customizerID}`,
      ])
    );
    window.open(url, '_blank');
  }

  createCustomizer() {
    console.log('entering create customi');
    this.customizerService
      .createCustomizer(this.validateCustomizer())
      .then((value) => {
        console.log(value);
        this.customizerID = value;
        // this.router.navigate(['posts/post-customizer/', value]);
      });
  }

  modifyCustomizer() {
    this.customizerService
      .updateCustomizer(this.validateCustomizer(), this.customizerID)
      .then((res) => {
        console.log(res);
      });
  }

  validateCustomizer(): CustomizerInput {
    let customizerData: CustomizerInput = this.customizerForm.value;
    console.log(customizerData);
    if (this.autofillColors) console.log('some values will be autofilled');
    customizerData.merchant = this.userMerchant; // local
    if (this.autofillBgColors) {
      customizerData.backgroundColor.active = true;
      customizerData.backgroundColor.onlyFixed = true;
      customizerData.backgroundColor.fixed = bgColors;
    }
    if (this.autofillBackground) {
      customizerData.backgroundImage.active = true;
      customizerData.backgroundImage.onlyFixed = true;
      customizerData.backgroundImage.urls = [
        'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1652369816745.png',
      ];
    }
    if (customizerData.stickers.fixedAmountItems) {
      customizerData.stickers.fixedAmount =
        customizerData.stickers.itemsRule.length;
      for (let i = 0; i < customizerData.stickers.itemsRule.length; i++) {
        customizerData.stickers.itemsRule[i].fixPosition.z = i;
      }
    }
    if (this.autofillColors && customizerData.stickers.active) {
      for (let i = 0; i < customizerData.stickers.itemsRule.length; i++) {
        let currentColors = customizerData.stickers.itemsRule[i].svgRule.colors;
        let stickerColors = this.hasDuplicateColor(currentColors[0], colorList);
        customizerData.stickers.itemsRule[i].svgRule.colors = stickerColors;
        // let currentSVG = customizerData.stickers.itemsRule[0].urls;
        // let svgs = this.hasDuplicate(currentSVG[0], stickers);
        // customizerData.stickers.itemsRule[i].urls = svgs;
      }
    }
    // else customizerData.stickers.fixedAmount = 0;
    if (customizerData.texts.fixedAmountItems) {
      customizerData.texts.fixedAmount = customizerData.texts.itemsRule.length;
      for (let i = 0; i < customizerData.texts.itemsRule.length; i++) {
        customizerData.texts.itemsRule[i].fixPosition.z = i;
      }
    }
    if (this.autofillColors && customizerData.texts.active) {
      for (let i = 0; i < customizerData.texts.itemsRule.length; i++) {
        let textColors = customizerData.texts.itemsRule[i].fixedColors;
        let colorsText = this.hasDuplicateColor(textColors[0], colorList);
        customizerData.texts.itemsRule[i].fixedColors = colorsText;
      }
    }
    if (this.autofillFonts && customizerData.texts.active) {
      for (let i = 0; i < customizerData.texts.itemsRule.length; i++) {
        let font = customizerData.texts.itemsRule[i].fixedFonts;
        let textFonts = this.hasDuplicate(font[0], fonts);
        customizerData.texts.itemsRule[i].fixedFonts = textFonts;
      }
    }
    // else if(customizerData.texts.active) {
    //   for(let i = 0; i < customizerData.texts.itemsRule.length; i++) {
    //     let font = customizerData.texts.itemsRule[i].fixedFonts
    //     customizerData.texts.itemsRule[i].fixedFonts = [font[0]];
    //   }
    // }
    // else customizerData.texts.fixedAmount = 0;
    console.log(customizerData);
    return customizerData;
  }

  hasDuplicate(string: string, items: string[]) {
    const array = [...items];
    let newArray: string[];
    if (array.indexOf(string) > -1) {
      array.splice(array.indexOf(string), 1);
    }
    newArray = array;
    newArray.unshift(string);
    return newArray;
  }

  hasDuplicateColor(
    first: { name: string; fixedValue: string; nickname: string },
    items: { name: string; fixedValue: string; nickname: string }[]
  ) {
    const array = [...items];
    let newArray: { name: string; fixedValue: string; nickname: string }[];
    const index = array.findIndex((item) => item.name === first.name);
    if (index > -1) {
      array.splice(index, 1);
    }
    newArray = array;
    newArray.unshift(first);
    return newArray;
  }
}

// const colors1= [
//   '#c72c74', '#eeeeee', '#606060','#e4c012','#2262a9', '#ce6568', '#46874e','#9a815c'
// ]

// const colors2 = [
//   '#c72c74', '#eeeeee', '#606060','#e4c012','#2262a9',
//   '#799b27','#393939', '#82cac7', '#194520', '#fb7a7a',
//   '#ff3b3b', '#149f9a', '#ba7364', '#003289', '#9a815c'
// ]

export const colorList = [
  {
    fixedValue: '#FEFEFE',
    name: '30-AP',
    nickname: '30-AP',
  },
  {
    fixedValue: '#FFFFFF',
    name: '30-K',
    nickname: 'Blanco',
  },
  {
    fixedValue: '#FEFFFE',
    name: '30-W',
    nickname: '30-W',
  },
  {
    fixedValue: '#FBE9C1',
    name: '37-K',
    nickname: '37-K',
  },
  {
    fixedValue: '#FDE23D',
    name: '34-K',
    nickname: '34-K',
  },
  {
    fixedValue: '#FED313',
    name: '34-AP',
    nickname: '34-AP',
  },
  {
    fixedValue: '#F52B1F',
    name: '38-K',
    nickname: 'Naranja',
  },
  {
    fixedValue: '#E30D27',
    name: '21-K',
    nickname: 'Coral',
  },
  {
    fixedValue: '#D70214',
    name: '23-K',
    nickname: '23-K',
  },
  {
    fixedValue: '#DD021E',
    name: '23-AP',
    nickname: 'Rojo',
  },
  {
    fixedValue: '#A60013',
    name: '15-L',
    nickname: '15-L',
  },
  {
    fixedValue: '#080808',
    name: '15-A',
    nickname: '15-A',
  },
  {
    fixedValue: '#01AAA5',
    name: '50-AP',
    nickname: 'Turquesa Mate',
  },
  {
    fixedValue: '#02A64D',
    name: '28-K',
    nickname: 'Verde',
  },
  {
    fixedValue: '#007E21',
    name: '29-K',
    nickname: 'Verde',
  },
  {
    fixedValue: '#02762D',
    name: '29-AP',
    nickname: '29-AP',
  },
  {
    fixedValue: '#4FDF03',
    name: '28-P',
    nickname: '28-P',
  },
  {
    fixedValue: '#99ED53',
    name: '28-AP',
    nickname: '28-AP',
  },
  {
    fixedValue: '#138B00',
    name: '17-B',
    nickname: 'Verde Limon Brillo',
  },
  {
    fixedValue: '#A7AEA7',
    name: '17-P',
    nickname: '17-P',
  },
  {
    fixedValue: '#101010',
    name: '17-L',
    nickname: '17-L',
  },
  {
    fixedValue: '#050505',
    name: '17-A',
    nickname: '17-A',
  },
  {
    fixedValue: '#070707',
    name: '50-B',
    nickname: '50-B',
  },
  {
    fixedValue: '#070707',
    name: '10-NA',
    nickname: '10-NA',
  },
  {
    fixedValue: '#4FC0FC',
    name: '24-K',
    nickname: 'Azul Bebé',
  },
  {
    fixedValue: '#0989EE',
    name: '51-K',
    nickname: '51-K',
  },
  {
    fixedValue: '#474E6C',
    name: '16-P',
    nickname: '16-P',
  },
  {
    fixedValue: '#0F0F0F',
    name: '16-A',
    nickname: '16-A',
  },
  {
    fixedValue: '#04168E',
    name: '16-L',
    nickname: '16-L',
  },
  {
    fixedValue: '#0A0A0A',
    name: '16-B',
    nickname: '16-B',
  },
  {
    fixedValue: '#172328',
    name: '24-B',
    nickname: '24-B',
  },
  {
    fixedValue: '#0712EA',
    name: '25-K',
    nickname: 'Azul Cobalto',
  },
  {
    fixedValue: '#172142',
    name: '47-KD',
    nickname: '47-KD',
  },
  {
    fixedValue: '#0321A5',
    name: '47-P',
    nickname: '47-P',
  },
  {
    fixedValue: '#FEFAFD',
    name: '10-NP',
    nickname: '10-NP',
  },
  {
    fixedValue: '#FC5B87',
    name: '39-P',
    nickname: '39-P',
  },
  {
    fixedValue: '#FEBCD1',
    name: '35-AP',
    nickname: 'Rosa Bebé',
  },
  {
    fixedValue: '#FD83D6',
    name: '39-K',
    nickname: '39-K',
  },
  {
    fixedValue: '#FE74AD',
    name: '56-P',
    nickname: '56-P',
  },
  {
    fixedValue: '#DF055C',
    name: '42-K',
    nickname: 'Rosado Fucsia',
  },
  {
    fixedValue: '#1B2C5E',
    name: '40-B',
    nickname: '40-B',
  },
  {
    fixedValue: '#352355',
    name: '41-K',
    nickname: '41-K',
  },
  {
    fixedValue: '#0F0F0F',
    name: '41-B',
    nickname: '41-B',
  },
  {
    fixedValue: '#171717',
    name: '22-L',
    nickname: '22-L',
  },
  {
    fixedValue: '#030303',
    name: '42-B',
    nickname: '42-B',
  },
  {
    fixedValue: '#030303',
    name: '21-L',
    nickname: '21-L',
  },
  {
    fixedValue: '#030303',
    name: '21-B',
    nickname: '21-B',
  },
  {
    fixedValue: '#090909',
    name: '18-L',
    nickname: '18-L',
  },
  {
    fixedValue: '#7E540D',
    name: '18-A',
    nickname: 'Dorado',
  },
  {
    fixedValue: '#936B23',
    name: '18-LM',
    nickname: '18-LM',
  },
  {
    fixedValue: '#101010',
    name: '18-LG',
    nickname: '18-LG',
  },
  {
    fixedValue: '#523726',
    name: '18-R',
    nickname: '18-R',
  },
  {
    fixedValue: '#030303',
    name: '18-AA',
    nickname: '18-AA',
  },
  {
    fixedValue: '#4A412E',
    name: '18-Q',
    nickname: 'Dorado Brillo',
  },
  {
    fixedValue: '#940013',
    name: '46-K',
    nickname: '46-K',
  },
  {
    fixedValue: '#85060F',
    name: '52-K',
    nickname: 'Granate',
  },
  {
    fixedValue: '#87021D',
    name: '52-AP',
    nickname: '52-AP',
  },
  {
    fixedValue: '#2D2427',
    name: '32-K',
    nickname: 'Marron Claro',
  },
  {
    fixedValue: '#1A1A1A',
    name: '45-K',
    nickname: 'Marron Oscuro',
  },
  {
    fixedValue: '#090909',
    name: '19-L',
    nickname: '19-L',
  },
  {
    fixedValue: '#79787D',
    name: '19-Q',
    nickname: 'Plata Brillo',
  },
  {
    fixedValue: '#88878C',
    name: '19-R',
    nickname: '19-R',
  },
  {
    fixedValue: '#070707',
    name: '19-K',
    nickname: '19-K',
  },
  {
    fixedValue: '#414141',
    name: '44-K',
    nickname: 'Gris',
  },
  {
    fixedValue: '#010101',
    name: '33-AP',
    nickname: 'Negro',
  },
  {
    fixedValue: '#050505',
    name: '33-K',
    nickname: '33-K',
  },
  {
    fixedValue: '#050505',
    name: '33-W',
    nickname: '33-W',
  },
  {
    fixedValue: '#050505',
    name: '33-A',
    nickname: '33-A',
  },
  {
    fixedValue: '#131313',
    name: '20-B',
    nickname: 'Cobre Brillo',
  },
  {
    fixedValue: '#6E382E',
    name: '20-AP',
    nickname: '20-AP',
  },
  {
    fixedValue: '#D58C1D',
    name: '36-AP',
    nickname: '36-AP',
  },
];

const bgColors = [
  {
    fixedValue: '#3A3A3A',
    name: 'Negro',
    nickname: null,
  },
  {
    fixedValue: '#FB3E3F',
    name: 'Rojo',
    nickname: null,
  },
  {
    fixedValue: '#B4B4B4',
    name: 'Gris',
    nickname: null,
  },
  {
    fixedValue: '#676881',
    name: 'Azul Marino',
    nickname: null,
  },
  {
    fixedValue: '#FFFFFF',
    name: 'Blanco',
    nickname: null,
  },
];


const fonts = [
  'Dorsa',
  'Onyx',
  'Commercial-Script',
  'Cheltenham',
  // "GiddyupStd",
  // "Nirvana",
  // "GeorgiaRegular",
  // "Village",
  // "CFCraigRobinson-Regular",
  // "PomfritDandyNFRegular",
  // "HorsDoeuvresTheGarter",
  // "UnicodeOnyx",
  // "CheltenhamStdBoldCond",
  // "CheltenhamBoldItalic",
  // "CheltenhamStdBookItalic",
  // "CheltenhamStdLightItalic",
  // "CheltenhamStdUltraItalic",
];
