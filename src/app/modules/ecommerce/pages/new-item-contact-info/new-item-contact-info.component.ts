import { Component, OnInit } from '@angular/core';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-item-contact-info',
  templateUrl: './new-item-contact-info.component.html',
  styleUrls: ['./new-item-contact-info.component.scss']
})
export class NewItemContactInfoComponent implements OnInit {
  scrollableForm: boolean = false;
  itemId: string;

  footerConfig: FooterOptions = {
    bubbleConfig: {
      validStep: {
        mode: 'double',
        function: async (params) => {
          console.log(params);

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
        mode: 'single'
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
          name: 'phoneNumber',
          fieldControl: new FormControl('', Validators.required),
          label: '¿En cuál o cuáles # de WhatsApp recibirás las notificaciones de las ordenes?',
          inputType: 'phone',
          styles: {
            containerStyles: {
              marginTop: '38px',
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginTop: '48px',
              marginBottom: '27px',
            },
            bottomLabelStyles: {
              fontWeight: 'normal',
              fontStyle: 'italic',
              fontSize: '15px',
              marginTop: '22px',
              fontFamily: 'Roboto'
            }
          },
          bottomLabel: {
            text: 'Otras maneras de recibir las notificaciones >',
            clickable: true,
            callback: () => {
              console.log('Se ha clickeado el callback');
            },
          },
        }
      ],
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          try {
            const phoneNumber = params.dataModel.get('1').value.phoneNumber.e164Number.split('+')[1];

            await this.authService.generateMagicLink(phoneNumber, `ecommerce/item-display`, this.itemId, 'NewItem');

            return { ok: true };
          } catch (error) {
            console.log(error);
            return { ok: false };
          }
        }
      },
      headerText: "INFORMACIÓN NECESARIA",
      stepButtonValidText: "RECIBE UN LINK PARA CONFIRMAR LOS ACCESOS",
      stepButtonInvalidText: "ESCRIBE LOS CONTACTOS CON ACCESO DE ADMIN",
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      },
      avoidGoingToNextStep: true,
    }
  ];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    this.route.params.subscribe(async (params) => {
      if (params.itemId) {
        this.itemId = params.itemId;
      }
    })
  }

  ngOnInit(): void {
  }

}
