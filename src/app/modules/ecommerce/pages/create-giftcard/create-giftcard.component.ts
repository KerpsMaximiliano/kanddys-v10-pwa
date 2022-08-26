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
  ) {}

  storeEmptyMessageAndGoToShipmentDataForm(params) {
    const emptyPost = {
      message: '',
      targets: [
        {
          name: '',
          emailOrPhone: '',
        },
      ],
      from: '',
      socialNetworks: [
        {
          url: '',
        },
      ],
    };
    this.header.post = emptyPost;

    this.header.storePost(
      this.header.saleflow?._id ?? this.header.getSaleflow()._id,
      emptyPost
    );

    if (this.scrollableForm) {
      params.unblockScrollPastCurrentStep();
      params.unblockScrollBeforeCurrentStep();
    }

    this.header.isComplete.message = true;
    this.header.storeOrderProgress(this.header.saleflow._id);
    if (!this.header.saleflow.module?.delivery?.isActive) {
      this.router.navigate([`ecommerce/checkout`]);
      return { ok: true };
    }
    if (this.header.saleflow.module.delivery.deliveryLocation) {
      this.router.navigate([`ecommerce/new-address`]);
      return { ok: true };
    }
    if (
      this.header.saleflow.module.delivery.pickUpLocations.length === 1 &&
      !this.header.saleflow.module.delivery.deliveryLocation
    ) {
      const { _id, ...addressInput } =
        this.header.saleflow.module.delivery.pickUpLocations[0];
      this.header.order.products.forEach((product) => {
        product.deliveryLocation = addressInput;
      });
      this.header.storeLocation(this.header.getSaleflow()._id, addressInput);
      this.header.isComplete.delivery = true;
      this.header.storeOrderProgress(
        this.header.saleflow?._id || this.header.getSaleflow()?._id
      );
      this.router.navigate(['ecommerce/checkout']);
    }
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
          this.router.navigate([`ecommerce/store/${this.header.saleflow._id}`]),
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
            control: new FormControl('', Validators.required),
          },
          selectionOptions: [
            'Sin mensaje y sin tarjetita',
            // 'Recibes la tarjetita vacía y escribes tu el mensajito',
            'Nosotros escribiremos el mensaje en una tarjetita',
            // 'Tarjeta con qrCode para un mensaje privado que incluye texto, audio, video y fotos.'
          ],
          changeCallbackFunction: (change, params) => {
            this.formSteps[0].fieldsList[0].fieldControl.control.setValue(
              change,
              {
                emitEvent: false,
              }
            );

            this.formSteps[0].stepProcessingFunction(params);
            if (
              change === 'Nosotros escribiremos el mensaje en una tarjetita'
            ) {
              params.scrollToStep(1);
            }
            if (
              change ===
              'Tarjeta con qrCode para un mensaje privado que incluye texto, audio, video y fotos.'
            ) {
              this.router.navigate(['others/post-edit'], {
                queryParams: { viewtype: 'order' },
              });
            }
          },
          label: '¿Que tipo de mensajito de regalo prefieres?',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '32px',
            },
            fieldStyles: {
              marginTop: '14px',
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

        if (
          params.dataModel.value['1'].writeMessage ===
          'Nosotros escribiremos el mensaje en una tarjetita'
        )
          return { ok: true };
        else if (
          params.dataModel.value['1'].writeMessage ===
          'Sin mensaje y sin tarjetita'
        ) {
          this.storeEmptyMessageAndGoToShipmentDataForm(params);
          return { ok: false };
        } else if (
          params.dataModel.value['1'].writeMessage ===
          'Tarjeta con qrCode para un mensaje privado que incluye texto, audio, video y fotos.'
        ) {
          return { ok: false };
        }
      },
      customScrollToStepBackwards: (params) => {
        if (this.scrollableForm) {
          params.unblockScrollPastCurrentStep();
          params.unblockScrollBeforeCurrentStep();
        }

        this.router.navigate([`ecommerce/store/${this.header.saleflow._id}`]);
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
            control: new FormControl(''),
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
            topLabelActionStyles: {
              display: 'block',
              color: '#27A2FF',
              fontSize: '16px',
              fontFamily: 'RobotoMedium',
              cursor: 'pointer',
              margin: '0px',
              marginTop: '32px',
              marginBottom: '24px',
            },
            labelStyles: lightLabelStyles,
          },
        },
        {
          name: 'sender',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: '¿De parte de quién o quienes?',
          placeholder: 'Type...',
          styles: {
            containerStyles: {
              marginTop: '32px',
              marginBottom: '32px',
            },
            labelStyles: lightLabelStyles,
          },
        },
        {
          name: 'message',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: '¿Que mensaje escribiremos?',
          inputType: 'textarea',
          placeholder: 'Type your message here...',
          styles: {
            containerStyles: {
              marginBottom: '30px',
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
              border: 'none',
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
        this.formSteps[0].fieldsList[0].fieldControl.control.setValue('', {
          emitEvent: false,
        });

        params.scrollToStep(0, false);
      },
      asyncStepProcessingFunction: {
        //esto deberia estar en el step 4, el de editar, está en el 2, porque se quizo quitar la foto de este flow
        type: 'promise',
        function: async (params) => {
          if (
            params.dataModel.value['2']['message'] === '' &&
            params.dataModel.value['2']['receiver'] === '' &&
            params.dataModel.value['2']['sender'] === ''
          ) {
            this.storeEmptyMessageAndGoToShipmentDataForm(params);
            return of({
              ok: false,
            });
          }

          this.header.post = {
            message: params.dataModel.value['2']['message'],
            targets: [
              {
                name: params.dataModel.value['2']['receiver'],
                emailOrPhone: '',
              },
            ],
            from: params.dataModel.value['2']['sender'],
            // multimedia: [this.header.flowImage],
            multimedia: this.header.flowImage,
            socialNetworks: [
              {
                url: '',
              },
            ],
          };

          const postInput = {
            message: params.dataModel.value['2']['message'],
            targets: [
              {
                name: params.dataModel.value['2']['receiver'],
                emailOrPhone: '',
              },
            ],
            from: params.dataModel.value['2']['sender'],
            // multimedia: this.header.flowImage,
            socialNetworks: [
              {
                url: '',
              },
            ],
          };

          this.header.post = postInput;
          this.header.storePost(
            this.header.saleflow?._id ?? this.header.getSaleflow()._id,
            postInput
          );

          try {
            this.header.isComplete.message = true;
            this.header.storeOrderProgress(this.header.saleflow._id);
            if (!this.header.saleflow.module?.delivery?.isActive) {
              this.router.navigate([`ecommerce/checkout`]);
              return { ok: true };
            }
            if (this.header.saleflow.module.delivery.deliveryLocation) {
              this.router.navigate([`ecommerce/new-address`]);
              return { ok: true };
            }
            if (
              this.header.saleflow.module.delivery.pickUpLocations.length ===
                1 &&
              !this.header.saleflow.module.delivery.deliveryLocation
            ) {
              const { _id, ...addressInput } =
                this.header.saleflow.module.delivery.pickUpLocations[0];
              this.header.order.products.forEach((product) => {
                product.deliveryLocation = addressInput;
              });
              this.header.storeLocation(
                this.header.getSaleflow()._id,
                addressInput
              );
              this.header.isComplete.delivery = true;
              this.header.storeOrderProgress(
                this.header.saleflow?._id || this.header.getSaleflow()?._id
              );
              this.router.navigate(['ecommerce/checkout']);
            }

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
      customScrollToStep: (params) => {
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
