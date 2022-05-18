import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { delay } from 'rxjs/internal/operators';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import { ActivitiesOptionComponent } from '../activities-option/activities-option.component';

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
  validators?: Array<any>;
  description?: string;
  topLabelAction?: {
    text: string;
    clickable?: boolean;
    callback?: (...params) => any | Promise<any>;
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
  afterIndex: number;
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
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.scss'],
})
export class MultistepFormComponent implements OnInit, OnDestroy {
  @ViewChild('embeddedComponent', { read: ViewContainerRef, static: true })
  embeddedComponentRef;
  @Input() steps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: new FormControl('', Validators.required),
          label: 'Con cuál número de WhatsApp harás esta orden?',
          inputType: 'number',
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
          fieldControl: new FormControl('', Validators.required),
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
          fieldControl: new FormControl(''),
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
        links: [
          {
            text: 'Que la parte de atrás sea una fotografia',
            action: () => {
              console.log('Something happened');
            },
          },
        ],
      },
      headerText: 'fase 1',
      stepButtonInvalidText: 'Adiciona TU MOBILE',
      stepButtonValidText: 'Verificar mi mobile',
    },
    {
      fieldsList: [
        {
          name: 'receivedCode',
          fieldControl: new FormControl('', Validators.required),
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
          fieldControl: new FormArray([new FormControl('')]),
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
  shouldScrollBackwards: boolean = true;
  currentStep: number = 0;
  currentStepString: string = (this.currentStep + 1).toString();
  dataModel: FormGroup = new FormGroup({});
  env: string = environment.assetsUrl;
  stepFunctionParams: any;

  constructor(private header: HeaderService) {}

  ngOnInit(): void {
    this.stepFunctionParams = {
      dataModel: this.dataModel,
      currentStep: this.currentStep,
      shouldScrollBackwards: this.shouldScrollBackwards,
      changeShouldScrollBackwards: this.changeShouldScrollBackwards,
      blockScrollBeforeCurrentStep: this.blockScrollBeforeCurrentStep,
      unblockScrollBeforeCurrentStep: this.unblockScrollBeforeCurrentStep,
      blockScrollPastCurrentStep: this.blockScrollPastCurrentStep,
      unblockScrollPastCurrentStep: this.unblockScrollPastCurrentStep,
      scrollToStep: this.scrollToStep,
      executeStepDataProcessing: this.executeStepDataProcessing,
      scrollableForm: this.scrollableForm,
    };

    this.initController();
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

      currentStepFormGroup.statusChanges.subscribe((statusValue) => {
        if (this.currentStep > index && statusValue === 'INVALID') {
          this.currentStep = index;
          this.scrollToStep(this.currentStep);
          if (this.scrollableForm) this.blockScrollPastCurrentStep();
        }
      });

      step.fieldsList.forEach((field) => {
        if (!currentStepFormGroup.get(field.name))
          currentStepFormGroup.addControl(field.name, field.fieldControl);

        //Adds an onChange function to every formControl, if you wish to transform Data or
        //trigger code execution on every input change
        if (field.changeCallbackFunction) {
          field.changeFunctionSubscription =
            field.fieldControl.valueChanges.subscribe((change) => {
              field.changeCallbackFunction(change, this.stepFunctionParams);
            });
        }
        // console.log('CURRENT FORM GROUP', currentStepFormGroup);
      });
    });

    if (this.scrollableForm) this.blockScrollPastCurrentStep();
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

  // initEmbeddedComponents() {
  //   this.steps.forEach((step) => {
  //     step.embeddedComponents.forEach((embeddedComponent) => {
  //       const componentFactory =
  //         this.componentFactoryResolver.resolveComponentFactory(
  //           embeddedComponent.component
  //         );

  //       this.embeddedComponentRef.clear();

  //       const newComponent =
  //         this.embeddedComponentRef.createComponent(componentFactory);

  //       Object.entries(embeddedComponent.inputs).forEach(
  //         ([key, value]: [string, any]) => {
  //           newComponent.instance[key] = value;
  //         }
  //       );
  //     });
  //   });

  //   // const componentFactory =
  //   //   this.componentFactoryResolver.resolveComponentFactory(this.bodyComponent);

  //   // this.contentPlaceholderRef.clear();

  //   // const newComponent =
  //   //   this.contentPlaceholderRef.createComponent(componentFactory);

  //   // Object.entries(this.bodyComponentInputs).forEach(
  //   //   ([key, value]: [string, any]) => {
  //   //     newComponent.instance[key] = value;
  //   //   }
  //   // );
  // }

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
  addOneMoreInputToCurrentFormArray(fieldformArray: FormArray): void {
    fieldformArray.push(new FormControl(''));
  }

  /**
   * Aplica los estilos al container del input type file para las imagenss
   * @param {any} currentField - step index
   */
  applyStylesToImages(currentField: any) {
    let styles = {
      background:
        currentField.fieldControl.value !== ''
          ? 'url(' +
            currentField.fieldControl.value +
            ') no-repeat center center / contain #fff'
          : null,
      height: '200px',
      minWidth: '250px',
      ...currentField.styles.fieldStyles,
    };

    return styles;
  }

  blockScrollAfter = (e) => {
    let nextStepHtmlElement: HTMLElement = document.querySelector(
      `#step-${this.currentStep + 1}`
    );

    if (
      this.currentStep + 1 < this.steps.length &&
      window.pageYOffset >= nextStepHtmlElement.offsetTop - window.innerHeight
    ) {
      window.scroll(0, nextStepHtmlElement.offsetTop - window.innerHeight);
    }
  };

  /**
   * bloquea el scroll hacia el siguiente paso si no pasas la validación del step actual
   * @method
   */
  blockScrollPastCurrentStep = () => {
    document.addEventListener('scroll', this.blockScrollAfter);
  };

  /**
   * Remueve el event listener que bloquea el scroll
   * @method
   */
  unblockScrollPastCurrentStep = () => {
    document.removeEventListener('scroll', this.blockScrollAfter);
  };

  blockScrollBefore = (e) => {
    let currentStepHtmlElement: HTMLElement = document.querySelector(
      `#step-${this.currentStep}`
    );

    if (
      this.currentStep > 0 &&
      window.pageYOffset <= currentStepHtmlElement.offsetTop
    ) {
      window.scroll(0, currentStepHtmlElement.offsetTop);
    }
  };

  /**
   * bloquea el scroll hacia el siguiente paso si no pasas la validación del step actual
   * @method
   */
  blockScrollBeforeCurrentStep = () => {
    document.addEventListener('scroll', this.blockScrollBefore);
  };

  /**
   * Remueve el event listener que bloquea el scroll
   * @method
   */
  unblockScrollBeforeCurrentStep = () => {
    document.removeEventListener('scroll', this.blockScrollBefore);
  };

  /**
   * Hace scroll hacia una fase del formulario según su indice en el array de steps
   * @method
   * @param {Number} index - step index
   *
   */
  scrollToStep = (index = this.currentStep + 1, scrollToNextStep = true) => {
    let previousCurrentStep;

    if (!scrollToNextStep) {
      if (this.scrollableForm) this.unblockScrollPastCurrentStep();
      previousCurrentStep = this.currentStep;
    }

    if (index < this.steps.length) {
      if (!this.disableSmoothScroll && this.scrollableForm) {
        document.getElementById(`step-${index}`).scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      } else if (this.disableSmoothScroll && this.scrollableForm) {
        let nextStepHtmlElement: HTMLElement = document.querySelector(
          `#step-${index}`
        );

        if (
          this.currentStep + 1 < this.steps.length &&
          window.pageYOffset <=
            nextStepHtmlElement.offsetTop - window.innerHeight &&
          scrollToNextStep
        ) {
          window.scroll(0, nextStepHtmlElement.offsetTop);

          if (this.scrollableForm) this.blockScrollBeforeCurrentStep();
        }

        if (
          this.currentStep + 1 < this.steps.length &&
          window.pageYOffset >=
            nextStepHtmlElement.offsetTop - window.innerHeight &&
          !scrollToNextStep
        ) {
          window.scroll(0, nextStepHtmlElement.offsetTop - window.innerHeight);
          this.blockScrollPastCurrentStep();
        }
      }

      this.currentStep = index;
      this.currentStepString = (index + 1).toString();
      if (scrollToNextStep && this.scrollableForm)
        this.blockScrollPastCurrentStep();

      if (!scrollToNextStep && !this.disableSmoothScroll && this.scrollableForm)
        setTimeout(() => {
          this.blockScrollPastCurrentStep();
        }, 500 * (previousCurrentStep - this.currentStep));
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
      });
    } else {
      asyncFunction.function(stepFunctionParams).then((result) => {
        this.steps[this.currentStep].stepButtonValidText = stepButtonText;
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
      });
    }
  }

  executeStepDataProcessing = () => {
    let stepFunctionParams = {
      dataModel: this.dataModel,
      currentStep: this.currentStep,
      shouldScrollBackwards: this.shouldScrollBackwards,
      changeShouldScrollBackwards: this.changeShouldScrollBackwards,
      blockScrollBeforeCurrentStep: this.blockScrollBeforeCurrentStep,
      unblockScrollBeforeCurrentStep: this.unblockScrollBeforeCurrentStep,
      blockScrollPastCurrentStep: this.blockScrollPastCurrentStep,
      unblockScrollPastCurrentStep: this.unblockScrollPastCurrentStep,
      scrollToStep: this.scrollToStep,
      executeStepDataProcessing: this.executeStepDataProcessing,
      scrollableForm: this.scrollableForm,
    };

    this.stepFunctionParams = stepFunctionParams;

    if (this.steps[this.currentStep].stepProcessingFunction) {
      let result =
        this.steps[this.currentStep].stepProcessingFunction(stepFunctionParams);

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
