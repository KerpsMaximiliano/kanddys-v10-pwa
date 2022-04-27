import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';

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
    private dialog: DialogService
  ) {}
  //added create-giftcard again because the merge was deleted??????

  storeEmptyMessageAndGoToShipmentDataForm(params) {
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
      this.header.saleflow?._id ?? this.header.getFlowId(),
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

    params.unblockScrollPastCurrentStep();
    params.unblockScrollBeforeCurrentStep();

    this.header.isComplete.message = true;
    this.router.navigate([`ecommerce/shipment-data-form`]);
  }

  savePreviousStepsDataBeforeEnteringPreview = (params) => {
    if (!this.addedScrollBlockerBefore) {
      //quita el scroll hacia steps anteriores
      console.log('Parametros', params);
      setTimeout(() => {
        params.blockScrollBeforeCurrentStep();
        this.scrollBlockerBefore = params.blockScrollBeforeCurrentStep;
        this.removeScrollBlockerBefore = params.unblockScrollBeforeCurrentStep;
      }, 500);

      params.changeShouldScrollBackwards();
      this.addedScrollBlockerBefore = true;
    }

    console.log(this);

    this.formSteps[3].fieldsList[0].fieldControl.setValue(
      this.formSteps[1].fieldsList[0].fieldControl.value
    );
    this.formSteps[3].fieldsList[1].fieldControl.setValue(
      this.formSteps[1].fieldsList[1].fieldControl.value
    );
    this.formSteps[3].fieldsList[2].fieldControl.setValue(
      this.formSteps[1].fieldsList[2].fieldControl.value
    );
    this.formSteps[3].fieldsList[3].fieldControl.setValue(
      this.formSteps[2].fieldsList[0].fieldControl.value
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
        callback: this.continueOrder,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  addedScrollBlockerBefore = false;
  scrollBlockerBefore: any;
  removeScrollBlockerBefore: any;
  formSteps = [
    {
      fieldsList: [
        {
          name: 'writeMessage',
          fieldControl: new FormControl('', Validators.required),
          selectionOptions: ['Si', 'No'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[0].fieldsList[0].fieldControl.setValue(change, {
              emitEvent: false,
            });

            this.formSteps[0].stepProcessingFunction(params);
            if (change === 'Si') {
              params.scrollToStep(1);
            }
          },
          label: '¿Te interesa escribirle un mensajito de regalo?',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '114px',
            },
          },
        },
      ],
      bottomLeftAction: {
        text: 'Ver items facturados',
        execute: () => {
          this.showShoppingCartDialog();
        },
      },
      stepProcessingFunction: (params) => {
        this.scrollBlockerBefore = params.blockScrollBeforeCurrentStep;
        this.removeScrollBlockerBefore = params.unblockScrollBeforeCurrentStep;

        if (params.dataModel.value['1'].writeMessage === 'Si')
          return { ok: true };
        else if (params.dataModel.value['1'].writeMessage === 'No') {
          this.storeEmptyMessageAndGoToShipmentDataForm(params);
          return { ok: false };
        }
      },
      customScrollToStepBackwards: (params) => {
        params.unblockScrollPastCurrentStep();
        params.unblockScrollBeforeCurrentStep();

        this.router.navigate([
          'ecommerce/megaphone-v3/61b8df151e8962cdd6f30feb',
        ]);
      },
      headerText: 'INFORMACIÓN DE LA ORDEN',
      stepButtonInvalidText: 'SELECCIONA',
      stepButtonValidText: 'CONTINUAR',
    },
    {
      fieldsList: [
        {
          name: 'message',
          fieldControl: new FormControl('', Validators.required),
          label: '¿Que mensaje escribiremos?',
          inputType: 'textarea',
          placeholder: 'Type your message here...',
          styles: {
            containerStyles: {
              marginTop: '60px',
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
          },
        },
        {
          name: 'receiver',
          fieldControl: new FormControl('', Validators.required),
          label: '¿Para quién es?',
          placeholder: 'Type...',
          styles: {
            containerStyles: {
              marginTop: '80px',
            },
            labelStyles: lightLabelStyles,
          },
        },
        {
          name: 'sender',
          fieldControl: new FormControl('', Validators.required),
          label: '¿De parte de quién o quienes?',
          placeholder: 'Type...',
          styles: {
            containerStyles: {
              marginTop: '80px',
            },
            labelStyles: lightLabelStyles,
          },
        },
      ],
      customScrollToStepBackwards: (params) => {
        this.formSteps[0].fieldsList[0].fieldControl.setValue('', {
          emitEvent: false,
        });

        params.scrollToStep(0, false);
      },
      bottomLeftAction: {
        text: 'Sin mensaje de regalo',
        execute: (params) => {
          this.storeEmptyMessageAndGoToShipmentDataForm(params);
        },
      },
      optionalLinksTo: {
        styles: {
          containerStyles: { marginTop: '109px', marginBottom: '80px' },
        },
        links: [
          {
            text: 'Que la parte de atrás sea una fotografia',
            action: (params) => {
              params.unblockScrollPastCurrentStep();
              params.scrollToStep(2);

              setTimeout(() => {
                params.blockScrollPastCurrentStep();
              }, 500);
            },
          },
        ],
      },
      stepProcessingFunction: this.savePreviousStepsDataBeforeEnteringPreview,
      customScrollToStep: (params) => {
        params.scrollToStep(3);
      },
      headerText: 'INFORMACIÓN DEL MENSAJE DE REGALO',
      stepButtonInvalidText: 'ADICIONA EL MENSAJE',
      stepButtonValidText: 'CONTINUAR',
    },
    {
      fieldsList: [
        {
          name: 'photo',
          fieldControl: new FormControl(''),
          label: 'Adicione la foto',
          inputType: 'file',
          placeholder: 'sube una imagen',
          styles: {
            fieldStyles: {
              marginTop: '47px',
              width: '60%',
            },
            labelStyles: {
              marginTop: '71px',
            },
          },
        },
      ],
      stepProcessingFunction: this.savePreviousStepsDataBeforeEnteringPreview,
      headerText: 'FOTOGRAFIA EN EL MENSAJE',
      stepButtonInvalidText: 'ADICIONA LA FOTO',
      stepButtonValidText: 'CONTINUAR',
    },
    {
      fieldsList: [
        {
          name: 'message-edit',
          fieldControl: new FormControl('', Validators.required),
          label: '¿Que mensaje escribiremos?',
          inputType: 'textarea',
          placeholder: 'Type your message here...',
          styles: {
            containerStyles: {
              marginTop: '60px',
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
          },
        },
        {
          name: 'receiver-edit',
          fieldControl: new FormControl('', Validators.required),
          label: '¿Para quién es?',
          placeholder: 'Type...',
          styles: {
            // customClassName: 'loquesea',
            containerStyles: {
              marginTop: '80px',
            },
            labelStyles: lightLabelStyles,
          },
        },
        {
          name: 'sender-edit',
          fieldControl: new FormControl('', Validators.required),
          label: '¿De parte de quién o quienes?',
          placeholder: 'Type...',
          styles: {
            containerStyles: {
              marginTop: '80px',
            },
            labelStyles: lightLabelStyles,
          },
        },
        {
          name: 'photo-edit',
          fieldControl: new FormControl(''),
          label: 'Optional',
          inputType: 'file',
          showImageBottomLabel: 'Editar fotografía',
          placeholder: 'sube una imagen',
          styles: {
            fieldStyles: {
              marginTop: '28.7px',
              width: '60%',
            },
            containerStyles: {
              marginBottom: '109px',
            },
            labelStyles: {
              margin: '0px',
              marginTop: '109px',
              fontSize: '19px',
              fontFamily: 'Roboto',
              fontWeight: 'lighter',
            },
          },
        },
      ],
      bottomLeftAction: {
        text: 'Sin mensaje de regalo',
        execute: (params) => {
          this.storeEmptyMessageAndGoToShipmentDataForm(params);
        },
      },
      stepProcessingFunction: (params) => {
        this.header.post = {
          message: params.dataModel.value['4']['message-edit'],
          targets: [
            {
              name: params.dataModel.value['4']['receiver-edit'],
              emailOrPhone: '',
            },
          ],
          from: params.dataModel.value['4']['sender-edit'],
          // multimedia: [this.header.flowImage],
          multimedia: this.header.flowImage,
          socialNetworks: [
            {
              url: '',
            },
          ],
        };
        this.header.storePost(
          this.header.saleflow?._id ?? this.header.getFlowId(),
          {
            message: params.dataModel.value['4']['message-edit'],
            targets: [
              {
                name: params.dataModel.value['4']['receiver-edit'],
                emailOrPhone: '',
              },
            ],
            from: params.dataModel.value['4']['sender-edit'],
            // multimedia: [this.header.flowImage],
            multimedia: this.header.flowImage,
            socialNetworks: [
              {
                url: '',
              },
            ],
          }
        );
        this.header.isComplete.message = true;
        console.log('AYUDAAAAS');

        console.log(this.header.flowImage);
        this.router.navigate([`ecommerce/shipment-data-form`]);
        return { ok: true };
      },
      headerText: 'INFORMACIÓN DEL MENSAJE DE REGALO',
      stepButtonInvalidText: 'ADICIONA EL MENSAJE',
      stepButtonValidText: 'CONTINUAR',
    },
  ];

  ngOnInit(): void {
    this.header.flowRoute = 'create-giftcard';
  }

  ngOnDestroy(): void {
    if (this.addedScrollBlockerBefore) {
      this.removeScrollBlockerBefore();
    }
  }
}
