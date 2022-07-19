import { Component, OnInit, ApplicationRef, OnDestroy} from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ImageInputComponent } from 'src/app/shared/components/image-input/image-input.component';
import { InfoButtonComponent } from 'src/app/shared/components/info-button/info-button.component';
import { ItemsService } from 'src/app/core/services/items.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import { DecimalPipe } from '@angular/common';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { Item } from 'src/app/core/models/item';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';

const labelStyles = {
  color: '#7B7B7B',
  fontFamily: 'RobotoMedium',
  fontSize: '17px',
  marginBottom: '24px',
  fontWeight: 'normal'
};

const checkIfStringIsBase64DataURI = (text: string)=> {
  return text.slice(0, 5) === 'data:';
}

@Component({
  selector: 'app-item-creator',
  templateUrl: './item-creator.component.html',
  styleUrls: ['./item-creator.component.scss'],
})
export class ItemCreatorComponent implements OnInit, OnDestroy {
  currentUserId: string = null;
  merchantOwnerId: string = null;
  currentItemId: string = null;
  scrollableForm = false;
  defaultImages: (string | ArrayBuffer)[] = [''];
  defaultImagesPermanent: (string)[] = [''];
  loggedUserDefaultMerchant: Merchant;
  loggedUserDefaultSaleflow: SaleFlow;
  loggedIn: boolean = false;
  editMode: boolean = false;
  user: any;
  shouldScrollBackwards: boolean = false;
  files: File[] = [];
  item: Item;
  imagesAlreadyLoaded: boolean = false;
  createdItem: boolean = false;
  lastCharacterEnteredIsADecimal: boolean = false;
  tryingToDeleteDotDecimalCounter: number = 0;

