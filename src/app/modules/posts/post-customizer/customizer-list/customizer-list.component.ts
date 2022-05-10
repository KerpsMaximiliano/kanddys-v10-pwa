import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
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

  ngOnInit(): void {
    this.initForm();
    this.customizerID = this.route.snapshot.params['id'];
    if(this.route.snapshot.params['id']) {
      console.log("sí hay customizerID");
      this.customizerService.getCustomizer(this.customizerID).then((value) => {
        console.log(value);
        if(value.backgroundColor.active)
          if(value.backgroundColor.onlyFixed)
            for(let i = 0; i < value.backgroundColor.fixed.length; i++) {
              this.onAddArrayItemColor('backgroundColor.fixed');
            }
        if(value.backgroundImage.active)
          if(value.backgroundImage.onlyFixed)
            for(let i = 0; i < value.backgroundImage.fixed.length; i++) {
              this.onAddArrayItem('backgroundImage.urls');
              this.customizerForm.get('backgroundImage').get('urls').patchValue(value.backgroundImage.fixed);
            }
        if(value.texts.active) {
          for(let i = 0; i < value.texts.itemsRule.length; i++) {
            if(i > 0) this.onAddArrayItem('texts.itemsRule');
            const itemRule = ((this.customizerForm.get('texts.itemsRule') as FormArray).at(i) as FormGroup);
            if(value.texts.itemsRule[i].onlyFixedColor)
              for(let j = 0; j < value.texts.itemsRule[i].fixedColors.length; j++) {
                this.onAddArrayItemColor('fixedColors', itemRule)
              }
            if(value.texts.itemsRule[i].onlyFixedFonts)
              for(let j = 0; j < value.texts.itemsRule[i].fixedFonts.length; j++) {
                this.onAddArrayItem('fixedFonts', itemRule)
              }
          }
        }
        if(value.stickers.active) {
          for(let i = 0; i < value.stickers.itemsRule.length; i++) {
            if(i > 0) this.onAddArrayItem('stickers.itemsRule');
            const itemRule = ((this.customizerForm.get('stickers.itemsRule') as FormArray).at(i) as FormGroup);
            if(value.stickers.itemsRule[i].onlyFixed) {
              for(let j = 0; j < value.stickers.itemsRule[i].fixed.length; j++) {
                this.onAddArrayItem('urls', itemRule);
              }
              (this.customizerForm.get('stickers.itemsRule') as FormArray).at(i).get('urls').patchValue(value.stickers.itemsRule[i].fixed);
              if(value.stickers.itemsRule[i].svgRule.fixedColors || value.stickers.itemsRule[i].svgRule.active) {
                for(let j = 0; j < value.stickers.itemsRule[i].svgRule.colors.length; j++) {
                  this.onAddArrayItemColor('svgRule.colors', itemRule);
                }
              }
            }
          }
        }
        if(value.lines.active)
          if(value.lines.onlyFixedColor)
            for(let i = 0; i < value.lines.fixedColors.length; i++) {
              this.onAddArrayItem('lines.fixedColors')
            }
        this.customizerForm.patchValue(value);
      })
      this.customizerValueService
        .getCustomizerValuesByCustomizer(this.customizerID)
        .then((customizerValueList) => {
          console.log(customizerValueList);
          this.customizerList = customizerValueList.map((item) => item._id);
        });
    }
    this.merchant.myMerchants()
      .then((merchants) => this.userMerchant = merchants[0]._id)
      .catch((error) => console.log(error))
  }

  initPosition() {
    return new FormGroup({
      'x': new FormControl(0),
      'y': new FormControl(0),
      // 'z': new FormControl(0),
      'height': new FormControl(0),
      'width': new FormControl(0),
      'rotation': new FormControl(0),
    });
  }

  initStickerItemsRuleControl() {
    return new FormGroup({
      'fixPositionOnly': new FormControl(false),
      'fixPosition': this.initPosition(),
      'onlyFixed': new FormControl(false),
      'fixed': new FormArray([]),
      'urls': new FormArray([]),
      'svgRule': new FormGroup({
        'fixedColors': new FormControl(false),
        'colors': new FormArray([]),
      }),
    });
  }

  initTextsItemsRuleControl() {
    return new FormGroup({
      'defaultText': new FormControl(),
      'fixPositionOnly': new FormControl(false),
      'fixPosition': this.initPosition(),
      'fixSizeOnly': new FormControl(false),
      'fixSize': new FormControl(0),
      'fixedLengthOnly': new FormControl(false),
      'fixedLength': new FormControl(0),
      'onlyFixedColor': new FormControl(false),
      'fixedColors': new FormArray([]),
      'onlyFixedFonts': new FormControl(false),
      'fixedFonts': new FormArray([]),
    })
  }

  initForm() {
    this.customizerForm = new FormGroup({
      'canvas': new FormGroup({
        'rounded': new FormControl(false, Validators.required),
        'onlyFixed': new FormControl(false, Validators.required),
        'fixedSize': new FormGroup({
          'width': new FormControl(0, Validators.min(0)),
          'height': new FormControl(0),
          'ratio': new FormControl('1:1'),
        })
      }),
      'backgroundColor': new FormGroup({
        'active': new FormControl(false),
        'onlyFixed': new FormControl(false),
        'fixed': new FormArray([])
      }),
      'backgroundImage': new FormGroup({
        'active': new FormControl(false),
        'filters': new FormGroup({
          'bw': new FormControl(false),
          'contrast': new FormControl(false),
          'sepia': new FormControl(false),
        }),
        'onlyFixed': new FormControl(false),
        'fixed': new FormArray([]),
        'urls': new FormArray([]),
      }),
      'stickers': new FormGroup({
        'active': new FormControl(false),
        'fixedAmountItems': new FormControl(false),
        'itemsRule': new FormArray([
          this.initStickerItemsRuleControl()
        ])
      }),
      'texts': new FormGroup({
        'active': new FormControl(false),
        'fixedAmountItems': new FormControl(false),
        'itemsRule': new FormArray([
          this.initTextsItemsRuleControl()
        ])
      }),
      'lines': new FormGroup({
        'active': new FormControl(false),
        'onlyFixedColor': new FormControl(false),
        'fixedColors': new FormArray([])
      }),
    });
  }

  // updateForm(customizer: Customizer) {
  //   this.customizerForm.patchValue(customizer);
  // }

  getArrayControls(form: FormGroup, controlName: string) {
    return (form.get(controlName) as FormArray).controls;
  }
  
  getArrayLength(form: string) {
    return (this.customizerForm.get(`${form}.itemsRule`) as FormArray).length;
  }

  getMaxLength(form: FormGroup) {
    return form.get('fixedLengthOnly').value ? form.get('fixedLength').value : 200
  }

  checkControlValue(form: FormGroup, controlName: string) {
    return form.get(controlName).value;
  }

  onAddArrayItem(controlName: string, form?: FormGroup) {
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
    if(form) {
      const control = new FormControl(null, Validators.required);
      (<FormArray>form.get(controlName)).push(control);
      return;
    }
    let control: FormGroup | FormControl;
    if(controlName === 'stickers.itemsRule') control = this.initStickerItemsRuleControl();
    else if(controlName === 'texts.itemsRule') control = this.initTextsItemsRuleControl();
    else control = new FormControl(null, Validators.required);
    (<FormArray>this.customizerForm.get(controlName)).push(control);
  }

  onAddArrayItemColor(controlName: string, form?: FormGroup) {
    const control = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'fixedValue': new FormControl(null, Validators.required),
    });
    if(form) (<FormArray>form.get(controlName)).push(control);
    else (<FormArray>this.customizerForm.get(controlName)).push(control);
    return;
  }

  onRemoveArrayItem(controlName: string, i: number, form?: FormGroup, ) {
    if(form) {
      (<FormArray>form.get(controlName)).removeAt(i);
      return;
    }
    (<FormArray>this.customizerForm.get(controlName)).removeAt(i);
  }

  handleFileInput(files: FileList, form: FormControl) {
    form.setValue(files.item(0));
  }

  handleStickerSize(value: number, form: FormGroup) {
    console.log(value);
    form.patchValue({
      fixPosition: {
        width: +value,
        height: +value
      }
    });
  }

  copyId() {
    navigator.clipboard.writeText(this.customizerID);
    alert("ID del Customizer: " + this.customizerID);
  }

  openCustomizer() {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/posts/post-customizer/620e0c0bd5501adadeef0ddc/${this.customizerID}`])
    );
    window.open(url, '_blank');
  }

  createCustomizer(form?: NgForm) {
    console.log("entering create customi");
    this.customizerService.createCustomizer(this.validateCustomizer())
    .then((value) => {
      console.log(value)
      this.customizerID = value;
      // this.router.navigate(['posts/post-customizer/', value]);
    })
  }

  modifyCustomizer() {
    this.customizerService.updateCustomizer(this.validateCustomizer(), this.customizerID)
    .then((res) => {
      console.log(res);
    })
  }

  validateCustomizer(): CustomizerInput {
    let customizerData: CustomizerInput = this.customizerForm.value;
    console.log(customizerData)
    if(this.autofillColors) {
      console.log('some values will be autofilled')
    }
    customizerData.merchant = this.userMerchant; // local
    if(this.autofillBgColors) {
      customizerData.backgroundColor.active = true;
      customizerData.backgroundColor.onlyFixed = true;
      customizerData.backgroundColor.fixed = bgColors;
    }
    if(customizerData.stickers.fixedAmountItems) {
      customizerData.stickers.fixedAmount = customizerData.stickers.itemsRule.length;
      for(let i = 0; i < customizerData.stickers.itemsRule.length; i++) {
        customizerData.stickers.itemsRule[i].fixPosition.z = i;
      }
    }
    if(this.autofillColors && customizerData.stickers.active) {
      for(let i = 0; i < customizerData.stickers.itemsRule.length; i++) {
        let currentColors = customizerData.stickers.itemsRule[i].svgRule.colors;
        let stickerColors = this.hasDuplicateColor(currentColors[0], colorList);
        customizerData.stickers.itemsRule[i].svgRule.colors = stickerColors;
        // let currentSVG = customizerData.stickers.itemsRule[0].urls;
        // let svgs = this.hasDuplicate(currentSVG[0], stickers);
        // customizerData.stickers.itemsRule[i].urls = svgs;
      }
    }
    // else customizerData.stickers.fixedAmount = 0;
    if(customizerData.texts.fixedAmountItems) {
      customizerData.texts.fixedAmount = customizerData.texts.itemsRule.length;
      for(let i = 0; i < customizerData.texts.itemsRule.length; i++) {
        customizerData.texts.itemsRule[i].fixPosition.z = i;
      }
    }
    if(this.autofillColors && customizerData.texts.active) {
      for(let i = 0; i < customizerData.texts.itemsRule.length; i++) {
        let textColors = customizerData.texts.itemsRule[i].fixedColors;
        let colorsText = this.hasDuplicateColor(textColors[0], colorList);
        customizerData.texts.itemsRule[i].fixedColors = colorsText;
      }
    }
    if(this.autofillFonts && customizerData.texts.active) {
      for(let i = 0; i < customizerData.texts.itemsRule.length; i++) {
        let font = customizerData.texts.itemsRule[i].fixedFonts
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
    console.log(customizerData)
    return customizerData;
  }

  hasDuplicate(string: string, items: string[]) {
    const array = [...items];
    let newArray: string[];
    if(array.indexOf(string) > -1) {
      array.splice(array.indexOf(string), 1);
    }
    newArray = array;
    newArray.unshift(string)
    return newArray
  }

  hasDuplicateColor(first: {name: string, fixedValue: string}, items: {name: string, fixedValue: string}[]) {
    const array = [...items];
    let newArray: {name: string, fixedValue: string}[];
    const index = array.findIndex((item) => item.name === first.name);
    if(index  > -1) {
      array.splice(index, 1);
    }
    newArray = array;
    newArray.unshift(first);
    return newArray
  }
}

const colors1= [
  '#c72c74', '#eeeeee', '#606060','#e4c012','#2262a9', '#ce6568', '#46874e','#9a815c'
]

const colors2 = [
  '#c72c74', '#eeeeee', '#606060','#e4c012','#2262a9', 
  '#799b27','#393939', '#82cac7', '#194520', '#fb7a7a', 
  '#ff3b3b', '#149f9a', '#ba7364', '#003289', '#9a815c'
]

const colorList = [
  {
    fixedValue: "#57634C",
    name: "17-B"
  },
  {
    fixedValue: "#7B7B79",
    name: "19-Q"
  },
  {
    fixedValue: "#4A768F",
    name: "25-B"
  },
  {
    fixedValue: "#8C4549",
    name: "23-AP"
  },
  {
    fixedValue: "#305B7D",
    name: "16-A"
  },
  {
    fixedValue: "#A14549",
    name: "38-K"
  },
  {
    fixedValue: "#3C7C83",
    name: "24-K"
  },
  {
    fixedValue: "#6F6D89",
    name: "40-B"
  },

  {
    fixedValue: "#3F5167",
    name: "47-KD"
  },

  {
    fixedValue: "#48474F",
    name: "45-K"
  },
  {
    fixedValue: "#A25C7E",
    name: "41-B"
  },
  {
    fixedValue: "#979994",
    name: "30-K"
  },
  {
    fixedValue: "#5A4E5C",
    name: "52-K"
  },
  {
    fixedValue: "#707071",
    name: "10-NA"
  },
  {
    fixedValue: "#A49170",
    name: "18-Q"
  },
  {
    fixedValue: "#A5536F",
    name: "42-K"
  },
  {
    fixedValue: "#3A494A",
    name: "33-AP"
  },
  {
    fixedValue: "#5A4E5C",
    name: "28-K"
  },
  {
    fixedValue: "#385C44",
    name: "28-K"
  },
  {
    fixedValue: "#2E4F3E",
    name: "29-K"
  },
  {
    fixedValue: "#997D44",
    name: "18-A"
  },
  {
    fixedValue: "#3F4044",
    name: "20-B"
  },
  {
    fixedValue: "#686a68",
    name: "44-K"
  },
  {
    fixedValue: "#A17942",
    name: "34-AP"
  },
  {
    fixedValue: "#3C7374",
    name: "50-B"
  },
  // {
  //   fixedValue: "#",
  //   name: "18-AR"
  // },
  {
    fixedValue: "#34746C",
    name: "50-AP"
  },
  {
    fixedValue: "#55555F",
    name: "32-K"
  },
  {
    fixedValue: "#45577E",
    name: "25-K"
  },
  {
    fixedValue: "#974448",
    name: "21-K"
  },
  {
    fixedValue: "#9F8689",
    name: "35-AP"
  },
]

const bgColors = [
  {
    fixedValue: "#3A3A3A",
    name: 'Negro'
  },
  {
    fixedValue: "#FB3E3F",
    name: 'Rojo'
  },
  {
    fixedValue: "#B4B4B4",
    name: 'Gris'
  },
  {
    fixedValue: "#676881",
    name: 'Azul Marino'
  },
  {
    fixedValue: "#FFFFFF",
    name: 'Blanco'
  },
]

const stickers = [
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645138962762.svg", // aro de navidad
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645138962729.svg", //ancla
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645138962704.svg", //astas
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645138962430.svg", // snowflake
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645138962403.svg", //cosa de mar
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645138962243.svg", // estrella
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645138962183.svg", // ovalo
  // "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645138962120.svg", // tres puntos
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645197521266.svg", // tres puntos grandes
  // "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645133403892.svg", // cosa wavy
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645197521179.svg", // cosa wavy grande
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1645136623699.svg", // ho ho ho
  "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1649456767107.svg", // Regalos
  // "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1649444940163.svg", //Familia Diaz
  // "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1649446778446.svg", // Feliz navidad
]

const fonts = [
  "Dorsa",
  "Onyx",
  "Commercial-Script",
  "Cheltenham",
  // "GiddyupStd",
  // "Nirvana",
  // "GeorgiaRegular",
  // "Village",
  // "CFCraigRobinson-Regular",
  // "PomfritDandyNFRegular",
  // "HorsDoeuvresTheGarter",
  // "CheltenhamStdBoldCondIt",
  // "CheltenhamStd-HdtooledBold",
  // "UnicodeOnyx",
  // "CheltenhamStdBoldCond",
  // "CheltenhamBoldItalic",
  // "CheltenhamStdBookItalic",
  // "CheltenhamStdLightItalic",
  // "CheltenhamStdUltraItalic",
]