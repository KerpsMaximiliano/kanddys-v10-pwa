import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { QuestionInput, WebformInput } from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';

@Component({
  selector: 'app-question-to-admin',
  templateUrl: './question-to-admin.component.html',
  styleUrls: ['./question-to-admin.component.scss']
})
export class QuestionToAdminComponent implements OnInit {

  question = ''
  webformId = '';
  
  constructor(
    private webformService:WebformsService,
    private router:Router,
    private activatedRoute:ActivatedRoute
  ) { }

  ngOnInit(): void {
   this.webformId = this.activatedRoute.snapshot.paramMap.get('webformid');
  }

  async addQuestion() {
    if (this.question.length > 0) {
      try {
        lockUI();
        const question: QuestionInput = {
          type: 'multiple',
          value: this.question,
          answerTextType: 'DEFAULT',
          required: true,
          answerLimit: 1,
          answerDefault: [
            {
              value: "Opción 1",
            },
            {
              value: "Opción 2",
            },
            {
              value: "Opción 3",
            },
            {
              value: "Opción 4",
            }
          ]
        }
        const result = await this.webformService.webformAddQuestion([question],this.webformId);
        if (result) {
          var questionCreated = result.questions[result.questions.length - 1];
          this.webformService.editingQuestion = questionCreated;
          unlockUI();
          this.router.navigate([`/admin/edit-question/${this.webformId}/${questionCreated._id}`]);
        }
      } catch (error) {
        console.log(error);
        unlockUI();
      }
    } 
  }

}
