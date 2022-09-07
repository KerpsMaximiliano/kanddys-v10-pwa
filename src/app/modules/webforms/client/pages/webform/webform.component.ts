import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import {
  AnswerInput,
  AnswersQuestionInput,
  Question,
  Webform,
} from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';

interface QuestionControl extends Question {
  formControl?: FormControl;
  choices?: OptionAnswerSelector[];
}

@Component({
  selector: 'app-webform',
  templateUrl: './webform.component.html',
  styleUrls: ['./webform.component.scss'],
})
export class WebformComponent implements OnInit {
  // inputType:
  //   | 'fullName'
  //   | 'image'
  //   | 'text'
  //   | 'number'
  //   | 'phone'
  //   | 'email'
  //   | 'url' = 'phone';
  // clientInput = new FormGroup({
  //   text: new FormControl(null, [Validators.required, Validators.minLength(3)]),
  //   image: new FormControl(),
  //   phoneNumber: new FormControl(),
  //   name: new FormControl(null, [Validators.minLength(3)]),
  //   lastName: new FormControl(null, [Validators.minLength(2)]),
  //   email: new FormControl(),
  //   phone: new FormControl(null, [Validators.maxLength(15)]),
  //   url: new FormControl(null, [Validators.minLength(6)]),
  // });
  form: FormGroup = new FormGroup({});
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;
  webform: Webform;
  questions: QuestionControl[] = [];

  constructor(
    private webformsService: WebformsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.webform = this.webformsService.webformData;
    this.questions = this.webform.questions
      .filter((question) => question.active)
      .map((question) => {
        const defaultValue = question.answerDefault.find(
          (value) => value.active
        )?.value;
        const validations: ValidatorFn[] = [];
        if (question.required) validations.push(Validators.required);
        if (question.type === 'number') validations.push(Validators.min(1));
        const formControl = this.fb.control(defaultValue, validations);
        this.form.addControl(question._id, formControl);
        return {
          ...question,
          formControl,
          choices:
            question.type === 'multiple'
              ? question.answerDefault
                  .filter((answer) => answer.active)
                  .map((answers) => {
                    return {
                      value: answers.value,
                      status: true,
                    };
                  })
              : null,
        };
      });
  }

  async onSubmit() {
    const response: AnswersQuestionInput[] = [];
    for (let i in this.form.value) {
      response.push({
        question: i,
        value: !(this.form.value[i] instanceof File)
          ? this.form.value[i]
          : null,
        isMedia: this.form.value[i] instanceof File,
        media: this.form.value[i] instanceof File ? this.form.value[i] : null,
      });
    }
    const input: AnswerInput = {
      webform: this.webform._id,
      response,
    };
    await this.webformsService.createAnswer(input);
    const message = `Respuestas enviadas al webform "${
      this.webform.name
    }"\n${response.map((answer) => {
      const question = this.webform.questions.find(
        (q) => q._id === answer.question
      )?.value;
      return `\n${question}: ${answer.isMedia ? 'Archivo' : answer.value}`;
    })}`;
    const whatsappLink = `https://wa.me/${
      this.webform.merchant.owner.phone
    }?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappLink;
  }

  onCurrencyInput(
    form: FormControl | AbstractControl,
    value: { formatted: string; number: number }
  ) {
    form.setValue(value.number);
  }

  onSelectInput(
    form: FormControl | AbstractControl,
    questionIndex: number,
    value: number
  ) {
    form.setValue(this.questions[questionIndex].answerDefault[value].value);
  }

  onFileInput(
    form: FormControl | AbstractControl,
    file: File | { image: File; index: number }
  ) {
    if (!('index' in file)) {
      form.setValue(file);
    }
  }
}
