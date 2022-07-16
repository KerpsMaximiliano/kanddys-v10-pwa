import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Input,
  Type,
  ViewChild,
  ViewContainerRef,
  Output,
  EventEmitter
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/internal/operators';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import { ActivitiesOptionComponent } from '../activities-option/activities-option.component';
import { FormStep, FormField, AsyncFunction } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';

@Component({
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.scss'],
})
export class MultistepFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('embeddedComponent', { read: ViewContainerRef, static: true })
  embeddedComponentRef;
  @Input() steps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Con cuál número de WhatsApp harás esta orden?',
          inputType: 'phone',
          placeholder: 'Mi # de WhatsApp es..',
          styles: {
            containerStyles: {
              marginTop: '150px',
            },
          },
          bottomLabel: {
            text: '¿No tienes un número?',
            clickable: true,
            callback: () => {
              console.log('Se ha clickeado el callback');
            },
          },
        },
        {
          name: 'address',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Dirección?',
          inputType: 'textarea',
          placeholder: 'Calle, número(nombre del edificio)',
          styles: {
            containerStyles: {
              marginTop: '74px',
            },
          },
        },
        // {
        //   name: 'email',
        //   fieldControl: new FormControl(''),
        //   label: 'Email',
        //   inputType: 'email',
        //   placeholder: 'Email',
        //   fieldStyles: {
        //     color: 'green',
        //     marginTop: '10px',
        //   },
        // },
        {
          name: 'imageExample',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Sube una imagen',
          inputType: 'file',
          placeholder: 'sube una imagen',
          styles: {
            containerStyles: {
              width: '60%',
            },
          },
        },
        // {
        //   name: 'imageExample2',
        //   fieldControl: new FormControl(''),
        //   label: 'Sube una imagen',
        //   inputType: 'file',
        //   placeholder: 'sube una imagen',
        // },
      ],
      embeddedComponents: [
        {
          component: ActivitiesOptionComponent,
          inputs: {
            lightTextAtTheTop: 'arriba',
            boldTextAtTheBottom: 'abajo',
            backgroundColor: 'orange',
            textColor: 'black',
          },
          outputs: [
            {
              name: 'exampleEvent',
              callback: (result) => {
                console.log('event emiitedaxsadaq', result);
              },
            },
          ],
          afterIndex: 0,
          containerStyles: {
            marginTop: '10px',
          },
        },
        {
          component: ActivitiesOptionComponent,
          inputs: {
            lightTextAtTheTop: 'arriba',
            boldTextAtTheBottom: 'abajo',
            backgroundColor: 'red',
            textColor: 'white',
          },
          outputs: [
            {
              name: 'exampleEvent',
              callback: (result) => {
                console.log('event 222 emiitedaxsadaq', result);
              },
            },
          ],
          afterIndex: 1,
          containerStyles: {
            marginTop: '80px',
          },
        },
      ],
      asyncStepProcessingFunction: {
        type: 'observable',
        function: () => {
          return of({
            message: 'Continuar',
            ok: true,
          }).pipe(delay(3000));
        },
      },
      bottomLeftAction: {
        text: 'Sin mensaje de regalo',
        execute: () => {
          console.log('Whatever goes here');
        },
      },
      optionalLinksTo: {
        groupOfLinksArray: [
          {
            topLabel: 'Opcional',
            links: [
              {
                text: 'Que la parte de atrás sea una fotografia',
                action: () => {
                  console.log('Something happened');
                },
              },
            ],
          }
        ]
      },
      hasQrHeader: true,
      qrSectionInfo: {
        label: 'Re-direcciona a la Colección de Profesores',
        qrLink: 'https://metacritic.com/',
        width: 50,
        icon: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/download.svg',
        containerStyles: {
        }
      },
      headerText: 'fase 1',
      stepButtonInvalidText: 'Adiciona TU MOBILE',
      stepButtonValidText: 'Verificar mi mobile',
    },
    {
      fieldsList: [
        {
          name: 'receivedCode',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Escriba el código que recibió:',
          inputType: 'number',
          placeholder: 'El código que recibí en WhatsApp fue..',
          styles: {
            containerStyles: {
              marginTop: '150px',
            },
          },
        },
        {
          name: 'favoriteColors',
          multiple: true,
          fieldControl: {
            type: 'multiple',
            control: new FormArray([new FormControl('')])
          },
          label: 'Color favorito',
          inputType: 'text',
          placeholder: 'Mi color favorito es es..',
          styles: {
            containerStyles: {
              marginTop: '50px',
            },
            fieldStyles: {
              marginTop: '20px',
              color: 'red',
            },
          },
        },
      ],
      headerText: 'fase 2',
      stepButtonInvalidText: 'Llena los campos',
      stepButtonValidText: 'CONTINUAR',
    },
  ];
  @Input() scrollableForm: boolean = false;
  @Input() disableSmoothScroll: boolean = true;
  @Input() showStepNumbers: boolean = true;
  @Input() shouldScrollBackwards: boolean = true;
  formWrapperHeight: number = null;
  currentYPosition: number = 0;
  shouldAddMultipleInput = false;
  timeoutId: any = null;
  @Input() currentStep: number = 0;
  @Input() currentStepString: string = (this.currentStep + 1).toString();
  @Output() paramsRef = new EventEmitter();
  dataModel: FormGroup = new FormGroup({});
  env: string = environment.assetsUrl;
  stepFunctionParams: any;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.UnitedStates;
  PhoneNumberFormat = PhoneNumberFormat;
  headerHeightTracker: number = 60;

  constructor(private header: HeaderService, private dialog: DialogService) { }

  ngOnInit(): void {
    this.stepFunctionParams = {
      dataModel: this.dataModel,
      currentStep: this.currentStep,
      shouldScrollBackwards: this.shouldScrollBackwards,
      changeShouldScrollBackwards: this.changeShouldScrollBackwards,
      scrollToStep: this.scrollToStep,
      executeStepDataProcessing: this.executeStepDataProcessing,
      scrollableForm: this.scrollableForm,
      dialog: this.dialog
    };

    this.initController();

    this.paramsRef.emit(this.stepFunctionParams);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.headerHeightTracker = document.querySelector(".helper-headerv1") ?
        document.querySelector('.helper-headerv1').clientHeight :
        document.querySelector('.helper-headerv2') ?
          document.querySelector('.helper-headerv2').clientHeight :
            document.querySelector('.header-info-component') ? 
              document.querySelector('.header-info-component').clientHeight : 
                0
        ;
    }, 100)


    if (this.scrollableForm && !this.disableSmoothScroll) {
      setTimeout(() => {
        this.formWrapperHeight = document.querySelector('#step-' + this.currentStep).clientHeight;
        const phoneInputs = document.querySelectorAll('input[type="tel"]');

        phoneInputs.forEach(element => {
          element.setAttribute('tabindex', '-1');
        })
      }, 100)
    }


    this.steps.forEach((step, index) => {
      let currentStepKey = (index + 1).toString();

      let currentStepFormGroup = this.dataModel.get(
        currentStepKey
      ) as FormGroup;

      currentStepFormGroup.statusChanges.subscribe((statusValue) => {
        setTimeout(() => {
          this.formWrapperHeight = document.querySelector('#step-' + this.currentStep).clientHeight;
        }, 100);
        
        if(step.statusChangeCallbackFunction)
          step.statusChangeCallbackFunction(statusValue, this.stepFunctionParams);
      });

      //allows you to execute custom code when field is not valid
      this.steps[index].fieldsList.forEach(field => {
        if(field.statusChangeCallbackFunction)
          field.fieldControl.control.statusChanges.subscribe(field.statusChangeCallbackFunction);
      });
    })
  }

  /**
   * Popula o llena el dataModel con los datos de cada field, de cada step, fase o paso
   * @method
   */
  initController() {
    this.steps.forEach((step, index) => {
      let currentStepKey = (index + 1).toString();

      this.dataModel.addControl(currentStepKey, new FormGroup({}));

      let currentStepFormGroup = this.dataModel.get(
        currentStepKey
      ) as FormGroup;

      step.fieldsList.forEach((field) => {
        if (!currentStepFormGroup.get(field.name))
          currentStepFormGroup.addControl(field.name, field.fieldControl.control);

        if (field.enabledOnInit === 'DISABLED') {
          currentStepFormGroup.get(field.name).disable();
        }

        //Adds an onChange function to every formControl, if you wish to transform Data or
        //trigger code execution on every input change
        if (field.changeCallbackFunction) {
          field.changeFunctionSubscription =
            field.fieldControl.control.valueChanges.subscribe((change) => {
              field.changeCallbackFunction(change, this.stepFunctionParams);
            });
        }
        // console.log('CURRENT FORM GROUP', currentStepFormGroup);
      });
    });
  }

  //Removes all subscriptions from every formControl
  ngOnDestroy(): void {
    this.steps.forEach((step, index) => {
      step.fieldsList.forEach((field) => {
        if (field.changeCallbackFunction) {
          field.changeFunctionSubscription.unsubscribe();
        }
      });
    });
  }

  resizeFormWrapper() {
    if(this.scrollableForm && !this.disableSmoothScroll) {//Arreglar a futuro
      let currentStepHtmlElement: HTMLElement = document.querySelector(
        `#step-${this.currentStep}`
      );
  
      this.formWrapperHeight = document.querySelector('#step-' + this.currentStep).clientHeight;
      this.currentYPosition = currentStepHtmlElement.offsetTop * -1;

      document.querySelector('.fullform-wrapper').scrollTo(0, 0);
    }
  }

  /**
   * Une dos objetos
 * @method
 */
  spreadOperator(object1: Record<string, any>, object2: Record<string, any>) {
    return { ...object1, ...object2 }
  };


  openInputTypeFileSelector(id: string) {
    let fileElement = document.querySelector(`#${id}`) as HTMLElement;

    fileElement.click();
  }

  /**
   * Carga el archivo seleccionado en el input type file al formControl asociado en su versión
   * de base64
   * @method
   */
  loadFile(currentField: FormField, event: any) {
    const reader = new FileReader();

    const file = (event.target as HTMLInputElement).files[0];

    this.header.flowImage = event.target.files[0];

    reader.readAsDataURL(file);

    reader.onload = () => {
      this.dataModel.patchValue({
        [this.currentStep + 1]: {
          [currentField.name]: reader.result,
        },
      });

      // this.header.storeMultistepFormImages({
      //   base64: reader.result,
      //   filename: 'multistep-form' + Date.now() + this.currentStep + '.png',
      //   type: 'image/png',
      // });

      this.dataModel
        .get((this.currentStep + 1).toString())
        .get(currentField.name)
        .updateValueAndValidity();
    };

    reader.onerror = function (error) {
      console.log('Error: ', error);
    };

    // La referencia al archivo quedará guardada en su respectivo FormControl
    // this.dataModel.get((this.currentStep + 1).toString()).get(currentField.name)
    //   .value;
  }

  /**
   * Agrega otro input al FormArray para hacer formularios dinamicos
   * @param {FormArray} fieldformArray - step index
   */
  fieldName: string;
  addOneMoreInputToCurrentFormArray(
    fieldformArray: FormArray,
    fieldName: string
  ): void {
    fieldformArray.push(new FormControl('', Validators.required));

    setTimeout(() => {
      document
        .getElementById(fieldName + '-' + String(fieldformArray.length - 1))
        .focus();
    }, 100);
  }

  /**
   * Remueve un input de un Formarray según un index
   * @param {FormArray} fieldformArray - step index
   */
  removeInputToCurrentFormArray(
    fieldformArray: FormArray,
    fieldName: string,
    fieldIndex: number
  ): void {
    let newIndexToFocus: string =
      fieldformArray.length - 1 === fieldIndex
        ? String(fieldIndex - 1)
        : String(fieldIndex);

    fieldformArray.removeAt(fieldIndex);

    setTimeout(() => {
      document.getElementById(fieldName + '-' + newIndexToFocus).focus();
    }, 100);
  }

  onMultipleInputEnterPress(
    event: any,
    callback: (...params) => void,
    fieldformArray: FormArray,
    fieldName: string,
    index
  ) {
    if ((index + 1) === fieldformArray.length) {
      if (this.timeoutId)
        clearTimeout(this.timeoutId);

      this.timeoutId = setTimeout(() => {
        callback(fieldformArray, fieldName);
      }, 1000);
    }

    if (event.key === 'Backspace' && this.timeoutId)
      clearTimeout(this.timeoutId);
  }

  /**
   * Aplica los estilos al container del input type file para las imagenss
   * @param {any} currentField - step index
   */
  applyStylesToImages(currentField: any) {
    let styles = {
      backgroundImage:
        currentField.fieldControl.control.value !== ''
          ? 'url(' +
          currentField.fieldControl.control.value +
          ')'
          : null,
      border: (
        currentField.fieldControl.control.value === '' ||
        !currentField.fieldControl.control.value
      ) ? '1px solid dodgerblue' : 'none',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      height: '200px',
      minWidth: '250px',
      ...currentField.styles.fieldStyles,
    };

    return styles;
  }

  changeStylesOnHover(
    currentField: FormField,
    hovered: boolean,
  ) {
    currentField.hovered = hovered;
  }

  /**
   * Hace scroll hacia una fase del formulario según su indice en el array de steps
   * @method
   * @param {Number} index - step index
   *
   */
  scrollToStep = (index = this.currentStep + 1, scrollToNextStep = true) => {
    let previousCurrentStep;
    let nextStepHtmlElement: HTMLElement = document.querySelector(
      `#step-${index}`
    );


    if (!scrollToNextStep) {
      previousCurrentStep = this.currentStep;
    }

    if (index < this.steps.length) {
      if (!this.disableSmoothScroll && this.scrollableForm) {

        window.scroll(0, 0);
        this.currentYPosition = nextStepHtmlElement.offsetTop * -1;

        setTimeout(() => {
          this.formWrapperHeight = nextStepHtmlElement.clientHeight;
        }, 100);
      } else if (this.disableSmoothScroll && this.scrollableForm) {


        if (
          this.currentStep + 1 < this.steps.length &&
          window.pageYOffset <=
          nextStepHtmlElement.offsetTop - window.innerHeight &&
          scrollToNextStep
        ) {
          window.scroll(0, nextStepHtmlElement.offsetTop);
        }

        if (
          this.currentStep + 1 < this.steps.length &&
          window.pageYOffset >=
          nextStepHtmlElement.offsetTop - window.innerHeight &&
          !scrollToNextStep
        ) {
          window.scroll(0, nextStepHtmlElement.offsetTop - window.innerHeight);
        }
      }

      this.currentStep = index;
      this.currentStepString = (index + 1).toString();

      setTimeout(() => {
        this.headerHeightTracker = document.querySelector(".helper-headerv1") ?
          document.querySelector('.helper-headerv1').clientHeight :
          document.querySelector('.helper-headerv2') ?
            document.querySelector('.helper-headerv2').clientHeight :
              document.querySelector('.header-info-component') ? 
                document.querySelector('.header-info-component').clientHeight : 
                  0;
      }, 100);
    }
  };

  changeShouldScrollBackwards = () => {
    this.shouldScrollBackwards = !this.shouldScrollBackwards;
  };

  handleAsyncFunction(
    asyncFunction: AsyncFunction,
    stepButtonText,
    stepFunctionParams
  ) {
    if (asyncFunction.type === 'observable') {
      asyncFunction.function(stepFunctionParams).subscribe((result) => {
        this.steps[this.currentStep].stepButtonValidText = stepButtonText;
        if (!this.steps[this.currentStep].avoidGoingToNextStep) {
          if (
            result.ok &&
            this.currentStep !== this.steps.length - 1 &&
            !('customScrollToStep' in this.steps[this.currentStep])
          )
            this.scrollToStep();
          else if (
            result.ok &&
            this.currentStep !== this.steps.length - 1 &&
            'customScrollToStep' in this.steps[this.currentStep]
          )
            this.steps[this.currentStep].customScrollToStep(stepFunctionParams);
        }
      });
    } else {
      asyncFunction.function(stepFunctionParams).then((result) => {
        this.steps[this.currentStep].stepButtonValidText = stepButtonText;
        if (!this.steps[this.currentStep].avoidGoingToNextStep) {
          if (
            result.ok &&
            this.currentStep !== this.steps.length - 1 &&
            !('customScrollToStep' in this.steps[this.currentStep])
          )
            this.scrollToStep();
          else if (
            result.ok &&
            this.currentStep !== this.steps.length - 1 &&
            'customScrollToStep' in this.steps[this.currentStep]
          )
            this.steps[this.currentStep].customScrollToStep(stepFunctionParams);
        }
      });
    }
  }

  handleAddressChange(change) {
    console.log(change);
  }

  executeStepDataProcessing = () => {
    let stepFunctionParams = {
      dataModel: this.dataModel,
      currentStep: this.currentStep,
      shouldScrollBackwards: this.shouldScrollBackwards,
      changeShouldScrollBackwards: this.changeShouldScrollBackwards,
      scrollToStep: this.scrollToStep,
      executeStepDataProcessing: this.executeStepDataProcessing,
      scrollableForm: this.scrollableForm,
      dialog: this.dialog
    };

    this.stepFunctionParams = stepFunctionParams;

    if (this.steps[this.currentStep].stepProcessingFunction) {
      let result =
        this.steps[this.currentStep].stepProcessingFunction(stepFunctionParams);

      if (!this.steps[this.currentStep].avoidGoingToNextStep) {      
        if (
          result.ok &&
          this.currentStep !== this.steps.length - 1 &&
          !('customScrollToStep' in this.steps[this.currentStep])
        )
          this.scrollToStep();
        else if (
          result.ok &&
          this.currentStep !== this.steps.length - 1 &&
          'customScrollToStep' in this.steps[this.currentStep]
        )
          this.steps[this.currentStep].customScrollToStep(stepFunctionParams);
      }
    } else {
      let stepButtonText = this.steps[this.currentStep].stepButtonValidText;
      this.steps[this.currentStep].stepButtonValidText = 'ESPERE...';

      this.handleAsyncFunction(
        this.steps[this.currentStep].asyncStepProcessingFunction,
        stepButtonText,
        stepFunctionParams
      );
    }
  };
}
