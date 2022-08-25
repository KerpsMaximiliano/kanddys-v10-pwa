import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Merchant } from 'src/app/core/models/merchant';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { WebformsService } from 'src/app/core/services/webforms.service';

@Component({
  selector: 'app-webform-input-selector',
  templateUrl: './webform-input-selector.component.html',
  styleUrls: ['./webform-input-selector.component.scss']
})
export class WebformInputSelectorComponent implements OnInit {

  answerMethod: any = [
    {
      value: `Visitante adicionará la respuesta`,
      click: false,
      status: true
    }
  ];

  options: any = [
    {
      value: `Texto`,
      status: true,
    },
    {
      value: `Nombre y Apellido`,
      status: true,
    }
  ]

  merchant: Merchant;
  isClicked: boolean = false;
  selectedOption: number;


  constructor(
    private webforms: WebformsService,
    private merchants: MerchantsService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.getMerchant();
  }

  back() {
    console.log("back");
  }

  selectOption(data: any) {
    console.log(data);
    this.isClicked = true;
    this.selectedOption = data;
  }

  async getMerchant() {
    this.merchant = await this.merchants.merchantDefault();
    if (!this.merchant) this.router.navigate(['/auth/login']);
  }

  async save() {
    console.log("saving...");
    await this.webforms.createWebform(
      {
        name: "Webform pro"
      },
      this.merchant._id
    ).then(async webform => {
      if (webform) {
        console.log(webform);
        if (!(this.options[this.selectedOption].value == 'Nombre y Apellido')) {
          await this.webforms.webformAddQuestion(
            [{
              type: 'text',
              index: 0,
              value: "Pregunta genérica que se responde con un texto cualquiera",
              show: true,
              required: true
            }],
            webform._id
          ).then(question => {
            console.log(question);
            this.router.navigate([`/webforms/webform/${webform._id}`]);
          });
        } else {
          await this.webforms.webformAddQuestion(
            [
              {
                type: 'text',
                index: 0,
                value: "Nombre",
                show: true,
                required: true
              },
              {
                type: 'text',
                index: 1,
                value: "Apellido",
                show: true,
                required: true
              }
            ],
            webform._id
          ).then(question => {
            console.log(question);
            this.router.navigate([`/webforms/webform/${webform._id}`]);
          })
        }
      }
    });
  }

}
