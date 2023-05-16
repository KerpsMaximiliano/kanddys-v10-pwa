import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionInput } from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-delivery-zone',
  templateUrl: './create-delivery-zone.component.html',
  styleUrls: ['./create-delivery-zone.component.scss'],
})
export class CreateDeliveryZoneComponent implements OnInit {
  env: string = environment.assetsUrl;
  questionId = '';
  aditional;
  excedent;
  lower;
  cost;
  numb = 1;
  question: any = { value: '' };
  constructor(
    private _bottomSheet: MatBottomSheet,
    private webformService: WebformsService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.questionId = this.activatedRoute.snapshot.paramMap.get('questionid');
    this.getQuestion();
  }

  getAsString(val) {
    if (val == null || val == undefined) return val;
    return val.toString();
  }

  getQuestion() {
    this.question = this.webformService.editingQuestion;
  }

  async updateQuestion() {
    let input: QuestionInput = {
      type: 'multiple',
      answerLimit: 1,
      answerTextType: 'DECIMAL',
      trigger: 'income',
      answerDefault: [
        {
          label:
            'Monto que el comprador tiene que pagar adicional al seleccionar esta opción',
          value: this.getAsString(this.aditional),
        },
        {
          label: 'Cuando el monto de la compra excede: (condición opcional)',
          value: this.getAsString(this.excedent),
        },
        {
          label:
            'Cuando el monto de la compra es menor a: (condición opcional)',
          value: this.getAsString(this.lower),
        },
        {
          label:
            '¿Cuál es tu costo? (opcional para el control de tus beneficios)',
          value: this.getAsString(this.cost),
        },
      ],
    };
    const webformId = this.webformService.webformId;
    const result = await this.webformService.webformUpdateQuestion(
      input,
      this.questionId,
      webformId
    );
    this.question = result;
  }

  openDialog(numb) {
    this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          options: [
            {
              title: `Renombrar ${this.question.value}`,
              callback: () =>       this.router.navigate(['../../admin/rename-question/name']),
            },
            {
              title: `Editar el orden de las opciones`,
              // callback: () => this.navigate(type),
            },
            {
              title: `Renombrar ZonaId`,
              callback: () => this.router.navigate(['../../admin/rename-question/',numb]),
            },
            {
              title: `Eliminar la opcion ZonaId`,
              // callback: () => this.navigate(type),
            },

           
          ],
        },
      ],
    });
  }

  removeQuestion() {
    this.dialogService.open(SingleActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'Elimina este artículo',
        buttonText: 'Sí, borrar',
        mainButton: () => {
          this.webformService.webformRemoveQuestion(
            [this.questionId],
            this.webformService.webformId
          );
        },
      },
    });
    this.router.navigate(['../../admin/reportings']);
  }

  select(numb){
    if(numb==this.numb){
      this.webformService.editingQuestion = this.question;
      this.openDialog(numb)
    }

    this.numb = numb;
  }
}
