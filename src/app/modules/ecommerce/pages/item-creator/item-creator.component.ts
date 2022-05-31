import { Component, OnInit, ApplicationRef } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ImageInputComponent } from 'src/app/shared/components/image-input/image-input.component';
import { InfoButtonComponent } from 'src/app/shared/components/info-button/info-button.component';
import { ItemsService } from 'src/app/core/services/items.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormStep } from 'src/app/core/types/multistep-form';
import { DecimalPipe } from '@angular/common';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

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
  files: File[] = [];
  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'description',
          fieldControl: new FormControl(''),
          label: 'Descripción (Opcional)',
          bottomLabel: {
            text: 'Agrega “Lo Incluido” (opcional)',
            clickable: true,
            callback: (params) => {
              params.scrollToStep(1);
            },
          },
          placeholder:
            'Escriba la breve descripción que estará en la parte superior de la imagen..',
          inputType: 'textarea',
          styles: {
            containerStyles: {
              marginTop: '121px',
            },
            fieldStyles: {
              backgroundColor: 'white',
              height: '127px',
              borderRadius: '10px',
            },
            labelStyles: {
              fontSize: '19px',
              marginBottom: '17px',
              fontWeight: '300',
            },
            bottomLabelStyles: {
              color: '#4773D8',
              marginLeft: '1rem',
              fontWeight: '200',
              fontFamily: 'RobotoMedium',
              fontSize: '16px',
            },
          },
        },
        {
          name: 'price',
          fieldControl: new FormControl('', [
            Validators.required,
            Validators.min(0),
          ]),
          onlyAllowPositiveNumbers: true,
          label: 'Precio que te pagarán:',
          inputType: 'number',
          formattedValue: '',
          shouldFormatNumber: true,
          placeholder: 'Precio...',
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
                this.formSteps[0].fieldsList[1].placeholder = '';
              }

              this.formSteps[0].fieldsList[1].formattedValue = '$' + formatted;
            } catch (error) {
              console.log(error);
            }
          },
          styles: {
            containerStyles: {
              width: '58.011%',
              marginTop: '102px',
              position: 'relative',
            },
            fieldStyles: {
              backgroundColor: 'transparent',
              color: 'transparent',
              zIndex: '50',
              position: 'absolute',
              bottom: '0px',
              left: '0px',
            },
            formattedInputStyles: {
              bottom: '0px',
              left: '0px',
              zIndex: '1',
            },
            labelStyles: {
              fontSize: '19px',
              marginBottom: '17px',
              fontWeight: '300',
            },
          },
        },
        {
          name: 'collaborations',
          fieldControl: new FormControl(''),
          label: 'Vender más a través de Las Comunidades (opcional):',
          inputType: 'number',
          placeholder: 'Pagarás...',
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
                this.formSteps[0].fieldsList[2].placeholder = '';
              }

              this.formSteps[0].fieldsList[2].formattedValue = '$' + formatted;
              // this.applicationRef.tick();
            } catch (error) {
              console.log(error);
            }
          },
          styles: {
            containerStyles: {
              position: 'relative',
              width: '68.50%',
              marginTop: '101px',
            },
            fieldStyles: {
              backgroundColor: 'transparent',
              color: 'transparent',
              zIndex: '50',
              position: 'absolute',
              bottom: '0px',
              left: '0px',
            },
            formattedInputStyles: {
              bottom: '0px',
              left: '0px',
              zIndex: '1',
            },
            labelStyles: {
              fontSize: '19px',
              marginBottom: '17px',
              fontWeight: '300',
            },
          },
        },
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
            innerLabel: 'Adiciona las imagenes',
            topLabel: {
              text: 'Imágenes de tu producto:',
              styles: {
                fontFamily: 'Roboto',
                fontWeight: 'Bold',
                fontSize: '24px',
                margin: '0px',
                marginTop: '50px',
                marginBottom: '44px',
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

            if (
              this.currentUserId &&
              this.merchantOwnerId &&
              this.currentUserId === this.merchantOwnerId
            ) {
              await this.itemService.updateItem(
                {
                  description: values['1'].description,
                  pricing: Number(values['1'].price),
                  images: this.files,
                  content: values['2'].whatsIncluded,
                  currencies: [],
                  hasExtraPrice: false,
                  purchaseLocations: [],
                },
                this.currentItemId
              );
            } else {
              await this.itemService.createPreItem({
                description: values['1'].description,
                pricing: Number(values['1'].price),
                images: this.files,
                content: values['2'].whatsIncluded,
                currencies: [],
                hasExtraPrice: false,
                purchaseLocations: [],
              });
            }
          } catch (error) {
            console.log(error);
          }

          return { ok: true };
        },
      },
      linkFooter: {
        text: 'Mira el preview',
        execute: (params) => { },
        styles: {
          margin: 'auto',
          cursor: 'pointer',
          color: '#4773D8',
          fontSize: '16px',
          fontFamily: 'RobotoMedium',
          marginTop: '102px',
        },
      },
      avoidGoingToNextStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
    },
    {
      fieldsList: [
        {
          name: 'whatsIncluded',
          multiple: true,
          fieldControl: new FormArray([new FormControl('')]),
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
        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
    },
  ];

  constructor(
    private router: Router,
    private itemService: ItemsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private decimalPipe: DecimalPipe,
    private applicationRef: ApplicationRef
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const { itemId } = routeParams;
      this.currentItemId = itemId;

      if (itemId && localStorage.getItem('session-token')) {
        lockUI();

        const myUser = await this.authService.me();
        let myUserId;
        this.currentUserId = myUser ? myUser._id : null;

        const { pricing, images, content, description, merchant } =
          await this.itemService.item(itemId);

        if (this.currentUserId === merchant.owner._id) {
          this.merchantOwnerId = merchant.owner._id;

          this.formSteps[0].fieldsList[0].fieldControl.setValue(description);
          this.formSteps[0].fieldsList[1].fieldControl.setValue(
            String(pricing)
          );
          this.formSteps[0].embeddedComponents[0].inputs.imageField = images;

          //***************************** FORZANDO EL RERENDER DE LOS EMBEDDED COMPONENTS ********** */
          this.formSteps[0].embeddedComponents[0].shouldNotRender = true;

          //***************************** FORZANDO EL RERENDER DE LOS EMBEDDED COMPONENTS ********** */


          const formArray = this.formSteps[1].fieldsList[0]
            .fieldControl as FormArray;
          formArray.removeAt(0);
          content.forEach((item) => {
            formArray.push(new FormControl(item));
          });
          unlockUI();
        } else {
          if (itemId) this.router.navigate(['/']);
        }
      } else {
        unlockUI();

        if (itemId) this.router.navigate(['/']);
      }
    });
  }
}
