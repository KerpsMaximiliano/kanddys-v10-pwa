import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';

@Component({
  selector: 'app-webform-webhook-config',
  templateUrl: './webform-webhook-config.component.html',
  styleUrls: ['./webform-webhook-config.component.scss']
})
export class WebformWebhookConfigComponent implements OnInit {

   stepValue: 'saveAnswer' | 'webhook' | 'selectTable' | 'connect' = 'connect';
   databaseIndex: number;
   tableIndex: number;
   fieldIndex: number;
   databaseOptions: OptionAnswerSelector[] = [
      {
         value: 'Airtable',
         status: true,
         click: false
      },
      {
         value: 'Google Sheets (N/A)',
         status: true,
         click: false
      },
      {
         value: 'Apple Numbers (N/A)',
         status: true,
         click: false
      },
      {
         value: 'Windows Excel (N/A)',
         status: true,
         click: false
      },
   ];
   
   tableOptions: OptionAnswerSelector[] = [
      {
         value: 'Tabla name ID',
         status: true,
         click: false
      },
      {
         value: 'Tabla name ID',
         status: true,
         click: false
      },
      {
         value: 'Tabla name ID',
         status: true,
         click: false
      },
      {
         value: 'Tabla name ID',
         status: true,
         click: false
      },
      {
         value: 'Tabla name ID',
         status: true,
         click: false
      },
      {
         value: 'Tabla name ID',
         status: true,
         click: false
      },
   ];
   fieldOptions: OptionAnswerSelector[] = [
      {
         value: 'Field Name ID',
         status: true,
         click: false
      },
      {
         value: 'Field Name ID',
         status: true,
         click: false
      },
      {
         value: 'Field Name ID',
         status: true,
         click: false
      },
   ];
   dummyOptions: OptionAnswerSelector[] = [
      {
         value: 'Tabla name ID',
         status: true,
         click: false
      }
   ];
   dummyActiveOption: OptionAnswerSelector[] = [
      {
         value: 'Field Name ID',
         status: true,
         click: false
      }
   ];
   constructor() { }

  ngOnInit(): void {
  }


}