  footerConfig: FooterOptions = {
    bubbleConfig: {
      validStep: {
        dontShow: true,
        right: { text: 'VISTA' },
        function: async (params) => {
          const values = params.dataModel.value;
          const priceWithDecimalArray = values['1'].price.split('');
          const firstHalf = priceWithDecimalArray.slice(0, -2);
          const secondHalf = priceWithDecimalArray.slice(-2);
          const totalArray = firstHalf.concat('.').concat(secondHalf);
          const totalWithDecimal = Number(totalArray.join(''));

          if (
            this.currentUserId &&
            this.merchantOwnerId &&
            this.currentUserId === this.merchantOwnerId
            && this.currentItemId
          ) {
            // console.log(this.files);
            const {updateItem: updatedItem} = await this.itemService.updateItem(
              {
                name: values['4'].name,
                description: values['3'].description,
                pricing: totalWithDecimal,
                content: values['2'].whatsIncluded,
                currencies: [],
                hasExtraPrice: false,
                purchaseLocations: [],
              },
              this.currentItemId
            );

            if(updatedItem) {
              await this.itemService.deleteImageItem(this.defaultImagesPermanent, updatedItem._id);

              await this.itemService.addImageItem(this.files, updatedItem._id);

              // this.router.navigate([`/ecommerce/item-display/${this.currentItemId}`]);
              // this.router.navigate([`/ecommerce/authentication/${this.currentItemId}`]);
              this.router.navigate([`/ecommerce/merchant-items`]);
            }
            
          } else {
            if (this.loggedIn) {
              // console.log(this.loggedUserDefaultMerchant);
              const { createItem } = await this.itemService.createItem({
                name: values['4'].name,
                description: values['3'].description !== '' ? values['3'].description : null,
                pricing: totalWithDecimal,
                images: this.files,
                merchant: this.loggedUserDefaultMerchant ? this.loggedUserDefaultMerchant?._id : null,
                content: values['2'].whatsIncluded.length > 0 && !(
                  values['2'].whatsIncluded.length === 1 &&
                  values['2'].whatsIncluded[0] === ''
                ) ? values['2'].whatsIncluded : null,
                currencies: [],
                hasExtraPrice: false,
                purchaseLocations: [],
              });


              if ('_id' in createItem) {
                await this.saleflowSarvice.addItemToSaleFlow({
                  item: createItem._id
                }, this.loggedUserDefaultSaleflow._id);

                // this.router.navigate([`/ecommerce/merchant-dashboard/${this.loggedUserDefaultMerchant._id}/my-store`]);

                this.router.navigate([`/ecommerce/merchant-items`]);

                // this.router.navigate([`/ecommerce/item-display/${createItem?._id}`]);
              }
            } else {
              const { createPreItem } = await this.itemService.createPreItem({
                name: values['4'].name,
                description: values['3'].description !== '' ? values['3'].description : null,
                pricing: totalWithDecimal,
                images: this.files,
                content: values['2'].whatsIncluded.length > 0 && !(
                  values['2'].whatsIncluded.length === 1 &&
                  values['2'].whatsIncluded[0] === ''
                ) ? values['2'].whatsIncluded : null,
                currencies: [],
                hasExtraPrice: false,
                purchaseLocations: [],
              });

              // if ('_id' in createPreItem) this.router.navigate([`/ecommerce/item-display/${createPreItem?._id}`]);
              if ('_id' in createPreItem) this.router.navigate([`/ecommerce/authentication/${createPreItem?._id}`], {queryParams: {
                type: 'create-item'
              }});
              this.createdItem = true;
            }
          }

          // this.headerService.storeNewItemTemporarily({
          //   name: params.dataModel.value['4']['name'],
          //   pricing: params.dataModel.value['1']['price'],
          //   description: params.dataModel.value['3']['description'],
          //   content: params.dataModel.value['2']['whatsIncluded'],
          //   images: this.defaultImages.length > 1 ? this.defaultImages : null
          // }, this.router.url);

          // this.router.navigate(['/ecommerce/item-display']);
        }
      },
      invalidStep: {
        dontShow: true,
        right: { text: 'VISTA' },
      }
    },
    bgColor: '#2874AD',
    enabledStyles: {
      height: '49px',
      fontSize: '17px',
    },
    disabledStyles: {
      height: '30px',
      fontSize: '17px',
    },
  }

  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'price',
          fieldControl: {
            type: 'single',
            control: new FormControl(0, [
              Validators.required,
              Validators.min(0.01),
            ])
          },
          onlyAllowPositiveNumbers: true,
          label: 'Precio que te pagarán:',
          inputType: 'number',
          customCursorIndex: this.decimalPipe.transform(
            Number(0),
            '1.2'
          ).length + 1,
          statusChangeCallbackFunction: (change) => {
            if(change === 'VALID') {
              // console.log("edit mode", this.editMode);

              if(this.editMode) {
                for(let formStep of this.formSteps) {
                  formStep.customHelperHeaderConfig.bgcolor = this.item.status === 'active' ?
                    '#2874AD' : '#B17608';

                  formStep.headerText = this.item.status === 'active' ?
                    'ACTIVO (EXPUESTO EN TIENDA)' :
                    'INACTIVO (NO EXPUESTO)';

                    formStep.headerTextCallback = async () => {
                      await this.itemService.updateItem(
                        {
                          status: this.item.status === 'active' ? 'disabled' : this.item.status === 'disabled' ? 'active' : 'draft', 
                        },
                        this.currentItemId
                      );
  
                      this.item.status = this.item.status === 'active' ? 'disabled' : ['disabled', 'draft'].includes(this.item.status) ? 'active' : 'draft';

                      formStep.customHelperHeaderConfig.bgcolor = this.item.status === 'active' ?
                        '#2874AD' : '#B17608';
  
                      for(let formStep of this.formSteps) {
                        formStep.customHelperHeaderConfig.icon.src = `https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/${
                          this.item.status === 'active' ? 'open' : 'closed'
                        }-eye-white.svg`;
                        
                        formStep.headerText = this.item.status === 'active' ?
                          'ACTIVO (EXPUESTO EN TIENDA)' :
                          'INACTIVO (NO EXPUESTO)';
                      }
  
                    }  
                }
              } else {
                this.formSteps[0].headerText = 'PREVIEW'
              }
              this.formSteps[0].headerTextSide = 'RIGHT';           
            } else {
              this.formSteps[0].headerText = null;
              this.formSteps[0].headerTextSide = null;
            }
          },
          formattedValue: '$' + this.decimalPipe.transform(
            Number(0),
            '1.2'
          ),
          shouldFormatNumber: true,
          focused: false,
          placeholder: 'Precio...',
          changeCallbackFunction: (change, params) => {
            const { price: previousPrice } = params.dataModel.value['1'];

            if(change.length === previousPrice.length) {
              this.lastCharacterEnteredIsADecimal = true;
              this.tryingToDeleteDotDecimalCounter += 1;
            } else {
              this.lastCharacterEnteredIsADecimal = false;
            }

            try {
              if(this.lastCharacterEnteredIsADecimal && previousPrice.length === change.length && this.tryingToDeleteDotDecimalCounter === 2) {
                change = change.slice(0, -1);

                this.lastCharacterEnteredIsADecimal = false;
                this.tryingToDeleteDotDecimalCounter = 0;

                //REFACTOR LATER
                const plainNumber = change
                  .split(',')
                  .join('');

                if (plainNumber[0] === '0') {
                  const formatted = plainNumber.length > 3 ? this.decimalPipe.transform(
                    Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
                    '1.2'
                  ) : this.decimalPipe.transform(
                    Number('0.' + (
                      plainNumber.length <= 2 ? '0' + plainNumber.slice(1) :
                        plainNumber.slice(1)
                    )),
                    '1.2'
                  );

                  if (formatted === '0.00') {
                    this.formSteps[0].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;

                  this.formSteps[0].fieldsList[0].fieldControl.control.setValue(change, {
                    emitEvent: false,
                  });
                } else {
                  const formatted = plainNumber.length > 2 ? this.decimalPipe.transform(
                    Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
                    '1.2'
                  ) : this.decimalPipe.transform(
                    Number('0.' + (
                      plainNumber.length === 1 ? '0' + plainNumber :
                        plainNumber
                    )),
                    '1.2'
                  );

                  if (formatted === '0.00') {
                    this.formSteps[0].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[0].fieldsList[0].fieldControl.control.setValue(change, {
                    emitEvent: false,
                  });

                  this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;
                }
                
              } else {
                if (!change.includes('.')) {
                  const plainNumber = change
                    .split(',')
                    .join('');
  
                  if (plainNumber[0] === '0') {
                    const formatted = plainNumber.length > 3 ? this.decimalPipe.transform(
                      Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
                      '1.2'
                    ) : this.decimalPipe.transform(
                      Number('0.' + (
                        plainNumber.length <= 2 ? '0' + plainNumber.slice(1) :
                          plainNumber.slice(1)
                      )),
                      '1.2'
                    );
  
                    if (formatted === '0.00') {
                      this.formSteps[0].fieldsList[0].placeholder = '';
                    }
  
                    this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;
                  } else {
                    const formatted = plainNumber.length > 2 ? this.decimalPipe.transform(
                      Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
                      '1.2'
                    ) : this.decimalPipe.transform(
                      Number('0.' + (
                        plainNumber.length === 1 ? '0' + plainNumber :
                          plainNumber
                      )),
                      '1.2'
                    );
  
                    if (formatted === '0.00') {
                      this.formSteps[0].fieldsList[0].placeholder = '';
                    }
  
                    this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;
                  }
                } else {
                  const convertedNumber = Number(change.split('').filter(char => char !== '.').join(''));
  
                  const plainNumber = String(convertedNumber);
  
                  if (plainNumber[0] === '0') {
                    const formatted = plainNumber.length > 3 ? this.decimalPipe.transform(
                      Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
                      '1.2'
                    ) : this.decimalPipe.transform(
                      Number('0.' + (
                        plainNumber.length <= 2 ? '0' + plainNumber.slice(1) :
                          plainNumber.slice(1)
                      )),
                      '1.2'
                    );
  
                    if (formatted === '0.00') {
                      this.formSteps[0].fieldsList[0].placeholder = '';
                    }
  
                    this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;
                  } else {
                    const formatted = plainNumber.length > 2 ? this.decimalPipe.transform(
                      Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
                      '1.2'
                    ) : this.decimalPipe.transform(
                      Number('0.' + (
                        plainNumber.length === 1 ? '0' + plainNumber :
                          plainNumber
                      )),
                      '1.2'
                    );
  
                    if (formatted === '0.00') {
                      this.formSteps[0].fieldsList[0].placeholder = '';
                    }
  
                    this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;
                  }
  
                  this.formSteps[0].fieldsList[0].fieldControl.control.setValue(convertedNumber, {
                    emitEvent: false,
                  });
                }
              }
            } catch (error) {
              console.log(error);
            }
          },
          styles: {
            containerStyles: {
              width: '58.011%',
              minWidth: '210px',
              marginTop: '32px',
              position: 'relative',
              overflowX: 'hidden'
            },
            fieldStyles: {
              backgroundColor: 'transparent',
              color: 'transparent',
              caretColor: 'transparent',
              position: 'absolute',
              bottom: '0px',
              boxShadow: 'none',
              userSelect: 'none'
            },
            formattedInputStyles: {
              bottom: '0px',
              left: '0px',
              zIndex: '1',
            },
            formattedInputCaretStyles: {
              width: '0.5px',
              height: '1rem',
            },
            labelStyles: {
              ...labelStyles,
              fontWeight: 'normal'
            }
          },
        },
        // {
        //   name: 'collaborations',
        //   fieldControl: new FormControl(''),
        //   label: 'Vender más a través de Las Comunidades (opcional):',
        //   inputType: 'number',
        //   placeholder: 'Pagarás...',
        //   formattedValue: '',
        //   shouldFormatNumber: true,
        //   changeCallbackFunction: (change, params) => {
        //     try {
        //       const plainNumber = change
        //         .split(',')
        //         .join('')
        //         .split('.')
        //         .join('');
        //       const formatted = this.decimalPipe.transform(
        //         Number(plainNumber),
        //         '1.0-2'
        //       );

        //       if (formatted === '0') {
        //         this.formSteps[0].fieldsList[2].placeholder = '';
        //       }

        //       this.formSteps[0].fieldsList[2].formattedValue = '$' + formatted;
        //       // this.applicationRef.tick();
        //     } catch (error) {
        //       console.log(error);
        //     }
        //   },
        //   styles: {
        //     containerStyles: {
        //       position: 'relative',
        //       width: '68.50%',
        //       marginTop: '101px',
        //     },
        //     fieldStyles: {
        //       backgroundColor: 'transparent',
        //       color: 'transparent',
        //       zIndex: '50',
        //       position: 'absolute',
        //       bottom: '0px',
        //       left: '0px',
        //     },
        //     formattedInputStyles: {
        //       bottom: '0px',
        //       left: '0px',
        //       zIndex: '1',
        //     },
        //     labelStyles: {
        //       fontSize: '19px',
        //       marginBottom: '17px',
        //       fontWeight: '300',
        //     },
        //   },
        // },
      ],
      embeddedComponents: [
        {
          component: ImageInputComponent,
          inputs: {
            imageField:
              this.defaultImages.length > 0 ? this.defaultImages : null,
            multiple: true,
            imagesAlreadyLoaded: this.imagesAlreadyLoaded,
            allowedTypes: ['png', 'jpg', 'jpeg'],
            imagesPerView: 3,
            innerLabel: 'Adiciona las imágenes',
            topLabel: {
              text: 'Adiciona el arte en tu herramienta preferida:',
              styles: {
                color: '#7B7B7B',
                fontFamily: 'RobotoMedium',
                fontSize: '17px',
                margin: '0px',
                marginBottom: '24px',
                fontWeight: 'normal'
              },
            },
            containerStyles: {
              width: '157px',
              height: '137px !important',
            },
            fileStyles: {
              width: '157px',
              height: '137px',
              paddingLeft: '20px',
              textAlign: 'left',
            },
          },
          outputs: [
            {
              name: 'onFileInputBase64',
              callback: (result) => {
                this.defaultImages[result.index] = result.image;
                this.formSteps[0].embeddedComponents[0].inputs.innerLabel = "Adiciona otra imagen (opcional)";
                this.formSteps[0].embeddedComponents[0].shouldRerender = true;
                this.headerService.removeTempNewItem();
              },
            },
            {
              name: 'onFileInput',
              callback: (result) => {
                this.files[result.index] = result.image;
                console.log(this.files);
              },
            },
          ],
          beforeIndex: 0,
          containerStyles: {
            marginTop: '10px',
          },
        },
        {
          component: InfoButtonComponent,
          inputs: {},
          containerStyles: {
            position: 'relative',
            top: '-130px',
            display: 'flex',
            width: '100%',
            justifyContent: 'flex-end',
          },
          afterIndex: 2,
        },
      ],
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          try {
            const values = params.dataModel.value;
            const priceWithDecimalArray = typeof values['1'].price === 'string' ? values['1'].price.split('') : String(values['1'].price).split('');
            const firstHalf = priceWithDecimalArray.slice(0, -2);
            const secondHalf = priceWithDecimalArray.slice(-2);
            const totalArray = firstHalf.concat('.').concat(secondHalf);
            const totalWithDecimal = Number(totalArray.join(''));
  
            if (
              this.currentUserId &&
              this.merchantOwnerId &&
              this.currentUserId === this.merchantOwnerId
              && this.currentItemId
            ) {
              // console.log(this.files);
              const {updateItem: updatedItem } = await this.itemService.updateItem(
                {
                  name: values['4'].name,
                  description: values['3'].description,
                  pricing: totalWithDecimal,
                  content: values['2'].whatsIncluded,
                  currencies: [],
                  hasExtraPrice: false,
                  purchaseLocations: [],
                },
                this.currentItemId
              );

              if(updatedItem) {
                await this.itemService.deleteImageItem(this.defaultImagesPermanent, updatedItem._id);

                await this.itemService.addImageItem(this.files, updatedItem._id);

                this.headerService.flowRoute = this.router.url;
                // this.router.navigate([`/ecommerce/item-display/${this.currentItemId}`]);
                // this.router.navigate([`/ecommerce/authentication/${this.currentItemId}`]);
                this.itemService.removeTemporalItem();
                this.router.navigate([`/ecommerce/merchant-items`]);
              }

            } else {
              if (this.loggedIn) {
                const { createItem } = await this.itemService.createItem({
                  name: values['4'].name,
                  description: values['3'].description !== '' ? values['3'].description : null,
                  pricing: totalWithDecimal,
                  images: this.files,
                  merchant: this.loggedUserDefaultMerchant ? this.loggedUserDefaultMerchant?._id : null,
                  content: values['2'].whatsIncluded.length > 0 && !(
                    values['2'].whatsIncluded.length === 1 &&
                    values['2'].whatsIncluded[0] === ''
                  ) ? values['2'].whatsIncluded : null,
                  currencies: [],
                  hasExtraPrice: false,
                  purchaseLocations: [],
                });

                await this.saleflowSarvice.addItemToSaleFlow({
                  item: createItem._id
                }, this.loggedUserDefaultSaleflow._id);


                if ('_id' in createItem) {
                  this.headerService.flowRoute = this.router.url;
                  // this.router.navigate([`/ecommerce/item-display/${createItem._id}`]);
                  // this.router.navigate([`/ecommerce/authentication/${createItem._id}`]);
                  this.itemService.removeTemporalItem();
                  this.router.navigate([`/ecommerce/merchant-items`]);
                }
              } else {
                const { createPreItem } = await this.itemService.createPreItem({
                  name: values['4'].name,
                  description: values['3'].description !== '' ? values['3'].description : null,
                  pricing: totalWithDecimal,
                  images: this.files,
                  content: values['2'].whatsIncluded.length > 0 && !(
                    values['2'].whatsIncluded.length === 1 &&
                    values['2'].whatsIncluded[0] === ''
                  ) ? values['2'].whatsIncluded : null,
                  currencies: [],
                  hasExtraPrice: false,
                  purchaseLocations: [],
                });

                // if ('_id' in createPreItem) this.router.navigate([`/ecommerce/item-display/${createPreItem?._id}`]);
                if ('_id' in createPreItem) {
                  this.headerService.flowRoute = this.router.url;
                  this.itemService.removeTemporalItem();
                  this.router.navigate([`/ecommerce/authentication/${createPreItem?._id}`], {queryParams: {
                    type: 'create-item'
                  }})
                  this.createdItem = true;
                };
              }
            }
          } catch (error) {
            console.log(error);
          }

