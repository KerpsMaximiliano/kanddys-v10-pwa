import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/shared/components/answer-selector/answer-selector.component';

@Component({
  selector: 'app-notification-creator',
  templateUrl: './notification-creator.component.html',
  styleUrls: ['./notification-creator.component.scss']
})
export class NotificationCreatorComponent implements OnInit {
  actionList: OptionAnswerSelector[] = [
    {
      value: 'Al venderse',
      status: true
    },
    {
      value: 'Después de la entrega ',
      status: true
    },
    {
      value: 'StatusID',
      status: true
    },
    {
      value: 'StatusID',
      status: true
    },
    {
      valueArray: [
        {
          text: 'A',
          highlight: false
        },
        {
          text: 'los',
          highlight: false
        },
        {
          text: '45',
          highlight: true
        },
        {
          text: 'dias',
          highlight: false
        },
        {
          text: 'después',
          highlight: false
        },
        {
          text: 'de',
          highlight: false
        },
        {
          text: 'la',
          highlight: false
        },
        {
          text: 'venta',
          highlight: false
        },
        {
          text: 'a',
          highlight: false
        },
        {
          text: 'las',
          highlight: false
        },
        {
          text: '9:00 AM',
          highlight: true
        },        
      ],
      isOptionAnArray: true,
      status: true
    },
    {
      valueArray: [
        {
          text: 'A',
          highlight: false
        },
        {
          text: 'los',
          highlight: false
        },
        {
          text: '10',
          highlight: true
        },
        {
          text: 'minutos',
          highlight: false
        },
        {
          text: 'después',
          highlight: false
        },
        {
          text: 'de',
          highlight: false
        },
        {
          text: 'la',
          highlight: false
        },
        {
          text: 'venta',
          highlight: false
        },
      ],isOptionAnArray: true,
      status: true
    }
  ];

  receiverOptions: OptionAnswerSelector[] = [
    {
      value: 'El comprador',
      status: true
    },
    {
      value: '(000) 000-0000 (WA salvado)',
      status: true
    },
    {
      value: 'Adicionar otro WA',
      status: true
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
