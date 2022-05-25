import { Component, OnInit, Type } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageInputComponent } from 'src/app/shared/components/image-input/image-input.component';
import { InfoButtonComponent } from 'src/app/shared/components/info-button/info-button.component';
import { Observable, Subscription } from 'rxjs';

interface FieldStyles {
  fieldStyles?: any;
  containerStyles?: any;
  topLabelActionStyles?: any;
  labelStyles?: any;
  bottomLabelStyles?: any;
  customClassName?: string; //you must use ::ng-deep in the scss of the parent component
}

interface FormField {
  name: string;
  styles?: FieldStyles;
  fieldControl: FormControl | FormArray;
  changeCallbackFunction?(...params): any;
  changeFunctionSubscription?: Subscription;
  selectionOptions?: Array<string>;
  enabledOnInit?: 'ENABLED' | 'DISABLED';
  validators?: Array<any>;
  description?: string;
  topLabelAction?: {
    text: string;
    clickable?: boolean;
    callback?: (...params) => any;
  };
  label: string;
  bottomLabel?: {
    text: string;
    clickable?: boolean;
    callback?: (...params) => any;
  };
  placeholder?: string;
  inputType?: string;
  showImageBottomLabel?: string;
  multiple?: boolean;
}

interface EmbeddedComponentOutput {
  name: string;
  callback(params: any): any;
}

interface EmbeddedComponent {
  component: Type<any>;
  inputs: Record<string, any>;
  outputs?: Array<EmbeddedComponentOutput>;
  containerStyles?: any;
  afterIndex?: number;
  beforeIndex?: number;
}

interface PromiseFunction {
  type: 'promise';
  function(params): Promise<any>;
}

interface ObservableFunction {
  type: 'observable';
  function(params): Observable<any>;
}

type AsyncFunction = PromiseFunction | ObservableFunction;

interface FormStep {
  fieldsList: Array<FormField>;
  headerText: string;
  embeddedComponents?: Array<EmbeddedComponent>;
  accessCondition?(...params): boolean;
  stepButtonValidText: string;
  stepButtonInvalidText: string;
  asyncStepProcessingFunction?: AsyncFunction;
  stepProcessingFunction?(...params): any;
  customScrollToStep?(...params): any;
  customScrollToStepBackwards?(...params): any;
  bottomLeftAction?: BottomLeftAction;
  optionalLinksTo?: OptionalLinks;
  stepResult?: any;
  justExecuteCustomScrollToStep?: boolean;
}

interface BottomLeftAction {
  text: string;
  execute(params): any;
}

interface OptionalLinks {
  styles?: FieldStyles;
  links: Array<OptionalLink>;
}

interface OptionalLink {
  text: string;
  action(params): any;
}

@Component({
  selector: 'app-item-creator',
  templateUrl: './item-creator.component.html',
  styleUrls: ['./item-creator.component.scss'],
})
export class ItemCreatorComponent implements OnInit {
  scrollableForm = false;
  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'description',
          fieldControl: new FormControl('', Validators.required),
          // changeCallbackFunction: (change, params) => {
          //   this.formSteps[0].fieldsList[0].fieldControl.setValue(change, {
          //     emitEvent: false,
          //   });

          //   this.formSteps[0].stepProcessingFunction(params);
          //   if (change === 'Si') {
          //     params.scrollToStep(1);
          //   }
          // },
          label: 'Descripción (Opcional)',
          bottomLabel: {
            text: 'Agrega “Lo Incluido” (opcional)',
            clickable: true,
            callback: (params) => {
              params.scrollToStep(1);
              console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHHHH');
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
          fieldControl: new FormControl('', Validators.required),
          label: 'Precio que te pagarán:',
          inputType: 'number',
          placeholder: 'Precio...',
          styles: {
            containerStyles: {
              width: '58.011%',
              marginTop: '102px',
            },
            labelStyles: {
              marginBottom: '17px',
              fontWeight: '300',
            },
          },
        },
        {
          name: 'collaborations',
          fieldControl: new FormControl('', Validators.required),
          label: 'Vender más a través de Las Comunidades (opcional):',
          inputType: 'number',
          placeholder: 'Pagarás...',
          styles: {
            containerStyles: {
              width: '68.50%',
              marginTop: '101px',
            },
            labelStyles: {
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
              name: 'onFileInput',
              callback: (result) => {
                console.log('event emiitedaxsadaq', result);
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
      // bottomLeftAction: {
      //   text: 'Ver items facturados',
      //   execute: () => {
      //     this.showShoppingCartDialog();
      //   },
      // },
      stepProcessingFunction: (params) => {
        // this.scrollBlockerBefore = params.blockScrollBeforeCurrentStep;
        // this.removeScrollBlockerBefore = params.unblockScrollBeforeCurrentStep;
        // if (params.scrollableForm) {
        //   setTimeout(() => {
        //     params.blockScrollBeforeCurrentStep();
        //     this.scrollBlockerBefore = params.blockScrollBeforeCurrentStep;
        //     this.removeScrollBlockerBefore =
        //       params.unblockScrollBeforeCurrentStep;
        //   }, 500);
        // }
        // if (params.dataModel.value['1'].writeMessage === 'Si')
        //   return { ok: true };
        // else if (params.dataModel.value['1'].writeMessage === 'No') {
        //   this.storeEmptyMessageAndGoToShipmentDataForm(params);
        //   return { ok: false };
        // }
      },
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
    },
    {
      fieldsList: [
        {
          name: 'whatsIncluded',
          multiple: true,
          fieldControl: new FormArray([
            new FormControl('', Validators.required),
          ]),
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
      // bottomLeftAction: {
      //   text: 'Ver items facturados',
      //   execute: () => {
      //     this.showShoppingCartDialog();
      //   },
      // },
      customScrollToStep: (params) => {
        params.scrollToStep(0, false);
      },
      justExecuteCustomScrollToStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}
}
