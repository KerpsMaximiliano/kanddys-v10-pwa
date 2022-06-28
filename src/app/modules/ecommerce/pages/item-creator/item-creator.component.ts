import { Component, OnInit, ApplicationRef } from '@angular/core';
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

const labelStyles = {
  color: '#7B7B7B',
  fontFamily: 'RobotoMedium',
  fontSize: '17px'
};

@Component({
  selector: 'app-item-creator',
  templateUrl: './item-creator.component.html',
  styleUrls: ['./item-creator.component.scss'],
})
export class ItemCreatorComponent implements OnInit {
  currentUserId: string = null;
  merchantOwnerId: string = null;
  currentItemId: string = null;
  scrollableForm = false;
  defaultImages: (string | ArrayBuffer)[] = [''];
  loggedUserDefaultMerchant: Merchant;
  loggedUserDefaultSaleflow: SaleFlow;
  loggedIn: boolean = false;
  user: any;
  shouldScrollBackwards: boolean = false;
  files: File[] = [];

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
            await this.itemService.updateItem(
              {
                name: values['4'].name,
                description: values['3'].description,
                pricing: totalWithDecimal,
                images: this.files,
                content: values['2'].whatsIncluded,
                currencies: [],
                hasExtraPrice: false,
                purchaseLocations: [],
              },
              this.currentItemId
            );
            // this.router.navigate([`/ecommerce/item-display/${this.currentItemId}`]);
            // this.router.navigate([`/ecommerce/authentication/${this.currentItemId}`]);
            this.router.navigate([`/ecommerce/user-items`]);
          } else {
            if (this.loggedIn) {
              console.log(this.loggedUserDefaultMerchant);
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

                this.router.navigate([`/ecommerce/user-items`]);

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
              if ('_id' in createPreItem) this.router.navigate([`/ecommerce/authentication/${createPreItem?._id}`]);
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
          formattedValue: '$' + this.decimalPipe.transform(
            Number(0),
            '1.2'
          ),
          shouldFormatNumber: true,
          focused: false,
          placeholder: 'Precio...',
          changeCallbackFunction: (change, params) => {
            try {
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
                this.formSteps[0].fieldsList[0].fieldControl.control.setValue(convertedNumber, {
                  emitEvent: false,
                });
              }
            } catch (error) {
              console.log(error);
            }
          },
          styles: {
            containerStyles: {
              width: '58.011%',
              minWidth: '210px',
              marginTop: '102px',
              position: 'relative',
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
            labelStyles: labelStyles
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
            allowedTypes: ['png', 'jpg', 'jpeg'],
            imagesPerView: 3,
            innerLabel: 'Adiciona las imágenes',
            topLabel: {
              text: 'Adiciona las imágenes:',
              styles: {
                color: '#7B7B7B',
                fontFamily: 'RobotoMedium',
                fontSize: '17px',
                margin: '0px',
                marginBottom: '21px'
              },
            },
            containerStyles: {
              width: '157px',
              height: '137px',
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
              await this.itemService.updateItem(
                {
                  name: values['4'].name,
                  description: values['3'].description,
                  pricing: totalWithDecimal,
                  images: this.files,
                  content: values['2'].whatsIncluded,
                  currencies: [],
                  hasExtraPrice: false,
                  purchaseLocations: [],
                },
                this.currentItemId
              );

              this.headerService.flowRoute = this.router.url;
              // this.router.navigate([`/ecommerce/item-display/${this.currentItemId}`]);
              // this.router.navigate([`/ecommerce/authentication/${this.currentItemId}`]);
              this.router.navigate([`/ecommerce/user-items`]);
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
                  this.router.navigate([`/ecommerce/user-items`]);
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
                  this.router.navigate([`/ecommerce/authentication/${createPreItem?._id}`])
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
                marginTop: '40px',
                marginBottom: '0px'
              },
              fieldStyles: {
                marginTop: '18px',
                paddingLeft: '17px',
                width: 'fit-content'
              },
              labelStyles: labelStyles
            },
            links: [
              {
                text: 'Nombre',
                action: (params) => {
                  this.shouldScrollBackwards = true;
                  params.scrollToStep(3);
                }
              },
              {
                text: 'Descripción',
                action: (params) => {
                  this.shouldScrollBackwards = true;
                  params.scrollToStep(2);
                }
              },
              {
                text: 'Lo incluido',
                action: (params) => {
                  this.shouldScrollBackwards = true;
                  params.scrollToStep(1);
                }
              },
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
          marginTop: '50px',
          marginBottom: '60px',
        }
      },
      avoidGoingToNextStep: true,
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
              marginTop: '71px',
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
        this.shouldScrollBackwards = false;
        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        this.shouldScrollBackwards = false;
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
              marginTop: '71px',
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
        this.shouldScrollBackwards = false;
        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        this.shouldScrollBackwards = false;
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
              marginTop: '71px',
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
        this.shouldScrollBackwards = false;
        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        this.shouldScrollBackwards = false;
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
        this.shouldScrollBackwards = false;
        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        this.shouldScrollBackwards = false;
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

      if (localStorage.getItem('session-token')) {
        const data = await this.authService.me()
        if (data) this.loggedIn = true;
      }

      if (this.headerService.newTempItem && this.headerService.newTempItemRoute) {
        const { description, name, images, pricing, content } = this.headerService.newTempItem;

        this.formSteps[0].fieldsList[0].fieldControl.control.setValue(
          String(pricing)
        );

        const plainNumber = String(pricing)
          .split(',')
          .join('')
          .split('.')
          .join('');
        const formatted = this.decimalPipe.transform(
          Number(plainNumber),
          '1.0-2'
        );

        if (formatted === '0') {
          this.formSteps[0].fieldsList[0].placeholder = '';
        }

        this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;

        this.formSteps[0].embeddedComponents[0].inputs.imageField = images;
        this.formSteps[2].fieldsList[0].fieldControl.control.setValue(description || '');
        this.formSteps[3].fieldsList[0].fieldControl.control.setValue(name || '');
        this.defaultImages = images;

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

        //***************************** FORZANDO EL RERENDER DE LOS EMBEDDED COMPONENTS ********** */
        this.formSteps[0].embeddedComponents[0].shouldRerender = true;

        this.headerService.removeTempNewItem();
      }

      if (itemId && this.loggedIn) {
        lockUI();

        this.currentUserId = this.user._id;

        const { pricing, images, content, description, merchant } =
          await this.itemService.item(itemId);

        if (this.currentUserId === merchant.owner._id) {
          this.merchantOwnerId = merchant.owner._id;

          this.formSteps[0].fieldsList[0].fieldControl.control.setValue(
            String(pricing)
          );
          this.formSteps[2].fieldsList[0].fieldControl.control.setValue(description || '');
          this.formSteps[0].embeddedComponents[0].inputs.imageField = images;
          this.defaultImages = images;

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

  async verifyLoggedUserMerchant() {
    if (this.loggedIn) {
      const defaultMerchant = await this.merchantService.merchantDefault();
      const defaultSaleflow = await this.saleflowSarvice.saleflowDefault(defaultMerchant?._id);


      if (defaultMerchant && defaultSaleflow) {
        this.loggedUserDefaultMerchant = defaultMerchant;
        this.loggedUserDefaultSaleflow = defaultSaleflow;
      }
    }
  }
}