import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment'

interface QuestionForm{
    date?: string;
    answer?: string;
    question: string;
    image?: string;
};

@Component({
  selector: 'app-question-item',
  templateUrl: './question-item.component.html',
  styleUrls: ['./question-item.component.scss']
})
export class QuestionItemComponent implements OnInit {

  @Input() view: 'visitor' | 'form' = 'form';
  @Input() single: boolean;
  @Input() icon: string;
  @Input() headline: string;
  @Input() total: number;
  @Input() data: QuestionForm[];
  env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