          return { ok: true };
        },
      },
      optionalLinksTo: {
        groupOfLinksArray: [
          {
            topLabel: 'Contenido opcional',
            styles: {
              containerStyles: {
                marginTop: '32px',
                marginBottom: '0px'
              },
              fieldStyles: {
                margin: '0px',
                marginBottom: '12px',
                paddingLeft: '17px',
                width: 'fit-content'
              },
              labelStyles: {
                ...labelStyles,
                marginBottom: '30px'
              }
            },
            links: [
              {
                text: 'Nombre',
                action: (params) => {
                  this.shouldScrollBackwards = true;
                  params.scrollToStep(3);
                }
              },
              // {
              //   text: 'Descripción',
              //   action: (params) => {
              //     this.shouldScrollBackwards = true;
              //     params.scrollToStep(2);
              //   }
              // },
              // {
              //   text: 'Lo incluido',
              //   action: (params) => {
              //     this.shouldScrollBackwards = true;
              //     params.scrollToStep(1);
              //   }
              // },
            ]
          }
        ]
      },
      pageHeader: {
        text: 'Lo que vendes',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '32px',
          marginBottom: '12px',
        }
      },
      avoidGoingToNextStep: true,
      headerTextCallback: async (params) => {
        this.saveItemInItemServiceAndRedirect(params, '/ecommerce/item-detail', this.item?._id);
      },
      statusChangeCallbackFunction: (change) => {
        if(change === 'INVALID') {
          this.formSteps[0].customStickyButton.mode = 'disabled-fixed';
          this.formSteps[0].customStickyButton.text = 'ADICIONA LA INFO DE LO QUE VENDES';
        } else {
          // this.formSteps[0].headerText = 'PREVIEW';
          this.formSteps[0].customStickyButton.mode = 'double';
          this.formSteps[0].customStickyButton.text = 'PREVIEW';
          this.formSteps[0].customStickyButton.text2 = 'SALVAR';          
        }
      },
      headerMode: 'v2',
      customStickyButton: {
        text: 'ADICIONA LA INFO DE LO QUE VENDES',
        bgcolor: '#2874AD',
        color: '#ffffff',
        bgcolorInactive: '#7b7b7b',
        colorInactive: '#ffffff',
        mode: 'disabled-fixed',
        height: '30px',
        heightInactive: '30px',
        textCallback: async (params) => {
          this.saveItemInItemServiceAndRedirect(params, '/ecommerce/item-detail', this.item?._id);;
        },
        text2Callback: async (params) => {
          try {
            this.formSteps[0].customStickyButton.text2 = 'ESPERE...';
            await this.formSteps[0].asyncStepProcessingFunction.function(params);              
          } catch (error) {
            console.log(error);
            this.formSteps[0].customStickyButton.text2 = 'SALVAR';
          }
        },
      },
    },
    {
      fieldsList: [
        {
          name: 'whatsIncluded',
          multiple: true,
          fieldControl: {
            type: 'multiple',
            control: new FormArray([new FormControl('')])
          },
          label: 'Adicione lo incluido:',
          inputType: 'text',
          placeholder: 'Escribe...',
          styles: {
            containerStyles: {
              width: '83.70%',
              marginTop: '32px',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '16px',
            },
            labelStyles: {
              fontSize: '24px',
              fontWeight: '600',
            },
          },
        },
      ],
      customScrollToStep: (params) => {
        this.shouldScrollBackwards = this.headerService.flowRoute ? true : false;

        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        this.shouldScrollBackwards = this.headerService.flowRoute ? true : false;
        
        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      }
    },
    {
      fieldsList: [
        {
          name: 'description',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Descripción',
          placeholder:
            'Escriba la breve descripción que estará en la parte superior de la imagen..',
          inputType: 'textarea',
          styles: {
            containerStyles: {
              marginTop: '32px',
            },
            fieldStyles: {
              backgroundColor: 'white',
              height: '127px',
              borderRadius: '10px',
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              marginBottom: '17px',
            },
          },
        },
      ],
      customScrollToStep: (params) => {
        this.shouldScrollBackwards = this.headerService.flowRoute ? true : false;

        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        this.shouldScrollBackwards = this.headerService.flowRoute ? true : false;

        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      }
    },
    {
      fieldsList: [
        {
          name: 'name',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Nombre',
          placeholder:
            'Escriba el nombre del producto..',
          styles: {
            containerStyles: {
              width: '83.70%',
              marginTop: '32px',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '16px',
            },
            labelStyles: {
              fontSize: '24px',
              fontWeight: '600',
            },
          },
        },
      ],
      customScrollToStep: (params) => {
        this.shouldScrollBackwards = this.headerService.flowRoute ? true : false;

        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        this.shouldScrollBackwards = this.headerService.flowRoute ? true : false;

        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      }
    },
    {
      fieldsList: [
        {
          name: 'collaborations',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Precio que pagará el colaborador',
          placeholder:
            '$ que colaborarás..',
          inputType: 'number',
          formattedValue: '',
          shouldFormatNumber: true,
          changeCallbackFunction: (change, params) => {
            try {
              const plainNumber = change
                .split(',')
                .join('')
                .split('.')
                .join('');
              const formatted = this.decimalPipe.transform(
                Number(plainNumber),
                '1.0-2'
              );

              if (formatted === '0') {
                this.formSteps[4].fieldsList[0].placeholder = '';
              }

              this.formSteps[4].fieldsList[0].formattedValue = '$' + formatted;
              // this.applicationRef.tick();
            } catch (error) {
              console.log(error);
            }
          },
          styles: {
            containerStyles: {
              width: '83.70%',
              position: 'relative',
            },
            fieldStyles: {
              backgroundColor: 'transparent',
              color: 'transparent',
              zIndex: '50',
              position: 'absolute',
              bottom: '0px',
              left: '0px',
              boxShadow: 'none'
            },
            labelStyles: labelStyles,
            formattedInputStyles: {
              bottom: '0px',
              left: '0px',
              zIndex: '1',
            }
          },
        }
      ],
      pageHeader: {
        text: 'Sobre List-2-Raise',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '50px',
          marginBottom: '60px',
        }
      },
      customScrollToStep: (params) => {
        this.shouldScrollBackwards = this.headerService.flowRoute ? true : false;
        
        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        this.shouldScrollBackwards = this.headerService.flowRoute ? true : false;
        
        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      }
    },
  ];

  constructor(
    private router: Router,
    private itemService: ItemsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private decimalPipe: DecimalPipe,
    private merchantService: MerchantsService,
    private saleflowSarvice: SaleFlowService,
    private headerService: HeaderService,
    private applicationRef: ApplicationRef
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const { itemId } = routeParams;
      this.currentItemId = itemId;

      if(this.headerService.flowRoute) {
        this.shouldScrollBackwards = true;
        this.formSteps[0].customScrollToStepBackwards = (params) => {
          this.router.navigate([this.headerService.flowRoute]);
          this.headerService.flowRoute = null;
        };
      }

      if (localStorage.getItem('session-token')) {
        const data = await this.authService.me()
        this.user = data;
        if (data) this.loggedIn = true;
      }

      if (this.itemService && this.itemService.temporalItem) {
        const { description, name, content } = this.itemService.temporalItem;
        let { pricing, images } = this.itemService.temporalItem;

        // console.log("seteando 1")
        // console.log("what arrived", {
        //   description, name, images, pricing, content
        // })

        // console.log("THE PRICING SET", String(pricing), this.formSteps[0].fieldsList[0].fieldControl.control.value);

        const formatted = this.decimalPipe.transform(
          pricing,
          '1.2'
        );
        
        if(pricing % 1 === 0) pricing = pricing * 100;

        this.formSteps[0].fieldsList[0].fieldControl.control.setValue(
          String(pricing)
        );

        // console.log("formatted", formatted, this.formSteps[0].fieldsList[0].fieldControl.control.value);

        if (formatted === '0') {
          this.formSteps[0].fieldsList[0].placeholder = '';
        }

        this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;

        if(images && images.length > 0) {
          this.formSteps[0].embeddedComponents[0].inputs.imageField = images;
          this.imagesAlreadyLoaded = true;
          this.formSteps[0].embeddedComponents[0].inputs.imagesAlreadyLoaded = this.imagesAlreadyLoaded;
        } 
        
        this.formSteps[2].fieldsList[0].fieldControl.control.setValue(description || '');
        this.formSteps[3].fieldsList[0].fieldControl.control.setValue(name || '');
        this.defaultImages = images;
        console.log(this.defaultImages, "di1")

        const notBase64Images = images.filter(image => !checkIfStringIsBase64DataURI(image));
        const base64Images = images.filter(image => checkIfStringIsBase64DataURI(image));

        if(notBase64Images && notBase64Images.length > 0) {
          this.formSteps[0].embeddedComponents[0].inputs.imageField = images;
          this.defaultImages = images;
          console.log(this.defaultImages, "di2")

          for(let imageURL of notBase64Images) {
            this.defaultImagesPermanent.push(imageURL);

            fetch(imageURL)
              .then(response => response.blob())
              .then(blob => new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result)
                reader.onerror = reject
                reader.readAsDataURL(blob)
              }))
              .then((base64: string) => this.files.push(base64ToFile(base64)));
          }

          this.imagesAlreadyLoaded = true;
          this.formSteps[0].embeddedComponents[0].inputs.imagesAlreadyLoaded = this.imagesAlreadyLoaded;
        }

        base64Images.forEach(image => this.files.push(base64ToFile(image)));
        

        if(Number(this.formSteps[0].fieldsList[0].fieldControl.control.value) > 0.01) {
          this.formSteps[0].headerTextSide = 'RIGHT';
          this.formSteps[0].headerText = 'PREVIEW';
        } else {
          this.formSteps[0].headerText = null;
          this.formSteps[0].headerTextSide = null;
        }

        const formArray = this.formSteps[1].fieldsList[0]
          .fieldControl.control as FormArray;
        formArray.removeAt(0);

        if (content)
          content.forEach((item) => {
            formArray.push(new FormControl(item));
          });
        else {
          formArray.push(new FormControl(''));
        }

        // this.formSteps[0].fieldsList[0].fieldControl.control.updateValueAndValidity();

        //***************************** FORZANDO EL RERENDER DE LOS EMBEDDED COMPONENTS ********** */
        this.formSteps[0].embeddedComponents[0].shouldRerender = true;

        this.headerService.removeTempNewItem();
      }

      if (itemId && this.loggedIn) {
        lockUI();
        this.editMode = true;

        this.currentUserId = this.user._id;

        this.item = await this.itemService.item(itemId);
        const { images, name, content, description, merchant } = this.item;
        let { pricing } = this.item;

        // console.log("Loaded images", images);
        // if(images.length > 0) this.files = images.map(image => base64ToFile(image)); 

        for(let formStep of this.formSteps) {
          formStep.customHelperHeaderConfig = {
            bgcolor: '#B17608',
            color: '#ffffff',
            justifyContent: 'flex-end',
            alignItems: 'center',
            rightTextStyles: {
              fontSize: '17px',
              fontFamily: 'RobotoMedium'
            },
            icon: {
              src: `https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/${
                this.item.status === 'active' ? 'open' : 'closed'
              }-eye-white.svg`,
              width: 32,
              height: 28,
              cursor: 'pointer',
              margin: '0px 0px 0px 6px',
              callback: async () => {
                await this.itemService.updateItem(
                  {
                    status: this.item.status === 'active' ? 'disabled' : this.item.status === 'disabled' ? 'active' : 'draft', 
                  },
                  this.currentItemId
                );

                this.item.status = this.item.status === 'active' ? 'disabled' : ['disabled', 'draft'].includes(this.item.status) ? 'active' : 'draft';

                for(let formStep of this.formSteps) {
                  formStep.customHelperHeaderConfig.icon.src = `https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/${
                    this.item.status === 'active' ? 'open' : 'closed'
                  }-eye-white.svg`;
                  
                  formStep.headerText = this.item.status === 'active' ?
                    'ACTIVO (EXPUESTO EN TIENDA)' :
                    'INACTIVO (NO EXPUESTO)';

                  formStep.headerTextCallback = async () => {
                    await this.itemService.updateItem(
                      {
                        status: this.item.status === 'active' ? 'disabled' : this.item.status === 'disabled' ? 'active' : 'draft', 
                      },
                      this.currentItemId
                    );

                    this.item.status = this.item.status === 'active' ? 'disabled' : ['disabled', 'draft'].includes(this.item.status) ? 'active' : 'draft';

                    for(let formStep of this.formSteps) {
                      formStep.customHelperHeaderConfig.icon.src = `https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/${
                        this.item.status === 'active' ? 'open' : 'closed'
                      }-eye-white.svg`;
                      
                      formStep.headerText = this.item.status === 'active' ?
                        'ACTIVO (EXPUESTO EN TIENDA)' :
                        'INACTIVO (NO EXPUESTO)';
                    }

                  }

                  formStep.customHelperHeaderConfig.bgcolor = this.item.status === 'active' ?
                    '#2874AD' : '#B17608';
                }
              }
            }
          }
        }


        if (this.currentUserId === merchant.owner._id) {
          this.merchantOwnerId = merchant.owner._id;
  
          const formatted = this.decimalPipe.transform(
            pricing,
            '1.2'
          );

          if(pricing % 1 === 0) pricing = pricing * 100;

          this.formSteps[0].fieldsList[0].fieldControl.control.setValue(
            String(pricing)
          );
  
          if (formatted === '0') {
            this.formSteps[0].fieldsList[0].placeholder = '';
          }
  
          this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;
          this.formSteps[3].fieldsList[0].fieldControl.control.setValue(name || '');

          this.formSteps[2].fieldsList[0].fieldControl.control.setValue(description || '');

          if(images && images.length > 0) {
            this.formSteps[0].embeddedComponents[0].inputs.imageField = images;
            this.defaultImages = images;

            console.log(this.defaultImages, "di3")

            for(let imageURL of images) {
              this.defaultImagesPermanent.push(imageURL);

              fetch(imageURL)
                .then(response => response.blob())
                .then(blob => new Promise((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onloadend = () => resolve(reader.result)
                  reader.onerror = reject
                  reader.readAsDataURL(blob)
                }))
                .then((base64: string) => this.files.push(base64ToFile(base64)));
            }

            this.imagesAlreadyLoaded = true;
            this.formSteps[0].embeddedComponents[0].inputs.imagesAlreadyLoaded = this.imagesAlreadyLoaded;

            console.log("e", this.files);
          }

          //***************************** FORZANDO EL RERENDER DE LOS EMBEDDED COMPONENTS ********** */
          this.formSteps[0].embeddedComponents[0].shouldRerender = true;

          //***************************** FORZANDO EL RERENDER DE LOS EMBEDDED COMPONENTS ********** */


          const formArray = this.formSteps[1].fieldsList[0]
            .fieldControl.control as FormArray;
          formArray.removeAt(0);

          if (content)
            content.forEach((item) => {
              formArray.push(new FormControl(item));
            });
          else {
            formArray.push(new FormControl(''));
          }
          unlockUI();
        } else {
          if (itemId) this.router.navigate(['/']);
        }
      } else {
        unlockUI();

        if (itemId) this.router.navigate(['/'])
        else {
          await this.verifyLoggedUserMerchant();
        }
      }
    });
  }

  saveItemInItemServiceAndRedirect(params, route: string, createdItemId?: string) {
    let values = params.dataModel.value;

    if((
      typeof values['1'].price !== 'string' && values['1'].price < 10
    ) || (
      typeof values['1'].price === 'string' && values['1'].price.length === 1
    )) {
      // console.log("PASANDO POR AQUÍ")
      this.formSteps[0].fieldsList[0].fieldControl.control.setValue(String('0' + values['1'].price));

      values = params.dataModel.value;
    }

    const priceWithDecimalArray = typeof values['1'].price === 'string' ? values['1'].price.split('') : String(values['1'].price).split('');
    const firstHalf = priceWithDecimalArray.slice(0, -2);
    const secondHalf = priceWithDecimalArray.slice(-2);
    const totalArray = !firstHalf.includes('.') ? firstHalf.concat('.').concat(secondHalf) : firstHalf.concat(secondHalf);
    const totalWithDecimal = Number(totalArray.join(''));

    // console.log(priceWithDecimalArray, firstHalf, secondHalf, totalArray, totalWithDecimal);

    this.itemService.storeTemporalItem({
      _id: createdItemId ? createdItemId : null,
      name: values['4'].name,
      description: values['3'].description !== '' ? values['3'].description : null,
      pricing: totalWithDecimal,
      images: this.defaultImages.filter(image => image !== ''),
      merchant: this.loggedUserDefaultMerchant ? this.loggedUserDefaultMerchant?._id : null,
      content: values['2'].whatsIncluded.length > 0 && !(
        values['2'].whatsIncluded.length === 1 &&
        values['2'].whatsIncluded[0] === ''
      ) ? values['2'].whatsIncluded : null,
      currencies: [],
      hasExtraPrice: false,
      purchaseLocations: [],
    });

    this.router.navigate([route]);
  }

  async verifyLoggedUserMerchant() {
    if (this.loggedIn) {
      const defaultMerchant = await this.merchantService.merchantDefault();
      
      if (defaultMerchant) {
        this.loggedUserDefaultMerchant = defaultMerchant;

        const defaultSaleflow = await this.saleflowSarvice.saleflowDefault(defaultMerchant?._id);
        
        if(defaultSaleflow)
          this.loggedUserDefaultSaleflow = defaultSaleflow;
      } else {
        const merchants = await this.merchantService.myMerchants();

        if(merchants.length === 0) {
          const { createMerchant: createdMerchant } = await this.merchantService.createMerchant({
            owner: this.user._id,
            name: this.user.name + " mechant #" + Math.floor(Math.random() * 100000)
          });
  
          const { merchantSetDefault: defaultMerchant } = await this.merchantService.setDefaultMerchant(createdMerchant._id);
          this.loggedUserDefaultMerchant = defaultMerchant;
  
          const { createSaleflow: createdSaleflow } = await this.saleflowSarvice.createSaleflow({
            merchant: defaultMerchant._id,
            name: defaultMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
            items: []
          });
          const { saleflowSetDefault: defaultSaleflow } = await this.saleflowSarvice.setDefaultSaleflow(defaultMerchant._id, createdSaleflow._id);
          this.loggedUserDefaultSaleflow = defaultSaleflow;
        } else {
          const { merchantSetDefault: defaultMerchant } = await this.merchantService.setDefaultMerchant(merchants[0]._id);
          this.loggedUserDefaultMerchant = defaultMerchant;

          const defaultSaleflow = await this.saleflowSarvice.saleflowDefault(defaultMerchant?._id);

          if (!defaultSaleflow) {
            const saleflows = await this.saleflowSarvice.saleflows(merchants[0]._id, {});

            if(!saleflows || saleflows.length === 0) {
              const { createSaleflow: createdSaleflow } = await this.saleflowSarvice.createSaleflow({
                merchant: defaultMerchant._id,
                name: defaultMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
                items: []
              });

              const { saleflowSetDefault: defaultSaleflow } = await this.saleflowSarvice.setDefaultSaleflow(defaultMerchant._id, createdSaleflow._id);
              this.loggedUserDefaultSaleflow = defaultSaleflow;
            } else {
              const { saleflowSetDefault: defaultSaleflow } = await this.saleflowSarvice.setDefaultSaleflow(defaultMerchant._id, saleflows[0]._id);
              this.loggedUserDefaultSaleflow = defaultSaleflow;
            }
          } else {
            this.loggedUserDefaultSaleflow = defaultSaleflow;
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    if(this.headerService.flowRoute && !this.createdItem) this.headerService.flowRoute = null;
  }
}