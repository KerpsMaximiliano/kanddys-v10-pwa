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
  EventEmitter,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/internal/operators';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import { ActivitiesOptionComponent } from '../activities-option/activities-option.component';
import {
  FormStep,
  FormField,
  AsyncFunction,
} from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { SwiperOptions } from 'swiper';
import { Observable } from 'apollo-link';
import 'swiper/';

@Component({
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.scss'],
})
export class MultistepFormComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('embeddedComponent', { read: ViewContainerRef, static: true })
  embeddedComponentRef;
  @Input() steps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl([''], Validators.required),
          },
          label: 'Adjunta aquí tu comprobante de Pago(*)',
          inputType: 'file2',
          fileObjects: [],
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              paddingBottom: '26px',
              paddingTop: '65px',
            },
            fieldStyles: {
              width: '157px',
              height: '137px',
              padding: '34px',
              textAlign: 'center',
            },
            containerStyles: {
              paddingBottom: '4rem',
            },
            innerContainerStyles: {
              width: '157px',
              textAlign: 'center',
            },
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
          },
        ],
      },
      hasQrHeader: true,
      qrSectionInfo: {
        label: 'Re-direcciona a la Colección de Profesores',
        qrLink: 'https://metacritic.com/',
        width: 50,
        icon: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/download.svg',
        containerStyles: {},
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
            control: new FormControl('', Validators.required),
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
            control: new FormArray([new FormControl('')]),
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
  @Input() usesGoogleMaps: boolean = false;
  @Output() paramsRef = new EventEmitter();
  dataModel: FormGroup = new FormGroup({});
  env: string = environment.assetsUrl;
  stepFunctionParams: any;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;
  headerHeightTracker: number = 60;
  finishedExecutingStepProcessingFunction = true;
  colorPickerSwiperConfig: SwiperOptions = {
    slidesPerView: 5,
  };
  googleMapsApiLoaded: Observable<boolean>;
  location = null;

  constructor(private header: HeaderService, private dialog: DialogService) {}

  ngOnInit(): void {
    this.stepFunctionParams = {
      dataModel: this.dataModel,
      currentStep: this.currentStep,
      shouldScrollBackwards: this.shouldScrollBackwards,
      changeShouldScrollBackwards: this.changeShouldScrollBackwards,
      scrollToStep: this.scrollToStep,
      executeStepDataProcessing: this.executeStepDataProcessing,
      scrollableForm: this.scrollableForm,
      dialog: this.dialog,
    };

    this.initController();

    this.paramsRef.emit(this.stepFunctionParams);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.headerHeightTracker = document.querySelector('.helper-headerv1')
        ? document.querySelector('.helper-headerv1').clientHeight
        : document.querySelector('.helper-headerv2')
        ? document.querySelector('.helper-headerv2').clientHeight
        : document.querySelector('.header-info-component')
        ? document.querySelector('.header-info-component').clientHeight
        : 0;
    }, 100);

    if (this.scrollableForm && !this.disableSmoothScroll) {
      setTimeout(() => {
        this.formWrapperHeight = document.querySelector(
          '#step-' + this.currentStep
        ).clientHeight;
        const phoneInputs = document.querySelectorAll('input[type="tel"]');

        phoneInputs.forEach((element) => {
          element.setAttribute('tabindex', '-1');
        });
      }, 100);
    }

    this.steps.forEach((step, index) => {
      let currentStepKey = (index + 1).toString();

      let currentStepFormGroup = this.dataModel.get(
        currentStepKey
      ) as FormGroup;

      currentStepFormGroup.statusChanges.subscribe((statusValue) => {
        setTimeout(() => {
          this.formWrapperHeight = document.querySelector(
            '#step-' + this.currentStep
          ).clientHeight;
        }, 100);

        if (step.statusChangeCallbackFunction)
          step.statusChangeCallbackFunction(
            statusValue,
            this.stepFunctionParams
          );
      });

      //allows you to execute custom code when field is not valid
      this.steps[index].fieldsList.forEach((field) => {
        if (field.statusChangeCallbackFunction)
          field.fieldControl.control.statusChanges.subscribe(
            field.statusChangeCallbackFunction
          );
      });
    });
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
          currentStepFormGroup.addControl(
            field.name,
            field.fieldControl.control
          );

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
    if (this.scrollableForm && !this.disableSmoothScroll) {
      //Arreglar a futuro
      let currentStepHtmlElement: HTMLElement = document.querySelector(
        `#step-${this.currentStep}`
      );

      this.formWrapperHeight = document.querySelector(
        '#step-' + this.currentStep
      ).clientHeight;
      this.currentYPosition = currentStepHtmlElement.offsetTop * -1;

      document.querySelector('.fullform-wrapper').scrollTo(0, 0);
    }
  }

  /**
   * Une dos objetos
   * @method
   */
  spreadOperator(object1: Record<string, any>, object2: Record<string, any>) {
    return { ...object1, ...object2 };
  }

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
    if (index + 1 === fieldformArray.length) {
      if (this.timeoutId) clearTimeout(this.timeoutId);

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
          ? 'url(' + currentField.fieldControl.control.value + ')'
          : null,
      border:
        currentField.fieldControl.control.value === '' ||
        !currentField.fieldControl.control.value
          ? '1px solid dodgerblue'
          : 'none',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      height: '200px',
      minWidth: '250px',
      ...currentField.styles.fieldStyles,
    };

    return styles;
  }

  changeStylesOnHover(currentField: FormField, hovered: boolean) {
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
        this.headerHeightTracker = document.querySelector('.helper-headerv1')
          ? document.querySelector('.helper-headerv1').clientHeight
          : document.querySelector('.helper-headerv2')
          ? document.querySelector('.helper-headerv2').clientHeight
          : document.querySelector('.header-info-component')
          ? document.querySelector('.header-info-component').clientHeight
          : 0;
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

        this.finishedExecutingStepProcessingFunction = true;
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

        this.finishedExecutingStepProcessingFunction = true;
      });
    }
  }

  handleAddressChange(change) {
    console.log(change);
  }

  handleImageInput = (
    result: any,
    fieldName: string,
    currentField: FormField
  ) => {
    console.log(fieldName);
    console.log(currentField);
    currentField.fileObjects = result;
  };

  handleImageInputBase64 = (result: any, fieldName: string, fieldControl) => {
    console.log(fieldName);
    console.log(fieldControl);
    const arrayOfImages = fieldControl.control.value;

    arrayOfImages[result.index] = result.image;
    fieldControl.control.setValue(arrayOfImages);
  };

  handleFileDeletion = (result: any, currentField: FormField) => {
    const { index } = result;
    const arrayOfImages = currentField.fieldControl.control.value;

    const files: any = currentField.fileObjects;
    const filesArray = [];

    for (let i = 0; i < files.length; i++) {
      let file = 'item' in files ? files.item(i) : files[i];

      filesArray.push(file);
    }

    filesArray.splice(index, 1);
    arrayOfImages.splice(index, 1);

    currentField.fieldControl.control.setValue(arrayOfImages);

    currentField.fileObjects = filesArray;
  };

  executeStepDataProcessing = () => {
    if (this.finishedExecutingStepProcessingFunction) {
      this.finishedExecutingStepProcessingFunction = false;

      let stepFunctionParams = {
        dataModel: this.dataModel,
        currentStep: this.currentStep,
        shouldScrollBackwards: this.shouldScrollBackwards,
        changeShouldScrollBackwards: this.changeShouldScrollBackwards,
        scrollToStep: this.scrollToStep,
        executeStepDataProcessing: this.executeStepDataProcessing,
        scrollableForm: this.scrollableForm,
        dialog: this.dialog,
      };

      this.stepFunctionParams = stepFunctionParams;

      if (this.steps[this.currentStep].stepProcessingFunction) {
        let result =
          this.steps[this.currentStep].stepProcessingFunction(
            stepFunctionParams
          );

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

        this.finishedExecutingStepProcessingFunction = true;
      } else {
        let stepButtonText = this.steps[this.currentStep].stepButtonValidText;
        this.steps[this.currentStep].stepButtonValidText = 'ESPERE...';

        this.handleAsyncFunction(
          this.steps[this.currentStep].asyncStepProcessingFunction,
          stepButtonText,
          stepFunctionParams
        );
      }
    }
  };

  blockCursorMovement(e: any, targetedInput: boolean = false) {
    if (!targetedInput) return;
    else {
      //Previene las situaciones en las que el user pulsa la tecla izq. o derecha, y el input type number
      //ocasiona el el numero formateado se desconfigure
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    }
  }

  executeCustomScrollToStep(stepIndex: number) {
    this.finishedExecutingStepProcessingFunction = false;
    this.steps[stepIndex].customScrollToStep(this.stepFunctionParams);
    this.finishedExecutingStepProcessingFunction = true;
  }

  onFocus(currentField: FormField) {
    currentField.focused = true;

    if (currentField.onFocusFunction) {
      currentField.onFocusFunction(this.stepFunctionParams);
    }
  }

  onBlur(currentField: FormField) {
    currentField.focused = false;

    if (currentField.onBlurFunction) {
      currentField.onBlurFunction(this.stepFunctionParams);
    }
  }

  selectColor(colorIndex: number, currentField: FormField) {
    /*console.log(
      'before',
      currentField.colorPickerConfiguration.selectedCounter,
      currentField.colorPickerConfiguration.maximumNumberOfSelections,
      currentField.colorPickerConfiguration.options[colorIndex].selected
    );*/

    if (
      currentField.colorPickerConfiguration.selectedCounter <
      currentField.colorPickerConfiguration.maximumNumberOfSelections
    ) {
      currentField.colorPickerConfiguration.options[colorIndex].selected =
        currentField.colorPickerConfiguration.options[colorIndex].selected
          ? false
          : true;

      if (currentField.colorPickerConfiguration.options[colorIndex].selected) {
        if (
          currentField.colorPickerConfiguration.selectedCounter <
          currentField.colorPickerConfiguration.maximumNumberOfSelections
        )
          currentField.colorPickerConfiguration.selectedCounter += 1;
      } else {
        currentField.colorPickerConfiguration.selectedCounter -= 1;
      }
    } else if (
      currentField.colorPickerConfiguration.selectedCounter ===
        currentField.colorPickerConfiguration.maximumNumberOfSelections &&
      currentField.colorPickerConfiguration.options[colorIndex].selected
    ) {
      currentField.colorPickerConfiguration.options[colorIndex].selected =
        false;
      currentField.colorPickerConfiguration.selectedCounter -= 1;
    }

    currentField.fieldControl.control.setValue(
      currentField.colorPickerConfiguration.options.filter(
        (option) => option.selected
      )
    );

    /*console.log(
      'after',
      currentField.colorPickerConfiguration.selectedCounter,
      currentField.colorPickerConfiguration.maximumNumberOfSelections,
      currentField.colorPickerConfiguration.options[colorIndex].selected
    );*/
  }

  setUserCurrentLocation(currentField: FormField) {
    currentField.clickedOnLocationQuestionButton = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.location = {};
          this.location.lat = position.coords.latitude;
          this.location.lng = position.coords.longitude;
          currentField.wannaAddYourGPSLocation = true;

          currentField.fieldControl.control.setValue(
            'http://www.google.com/maps/place/' +
              this.location.lat +
              ',' +
              this.location.lng
          );
        },
        () => {
          alert('No proporcionaste tu ubicación');
          currentField.wannaAddYourGPSLocation = false;
        }
      );
    }
  }

  setManualLocation(currentField: FormField) {
    currentField.clickedOnLocationQuestionButton = true;
    currentField.wannaAddYourGPSLocation = false;
  }

  addMarker(event: any, currentField: FormField) {
    if (!currentField.markerPositions) currentField.markerPositions = [];
    currentField.markerPositions.push(event.latLng.toJSON());

    currentField.fieldControl.control.setValue(
      'http://www.google.com/maps/place/' +
        currentField.markerPositions[0].lat +
        ',' +
        currentField.markerPositions[0].lng
    );
  }

  changeMarkerPosition(event: any, currentField: FormField) {
    currentField.markerPositions[0].lat = event.latLng.lat();
    currentField.markerPositions[0].lng = event.latLng.lng();

    currentField.fieldControl.control.setValue(
      'http://www.google.com/maps/place/' +
        currentField.markerPositions[0].lat +
        ',' +
        currentField.markerPositions[0].lng
    );
  }

  searchLocationAndCenterMap(event: any, currentField: FormField) {
    if ('geometry' in event) {
      currentField.centerMapOnCoordinates = {
        lat: event.geometry.location.lat(),
        lng: event.geometry.location.lng(),
      };
      console.log(currentField.centerMapOnCoordinates);
    }
  }

  markOptionAsSelected(option: string, currentField: FormField) {
    if (currentField.inputType === 'radio') {
      //console.log('before', 'option', option, 'selected', currentField.fieldControl.control.value)
      if (
        currentField.fieldControl.control.value === '' ||
        currentField.fieldControl.control.value !== option
      )
        currentField.fieldControl.control.setValue(option);
      else currentField.fieldControl.control.setValue('');
      //console.log('after', 'option', option, 'selected', currentField.fieldControl.control.value)
    }
  }
}
