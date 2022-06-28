import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { of } from 'rxjs';
import { PostsService } from 'src/app/core/services/posts.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { PostEditButtonsComponent } from 'src/app/shared/components/post-edit-buttons/post-edit-buttons.component';
import { FormStep } from 'src/app/core/types/multistep-form';

const lightLabelStyles = {
  fontFamily: 'Roboto',
  fontSize: '19px',
  fontWeight: 300,
  marginBottom: '18px',
};

@Component({
  selector: 'app-create-giftcard',
  templateUrl: './create-giftcard.component.html',
  styleUrls: ['./create-giftcard.component.scss'],
})
export class CreateGiftcardComponent implements OnInit, OnDestroy {
  constructor(
    private header: HeaderService,
    private router: Router,
    private dialog: DialogService,
    private post: PostsService
  ) { }
  //added create-giftcard again because the merge was deleted??????

  storeEmptyMessageAndGoToShipmentDataForm(params) {
    localStorage.removeItem('createdPostId');

    this.header.post = {
      message: '',
      targets: [
        {
          name: '',
          emailOrPhone: '',
        },
      ],
      from: '',
      multimedia: [],
      socialNetworks: [
        {
          url: '',
        },
      ],
    };

    this.header.storePost(
      this.header.saleflow?._id ?? this.header.getSaleflow()._id,
      {
        message: '',
        targets: [
          {
            name: '',
            emailOrPhone: '',
          },
        ],
        from: '',
        multimedia: [],
        socialNetworks: [
          {
            url: '',
          },
        ],
      }
    );

    if (this.scrollableForm) {
      params.unblockScrollPastCurrentStep();
      params.unblockScrollBeforeCurrentStep();
    }

    this.header.isComplete.message = true;
    this.header.storeOrderProgress(this.header.saleflow._id);
    this.router.navigate([`ecommerce/shipment-data-form`]);
  }

  savePreviousStepsDataBeforeEnteringPreview = (params) => {
    if (!this.addedScrollBlockerBefore && this.scrollableForm) {
      //quita el scroll hacia steps anteriores
      params.unblockScrollBeforeCurrentStep();

      setTimeout(() => {
        params.blockScrollBeforeCurrentStep();
        this.scrollBlockerBefore = params.blockScrollBeforeCurrentStep;
        this.removeScrollBlockerBefore = params.unblockScrollBeforeCurrentStep;
      }, 500);

      params.changeShouldScrollBackwards();

      this.addedScrollBlockerBefore = true;
    }

    this.formSteps[3].fieldsList[0].fieldControl.control.setValue(
      this.formSteps[1].fieldsList[0].fieldControl.control.value
    );
    this.formSteps[3].fieldsList[1].fieldControl.control.setValue(
      this.formSteps[1].fieldsList[1].fieldControl.control.value
    );
    this.formSteps[3].fieldsList[2].fieldControl.control.setValue(
      this.formSteps[1].fieldsList[2].fieldControl.control.value
    );
    this.formSteps[3].fieldsList[3].fieldControl.control.setValue(
      this.formSteps[2].fieldsList[0].fieldControl.control.value
    );

    return { ok: true };
  };

  public continueOrder = () => {
    this.router.navigate(['/ecommerce/create-giftcard']);
  };

  showShoppingCartDialog() {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        headerButton: 'Ver mas productos',
        orderFinished: true,
        footerCallback: () =>
          this.router.navigate(['/ecommerce/create-giftcard']),
        headerCallback: () =>
          this.router.navigate([
            `ecommerce/megaphone-v3/${this.header.saleflow._id}`,
          ]),
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  addedScrollBlockerBefore = false;
  scrollBlockerBefore: any;
  removeScrollBlockerBefore: any;
  scrollableForm = false;
  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'writeMessage',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions:
            [
              'Sin mensaje y sin tarjetita',
              // 'Recibes la tarjetita vacía y escribes tu el mensajito',
              'Nosotros escribiremos el mensaje en una tarjetita',
              // 'Tarjeta con qrCode para un mensaje privado que incluye texto, audio, video y fotos.'
            ],
          changeCallbackFunction: (change, params) => {
            this.formSteps[0].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });

