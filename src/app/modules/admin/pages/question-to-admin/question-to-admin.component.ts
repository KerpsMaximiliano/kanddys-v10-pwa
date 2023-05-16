import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  constructor(private webformService:WebformsService,private router:Router,private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {
   this.webformId = this.activatedRoute.snapshot.paramMap.get('webformid');
  }

   async addQuestion(){
    if(this.question.length>0){

      const question:QuestionInput = {type:'text',value:this.question,answerTextType:'DEFAULT'}
      const result = await this.webformService.webformAddQuestion([question],this.webformId);
       if(result){
         var questionCreated = result.questions[result.questions.length-1];
         this.webformService.editingQuestion = questionCreated;
         this.router.navigate([`/admin/create-delivery-zone/${questionCreated._id}`]);
        }
    }
    
  }

}
