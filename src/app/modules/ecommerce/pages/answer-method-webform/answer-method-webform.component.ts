import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/shared/components/answer-selector/answer-selector.component';

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
  {
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
  },
];

const AnswerTypeOptions = [
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
]

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
]

@Component({
  selector: 'app-answer-method-webform',
  templateUrl: './answer-method-webform.component.html',
  styleUrls: ['./answer-method-webform.component.scss']
})
export class AnswerMethodWebformComponent implements OnInit {
  answerMethodOptions: OptionAnswerSelector[] = AnswerMethodOptions;
  answerTypeOptions: OptionAnswerSelector[] = AnswerTypeOptions;
  otherTablesOptions: OptionAnswerSelector[] = OtherTables;
  answerMethod: number;
  answerType: number;
  otherTable: number;
  answerRequired: boolean = false;
  question: string;
  description: string;

  constructor() { }

  ngOnInit(): void {
  }

  onSelect(option: 'answerMethod' | 'answerType' | 'otherTable', value: number) {
    if(option === 'answerMethod') return this.answerMethod = value;
    if(option === 'answerType') return this.answerType = value;
    if(option === 'otherTable') return this.otherTable = value;
  }

  back() {
    // if(this.answerType != null) return this.answerType = null;
    // if(this.answerMethod != null) return this.answerMethod = null;
  }

}
