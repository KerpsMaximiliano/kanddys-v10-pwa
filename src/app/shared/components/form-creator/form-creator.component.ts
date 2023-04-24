import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swiper, { SwiperOptions } from 'swiper';
import {
  WebformCreatorStepsNames,
  WebformsService,
} from 'src/app/core/services/webforms.service';
import { SwiperComponent } from 'ngx-swiper-wrapper';

interface OptionInList {
  name: string;
  label: string;
}

@Component({
  selector: 'app-form-creator',
  templateUrl: './form-creator.component.html',
  styleUrls: ['./form-creator.component.scss'],
})
export class FormCreatorComponent implements OnInit {
  currentStepName: WebformCreatorStepsNames = 'ADMIN_NOTE';
  currentStepIndex: number = 0;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    allowSlideNext: true,
  };
  steps: Array<{
    name: string;
    fields: FormGroup;
  }> = [];
  responseTypesList: Array<OptionInList> = [
    {
      name: 'text',
      label: 'Escribiendo libremente',
    },
    {
      name: 'multiple',
      label: 'Seleccionando entre opciones',
    },
    {
      name: 'contact-info',
      label: 'Información de contacto',
    },
  ];
  textValidationOptions = [];
  timeoutId: any = null;
  validationsForResponseType: Record<
    string,
    {
      title: string;
      validations?: Array<OptionInList>;
    }
  > = {
    text: {
      title: 'TIPO DE RESPUESTA',
      validations: [
        {
          name: 'less-than-12-words',
          label: 'Menos de 12 Palabras',
        },
        {
          name: 'more-than-12-words',
          label: 'Mas de 12 palabras',
        },
        {
          name: 'number',
          label: 'Número',
        },
        {
          name: 'money-amount',
          label: 'Monto de dinero',
        },
      ],
    },
    multiple: {
      title: 'OPCIONES DE RESPUESTAS',
    },
    'contact-info': {
      title: 'OPCIONES DE CONTACTOS',
      validations: [
        {
          name: 'name',
          label: 'Nombre',
        },
        {
          name: 'lastname',
          label: 'Apellido',
        },
        {
          name: 'email',
          label: 'Correo electrónico',
        },
      ],
    },
  };
  @ViewChild('stepsSwiper') stepsSwiper: SwiperComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webformsService: WebformsService
  ) {}

  ngOnInit(): void {
    if (!this.webformsService.formCreationData) {
      this.webformsService.formCreationData = {
        currentStep: this.currentStepName,
        steps: this.steps,
        currentStepIndex: this.currentStepIndex,
      };

      this.steps.push({
        name: 'ADMIN_NOTE',
        fields: new FormGroup({
          note: new FormControl('', Validators.required),
        }),
      });

      this.addAQuestionToTheForm();
    } else {
      //Codigo para continuar
    }
  }

  addAQuestionToTheForm(navigateToNextQuestion = false) {
    this.steps.push({
      name: 'QUESTION_EDITION',
      fields: new FormGroup({
        question: new FormControl('', Validators.required),
        selectedResponseType: new FormControl('', Validators.required),
        selectedResponseValidation: new FormControl('', Validators.required),
      }),
    });

    if (navigateToNextQuestion) {
      setTimeout(() => {
        this.stepsSwiper.directiveRef.setIndex(this.currentStepIndex + 1);
      }, 100);
    }
  }

  templateStyles() {
    return { 'grid-template-columns': `repeat(${this.steps.length}, 1fr)` };
  }

  selectOptionInList(listName: string, value: string) {
    const selectedOption =
      this.steps[this.currentStepIndex].fields.controls[listName].value;
    const validationsOptionsFieldControl = this.steps[
      this.currentStepIndex
    ].fields.get('selectedResponseValidation');

    const isFalsy = (text: string) =>
      text === null || text === undefined || text === '';

    if (
      (isFalsy(selectedOption) &&
        !isFalsy(value) &&
        selectedOption !== value) ||
      (!isFalsy(selectedOption) && !isFalsy(value) && selectedOption !== value)
    ) {
      this.steps[this.currentStepIndex].fields.controls[listName].setValue(
        value
      );
    } else if (selectedOption === value) {
      this.steps[this.currentStepIndex].fields.controls[listName].setValue(
        null
      );
    }

    //If the admin select a response with multiple options for the user to choose,
    //then the formArray is saved on the steps.fields.controls['responseOptions'] variable.
    if (
      listName === 'selectedResponseType' &&
      value === 'multiple' &&
      !this.steps[this.currentStepIndex].fields.controls['responseOptions']
    ) {
      this.steps[this.currentStepIndex].fields.addControl(
        'responseOptions',
        new FormArray([
          new FormGroup({
            text: new FormControl(''),
            fileInput: new FormControl(null), // the file input value will be a File object
          }),
          new FormGroup({
            text: new FormControl(''),
            fileInput: new FormControl(null), // the file input value will be a File object
          }),
        ])
      );

      validationsOptionsFieldControl.setValidators([]);
      validationsOptionsFieldControl.updateValueAndValidity();
    } else if (
      listName === 'selectedResponseType' &&
      value === 'multiple' &&
      this.steps[this.currentStepIndex].fields.controls['responseOptions']
    ) {
      this.steps[this.currentStepIndex].fields.removeControl('responseOptions');
    } else if (value !== 'multiple' && listName === 'selectedResponseType') {
      validationsOptionsFieldControl.setValidators([Validators.required]);
      validationsOptionsFieldControl.updateValueAndValidity();
    }
  }

  updateCurrentStepData(swiper: Swiper) {
    this.currentStepIndex = swiper.activeIndex;
    this.currentStepName = this.steps[this.currentStepIndex]
      .name as WebformCreatorStepsNames;
  }

  getFormArray(data: any): FormArray {
    return data;
  }

  getFormGroup(data: any): FormGroup {
    return data;
  }

  onMultipleInputEnterPress(
    event: any,
    fieldformArray: any,
    textOrImage: string,
    index: number
  ) {
    const formArray = this.steps[this.currentStepIndex].fields.get(
      'responseOptions'
    ) as FormArray;

    if (index + 1 === formArray.controls.length) {
      if (this.timeoutId) clearTimeout(this.timeoutId);

      this.timeoutId = setTimeout(() => {
        formArray.push(
          new FormGroup({
            text: new FormControl(''),
            fileInput: new FormControl(null), // the file input value will be a File object
          })
        );
      }, 1000);
    }

    if (event.key === 'Backspace' && this.timeoutId)
      clearTimeout(this.timeoutId);

    /*
    if (index + 1 === fieldformArray.length) {
      if (this.timeoutId) clearTimeout(this.timeoutId);

      this.timeoutId = setTimeout(() => {
        callback(fieldformArray, fieldName);
      }, 1000);
    }

    if (event.key === 'Backspace' && this.timeoutId)
      clearTimeout(this.timeoutId);
    */
  }

  removeInputToCurrentFormArray(
    fieldformArray: FormArray,
    textOrImage: string,
    fieldIndex: number
  ): void {
    let newIndexToFocus: string =
      fieldformArray.controls.length - 1 === fieldIndex
        ? String(fieldIndex - 1)
        : String(fieldIndex);

    fieldformArray.removeAt(fieldIndex);

    setTimeout(() => {
      if (textOrImage === 'text') {
        {
          document
            .getElementById(
              'step-' + this.currentStepIndex + '-field-text' + newIndexToFocus
            )
            .focus();
        }
      }
    }, 100);
  }
}
