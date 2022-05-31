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
  files: File[] = [];
  formSteps: FormStep[] = [
    {
      fieldsList: [
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
                this.formSteps[0].fieldsList[0].placeholder = '';
              }

              this.formSteps[0].fieldsList[0].formattedValue = '$' + formatted;
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
                  name: values['4'].name,
                  description: values['3'].description,
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
                name: values['4'].name,
                description: values['3'].description,
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
      optionalLinksTo: [
        {
          topLabel: 'Contenido opcional',
          styles: {
            containerStyles: {
              marginTop: '40px',
              marginBottom: '0px'
            },
            fieldStyles: {
              marginTop: '18px',
              paddingLeft: '17px'
            },
            labelStyles: labelStyles
          },
          links: [
            {
              text: 'Nombre',
              action: (params) => {
                params.scrollToStep(3);
              }
            },
            {
              text: 'Descripción',
              action: (params) => {
                params.scrollToStep(2);
              }
            },
            {
              text: 'Lo incluido',
              action: (params) => {
                params.scrollToStep(1);
              }
            },
          ]
        },
        {
          topLabel: 'Asociaciones para vender más',
          styles: {
            containerStyles: {
              marginTop: '60px',
              marginBottom: '0px'
            },
            fieldStyles: {
              marginTop: '30px',
              paddingLeft: '17px'
            },
            labelStyles: labelStyles
          },
          links: [
            {
              text: 'List-2-Raise, colaboraciones con organizaciones que recaudan fondos',
              action: (params) => {
                params.scrollToStep(4);
              }
            },
            {
              text: 'HashLink, para vender desde SMS Bots y transmisiones en vivo junto a Influ-Sellers',
              action: (params) => {
                params.scrollToStep(5);
              }
            },
          ]
        }
      ],
      pageHeader: {
        text: 'Sobre lo que venderás',
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
      customScrollToStepBackwards: (params) => {
        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
    },
    {
      fieldsList: [
        {
          name: 'description',
          fieldControl: new FormControl(''),
          label: 'Descripción',
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
          },
        },
      ],
      customScrollToStep: (params) => {
        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
    },
    {
      fieldsList: [
        {
          name: 'name',
          fieldControl: new FormControl(''),
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
        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
    },
    {
      fieldsList: [
        {
          name: 'collaborations',
          fieldControl: new FormControl(''),
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
              marginTop: '71px',
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
          fontWeight: '900',
          fontSize: '24px',
          margin: '0px',
          marginTop: '50px',
          marginBottom: '60px',
        }
      },
      customScrollToStep: (params) => {
        params.scrollToStep(0, false);
      },
      customScrollToStepBackwards: (params) => {
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

          this.formSteps[0].fieldsList[0].fieldControl.setValue(
            String(pricing)
          );
          this.formSteps[2].fieldsList[0].fieldControl.setValue(description);
          this.formSteps[0].embeddedComponents[0].inputs.imageField = images;

          //***************************** FORZANDO EL RERENDER DE LOS EMBEDDED COMPONENTS ********** */
          this.formSteps[0].embeddedComponents[0].shouldRerender = true;

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