            this.formSteps[0].stepProcessingFunction(params);
            if (change === 'Nosotros escribiremos el mensaje en una tarjetita') {
              params.scrollToStep(1);
            }
            if (change === 'Tarjeta con qrCode para un mensaje privado que incluye texto, audio, video y fotos.') {
              this.router.navigate(['ecommerce/post-edit'], {
                queryParams: { viewtype: "order" }
              });
            }
          },
          label: '¿Que tipo de mensajito de regalo prefieres?',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '58px',
            },
            fieldStyles: {
              marginTop: '50px'
            },
          },
        },
      ],
      stepProcessingFunction: (params) => {
        this.scrollBlockerBefore = params.blockScrollBeforeCurrentStep;
        this.removeScrollBlockerBefore = params.unblockScrollBeforeCurrentStep;

        if (params.scrollableForm) {
          setTimeout(() => {
            params.blockScrollBeforeCurrentStep();
            this.scrollBlockerBefore = params.blockScrollBeforeCurrentStep;
            this.removeScrollBlockerBefore =
              params.unblockScrollBeforeCurrentStep;
          }, 500);
        }

        if (params.dataModel.value['1'].writeMessage === 'Nosotros escribiremos el mensaje en una tarjetita')
          return { ok: true };
        else if (params.dataModel.value['1'].writeMessage === 'Sin mensaje y sin tarjetita') {
          this.storeEmptyMessageAndGoToShipmentDataForm(params);
          return { ok: false };
        }
        else if (params.dataModel.value['1'].writeMessage === 'Tarjeta con qrCode para un mensaje privado que incluye texto, audio, video y fotos.') {
          return { ok: false };
        }
      },
      // embeddedComponents: [
      //   {
      //     component: PostEditButtonsComponent,
      //     afterIndex: 0,
      //     inputs: []
      //   },
      // ],
      customScrollToStepBackwards: (params) => {
        if (this.scrollableForm) {
          params.unblockScrollPastCurrentStep();
          params.unblockScrollBeforeCurrentStep();
        }

        this.router.navigate([
          `ecommerce/megaphone-v3/${this.header.saleflow._id}`,
        ]);
      },
      showShoppingCartOnCurrentStep: true,
      shoppingCartCallback: () => {
        this.showShoppingCartDialog();
      },
      headerText: 'INFORMACIÓN DE LA ORDEN',
      stepButtonInvalidText: 'TOCA EN LA OPCION QUE PREFIERAS',
      stepButtonValidText: 'CONTINUAR',
    },
    {
      fieldsList: [
        {
          name: 'receiver',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: '¿Para quién es?',
          placeholder: 'Type...',
          topLabelAction: {
            text: 'Sin mensaje de regalo',
            clickable: true,
            callback: (params) => {
              this.storeEmptyMessageAndGoToShipmentDataForm(params);
            },
          },
          styles: {
            containerStyles: {
              marginTop: '68px',
            },
            topLabelActionStyles: {
              display: 'block',
              color: '#27A2FF',
              fontSize: '16px',
              fontFamily: 'RobotoMedium',
              cursor: 'pointer',
              margin: '0px',
              marginTop: '68px',
              marginBottom: '33px',
            },
            labelStyles: lightLabelStyles,
          },
        },
        {
          name: 'sender',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: '¿De parte de quién o quienes?',
          placeholder: 'Type...',
          styles: {
            containerStyles: {
              marginTop: '80px',
              marginBottom: '80px',
            },
            labelStyles: lightLabelStyles,
          },
        },
        {
          name: 'message',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: '¿Que mensaje escribiremos?',
          inputType: 'textarea',
          placeholder: 'Type your message here...',
          styles: {
            containerStyles: {
              marginBottom: '90px',
            },
            fieldStyles: {
              boxShadow: '0px 4px 5px 0px #ddd inset',
              color: '#0b1f38',
              width: '100%',
              fontFamily: 'RobotoMedium',
              height: '164px',
              padding: '23px',
              resize: 'none',
              fontSize: '20px',
              // border: '2px solid #31a4f9',
              borderRadius: '10px',
              backgroundColor: '#fff',
            },
            labelStyles: lightLabelStyles,
          },
        },
      ],
      customScrollToStepBackwards: (params) => {
        if (this.scrollableForm) {
          params.unblockScrollPastCurrentStep();
          params.unblockScrollBeforeCurrentStep();
        }

        // this.router.navigate([
        //   `ecommerce/megaphone-v3/${this.header.saleflow._id}`,
        // ]);
        this.formSteps[0].fieldsList[0].fieldControl.control.setValue('', {
          emitEvent: false,
        });

        params.scrollToStep(0, false);
      },
      // customScrollToStepBackwards: (params) => { Esto estaba cuando el primer step era si/no
      //   this.formSteps[0].fieldsList[0].fieldControl.setValue('', {
      //     emitEvent: false,
      //   });

      //   params.scrollToStep(0, false);
      // },
      // optionalLinksTo: {
      //   styles: {
      //     containerStyles: { marginTop: '109px', marginBottom: '80px' },
      //   },
      //   links: [
      //     {
      //       text: 'Que la parte de atrás sea una fotografia',
      //       action: (params) => {
      //         if (this.scrollableForm) {
      //           params.unblockScrollBeforeCurrentStep();
      //           params.unblockScrollPastCurrentStep();
      //         }

      //         if (params.dataModel.get('2').status === 'VALID')
      //           params.scrollToStep(2);

      //         if (params.scrollableForm) {
      //           setTimeout(() => {
      //             params.blockScrollBeforeCurrentStep();
      //             this.scrollBlockerBefore =
      //               params.blockScrollBeforeCurrentStep;
      //             this.removeScrollBlockerBefore =
      //               params.unblockScrollBeforeCurrentStep;
      //           }, 500);
      //         }
      //       },
      //     },
      //   ],
      // },
      asyncStepProcessingFunction: {
        //esto deberia estar en el step 4, el de editar, está en el 2, porque se quizo quitar la foto de este flow
        type: 'promise',
        function: async (params) => {
          if (
            params.dataModel.value['1']['message'] === '' &&
            params.dataModel.value['1']['receiver'] === '' &&
            params.dataModel.value['1']['sender'] === ''
          ) {
            this.storeEmptyMessageAndGoToShipmentDataForm(params);
            return of({
              ok: false,
            });
          }

          this.header.post = {
            message: params.dataModel.value['1']['message'],
            targets: [
              {
                name: params.dataModel.value['1']['receiver'],
                emailOrPhone: '',
              },
            ],
            from: params.dataModel.value['1']['sender'],
            // multimedia: [this.header.flowImage],
            multimedia: this.header.flowImage,
            socialNetworks: [
              {
                url: '',
              },
            ],
          };

          const postInput = {
            message: params.dataModel.value['1']['message'],
            targets: [
              {
                name: params.dataModel.value['1']['receiver'],
                emailOrPhone: '',
              },
            ],
            from: params.dataModel.value['1']['sender'],
            // multimedia: this.header.flowImage,
            socialNetworks: [
              {
                url: '',
              },
            ],
          };

          try {
            let postResult = await this.post.createPost(postInput);

            const { createPost } = postResult;
            const { _id: postId } = createPost;

            localStorage.setItem('createdPostId', postId);

            this.header.isComplete.message = true;
            this.header.storeOrderProgress(this.header.saleflow._id);
            this.router.navigate([`ecommerce/shipment-data-form`]);

            return of({
              ok: true,
            });
          } catch (error) {
            console.log('Error creando la orden', error);

            return of({
              ok: false,
            });
          }
        },
      },
      // stepProcessingFunction: this.savePreviousStepsDataBeforeEnteringPreview,
      customScrollToStep: (params) => {
        // ANTES
        // params.scrollToStep(3);

        params.scrollToStep(1);
      },
      showShoppingCartOnCurrentStep: true,
      shoppingCartCallback: () => {
        this.showShoppingCartDialog();
      },
      headerText: 'Comprar más',
      headerTextSide: 'LEFT',
      stepButtonInvalidText: 'ADICIONA EL MENSAJE',
      stepButtonValidText: 'CONTINUAR',
    },
    // {
    //   fieldsList: [
    //     {
    //       name: 'photo',
    //       fieldControl: new FormControl(''),
    //       label: 'Adicione la foto',
    //       inputType: 'file',
    //       placeholder: 'sube una imagen',
    //       styles: {
    //         fieldStyles: {
    //           marginTop: '60px',
    //           width: '60%',
    //         },
    //         labelStyles: {
    //           marginTop: '71px',
    //         },
    //       },
    //     },
    //   ],
    //   stepProcessingFunction: this.savePreviousStepsDataBeforeEnteringPreview,
    //   headerText: 'FOTOGRAFIA EN EL MENSAJE',
    //   stepButtonInvalidText: 'ADICIONA LA FOTO',
    //   stepButtonValidText: 'ADICIONA LA FOTO',
    // },
    // {
    //   fieldsList: [
    //     {
    //       name: 'message-edit',
    //       fieldControl: new FormControl('', Validators.required),
    //       label: '¿Que mensaje escribiremos?',
    //       inputType: 'textarea',
    //       placeholder: 'Type your message here...',
    //       styles: {
    //         containerStyles: {
    //           marginTop: '60px',
    //         },
    //         fieldStyles: {
    //           boxShadow: '0px 4px 5px 0px #ddd inset',
    //           color: '#0b1f38',
    //           width: '100%',
    //           fontFamily: 'RobotoMedium',
    //           height: '164px',
    //           padding: '23px',
    //           resize: 'none',
    //           fontSize: '20px',
    //           // border: '2px solid #31a4f9',
    //           borderRadius: '10px',
    //           backgroundColor: '#fff',
    //         },
    //       },
    //     },
    //     {
    //       name: 'receiver-edit',
    //       fieldControl: new FormControl('', Validators.required),
    //       label: '¿Para quién es?',
    //       placeholder: 'Type...',
    //       styles: {
    //         // customClassName: 'loquesea',
    //         containerStyles: {
    //           marginTop: '80px',
    //         },
    //         labelStyles: lightLabelStyles,
    //       },
    //     },
    //     {
    //       name: 'sender-edit',
    //       fieldControl: new FormControl('', Validators.required),
    //       label: '¿De parte de quién o quienes?',
    //       placeholder: 'Type...',
    //       styles: {
    //         containerStyles: {
    //           marginTop: '80px',
    //         },
    //         labelStyles: lightLabelStyles,
    //       },
    //     },
    //     // {
    //     //   name: 'photo-edit',
    //     //   fieldControl: new FormControl(''),
    //     //   label: 'Optional',
    //     //   inputType: 'file',
    //     //   showImageBottomLabel: 'Editar fotografía',
    //     //   placeholder: 'sube una imagen',
    //     //   styles: {
    //     //     fieldStyles: {
    //     //       marginTop: '28.7px',
    //     //       width: '60%',
    //     //     },
    //     //     containerStyles: {
    //     //       marginBottom: '109px',
    //     //     },
    //     //     labelStyles: {
    //     //       margin: '0px',
    //     //       marginTop: '109px',
    //     //       fontSize: '19px',
    //     //       fontFamily: 'Roboto',
    //     //       fontWeight: 'lighter',
    //     //     },
    //     //   },
    //     // },
    //   ],
    //   bottomLeftAction: {
    //     text: 'Sin mensaje de regalo',
    //     execute: (params) => {
    //       this.storeEmptyMessageAndGoToShipmentDataForm(params);
    //     },
    //   },
    // asyncStepProcessingFunction: {
    //   type: 'promise',
    //   function: async (params) => {
    //     this.header.post = {
    //       message: params.dataModel.value['4']['message-edit'],
    //       targets: [
    //         {
    //           name: params.dataModel.value['4']['receiver-edit'],
    //           emailOrPhone: '',
    //         },
    //       ],
    //       from: params.dataModel.value['4']['sender-edit'],
    //       // multimedia: [this.header.flowImage],
    //       multimedia: this.header.flowImage,
    //       socialNetworks: [
    //         {
    //           url: '',
    //         },
    //       ],
    //     };

    //     const postInput = {
    //       message: params.dataModel.value['4']['message-edit'],
    //       targets: [
    //         {
    //           name: params.dataModel.value['4']['receiver-edit'],
    //           emailOrPhone: '',
    //         },
    //       ],
    //       from: params.dataModel.value['4']['sender-edit'],
    //       multimedia: this.header.flowImage,
    //       socialNetworks: [
    //         {
    //           url: '',
    //         },
    //       ],
    //     };

    //     try {
    //       let postResult = await this.post.createPost(postInput);

    //       const { createPost } = postResult;
    //       const { _id: postId } = createPost;

    //       localStorage.setItem('createdPostId', postId);

    //       this.header.isComplete.message = true;
    //       this.header.storeOrderProgress(this.header.saleflow._id);
    //       this.router.navigate([`ecommerce/shipment-data-form`]);

    //       return of({
    //         ok: true,
    //       });
    //     } catch (error) {
    //       console.log('Error creando la orden', error);

    //       return of({
    //         ok: false,
    //       });
    //     }
    //   },
    // },
    //   headerText: 'INFORMACIÓN DEL MENSAJE DE REGALO',
    //   stepButtonInvalidText: 'ADICIONA EL MENSAJE',
    //   stepButtonValidText: 'CONTINUAR A LA ENTREGA',
    // },
  ];

  ngOnInit(): void {
    this.header.flowRoute = 'create-giftcard';
    localStorage.setItem('flowRoute', 'create-giftcard');

    if (!this.header.saleflow) {
      const saleflow = this.header.getSaleflow();
      if (saleflow) {
        this.header.saleflow = saleflow;
        this.header.order = this.header.getOrder(saleflow._id);
        if (!this.header.order) {
          this.router.navigate([`/ecommerce/trivias`]);
          return;
        }
        this.header.getOrderProgress(saleflow._id);
        const items = this.header.getItems(saleflow._id);
        if (items && items.length > 0) this.header.items = items;
        else this.router.navigate([`/ecommerce/trivias`]);
      } else this.router.navigate([`/ecommerce/trivias`]);
    } else {
      this.header.order = this.header.getOrder(this.header.saleflow._id);
      if (!this.header.order) {
        this.router.navigate([`/ecommerce/trivias`]);
        return;
      }
      const items = this.header.getItems(this.header.saleflow._id);
      if (items && items.length > 0) this.header.items = items;
      else this.router.navigate([`/ecommerce/trivias`]);
    }
  }

  ngOnDestroy(): void {
    if (this.addedScrollBlockerBefore && this.scrollableForm) {
      this.removeScrollBlockerBefore();
    }
  }
}
