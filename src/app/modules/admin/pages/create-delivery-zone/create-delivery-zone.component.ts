import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { Question, QuestionInput } from 'src/app/core/models/webform';
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
  numb = 0;
  question: Question;

  webformId: string;

  constructor(
    private _bottomSheet: MatBottomSheet,
    private webformService: WebformsService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.webformId = this.activatedRoute.snapshot.paramMap.get('webformid');
    this.questionId = this.activatedRoute.snapshot.paramMap.get('questionid');
    this.getQuestion();
  }

  getAsString(val) {
    if (val == null || val == undefined) return val;
    return val.toString();
  }

  async getQuestion() {
    const question = this.webformService.editingQuestion;
    if (question) this.question = question;
    else {
      const result = await this.webformService.questionPaginate(
        {
          findBy: {
            _id: this.questionId,
          }
        }
      );
      this.question = result[0];
      this.webformService.editingQuestion = this.question;
    }
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
    const result = await this.webformService.webformUpdateQuestion(
      input,
      this.questionId,
      this.webformId
    );
    this.question = result;
  }

  openDialog(numb) {
    this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          options: [
            {
              title: `Renombrar "${this.question.value}"`,
              callback: () => this.router.navigate([`../../admin/rename-question/${this.webformId}/${this.question._id}`])
            },
            {
              title: `Renombrar "${this.question.answerDefault[numb].value}"`,
              callback: () => {
                this.router.navigate(
                  [`../../admin/rename-question/${this.webformId}/${this.question._id}`],
                  {
                    queryParams: {
                      answer: numb
                    },
                  }
                )
              }
            },
            {
              title: `Eliminar la opcion "${this.question.answerDefault[numb].value}"`,
              callback: () => console.log('Eliminar la opción')
            }
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
            this.webformId
          );
        },
      },
    });
    this.router.navigate(['../../admin/reportings']);
  }

  select(numb){
    if(numb == this.numb){
      this.webformService.editingQuestion = this.question;
      this.openDialog(numb)
    }

    this.numb = numb;
  }
}
