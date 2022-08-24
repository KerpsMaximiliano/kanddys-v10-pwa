import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/shared/components/answer-selector/answer-selector.component';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';

const AnswerMethodOptions = [
  {
    value: 'Visitante seleccionará entre opciones',
    status: true,
    click: true,
  },
  {
    value: 'Visitante selecionará una fecha',
    status: true,
    click: true,
  },
  {
    value: 'Visitante adicionará la respuesta',
    status: true,
    click: true,
  },
  /*{
    value: 'Visitante incluirá su dirección si no está en la base de datos',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará productos de tu tienda en nueva pantalla.',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará productos de tu tienda en lo misma pantalla.',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará productos de CollectionID en nueva pantalla.',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará productos de CollectionID en la misma pantalla.',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará productos de CollectionID en nueva pantalla.',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará entre tus métodos de pagos en nueva pantalla.',
    status: true,
    click: true,
  },*/
];

const DateAnswerTypeOptions = [
  {
    value: 'Cualquier dia y hora',
    status: true,
    click: true,
  },
  {
    value: 'Cualquier dia',
    status: true,
    click: true,
  },
  {
    value: 'Cualquier hora',
    status: true,
    click: true,
  },
  {
    value: 'Cualquier dia y bloque de horas',
    status: true,
    click: true,
  },
  {
    value: 'En mi disponibilidad de dia y hora',
    status: true,
    click: true,
  },
  {
    value: 'En mi disponibilidad de dia',
    status: true,
    click: true,
  },
  {
    value: 'En mi disponibilidad de hora',
    status: true,
    click: true,
  },
  {
    value: 'En mi disponibilidad de dias y bloques de horas',
    status: true,
    click: true,
  },
];

const AdditionAnswerTypeOptions = [
  {
    value: 'Adicionará un texto',
    status: true,
    click: true,
  },
  {
    value: 'Adicionará imagen o imágenes',
    status: true,
    click: true,
  },
  {
    value: 'Adicionará audio o audios',
    status: true,
    click: true,
  },
  {
    value: 'Adicionará un video',
    status: true,
    click: true,
  },
  {
    value: 'Adicionará un valor numérico',
    status: true,
    click: true,
  },
];

const SelectionAnswerTypeOptions = [
  {
    value: 'Seleccionará entre textos',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará entre imágenes',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará entre audios',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará entre videos',
    status: true,
    click: true,
  },
  {
    value: 'Seleccionará entre valor numérico',
    status: true,
    click: true,
  },
];

const OtherTables = [
  {
    value: 'AirTable',
    status: true,
    click: true,
  },
  {
    value: 'Google Sheet',
    status: true,
    click: true,
  },
  {
    value: 'Apple Numbers',
    status: true,
    click: true,
  },
  {
    value: 'Windows Excel',
    status: true,
    click: true,
  },
  {
    value: 'Solo en Kanddys',
    status: true,
    click: true,
  },
];

@Component({
  selector: 'app-answer-method-webform',
  templateUrl: './answer-method-webform.component.html',
  styleUrls: ['./answer-method-webform.component.scss'],
})
export class AnswerMethodWebformComponent implements OnInit {
  answerMethodOptions: OptionAnswerSelector[] = AnswerMethodOptions;
  answerTypeOptions: OptionAnswerSelector[];
  otherTablesOptions: OptionAnswerSelector[] = OtherTables;
  answerMethod: number;
  answerType: number;
  otherTable: number;
  answerRequired: boolean = false;
  question: string;
  description: string;
  first_answer: string;
  second_answer: string;
  images: File[] = [];

  constructor(private headerService: HeaderService, private router: Router) {}

  ngOnInit(): void {}

  onSelect(
    option: 'answerMethod' | 'answerType' | 'otherTable',
    value: number
  ) {
    if (option === 'answerMethod') {
      if (value != this.answerMethod) this.resetValues();
      this.answerMethod = value;
      switch (value) {
        case 0:
          this.answerTypeOptions = SelectionAnswerTypeOptions;
          break;
        case 1:
          this.answerTypeOptions = DateAnswerTypeOptions;
          break;
        case 2:
          this.answerTypeOptions = AdditionAnswerTypeOptions;
          break;
      }
      return;
    }
    if (option === 'answerType') return (this.answerType = value);
    if (option === 'otherTable') return (this.otherTable = value);
  }

  resetValues() {
    this.answerType = null;
    this.first_answer = null;
    this.second_answer = null;
    this.images = [];
  }

  back() {
    this.router.navigate([this.headerService.flowRoute]);
  }

  onFileInput(file: File | { image: File; index: number }) {
    if ('index' in file) {
      if (file.index >= 2) return;
      this.images.push(file.image);
    }
  }
}
