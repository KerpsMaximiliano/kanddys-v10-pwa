import { Component, OnInit, Input } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment'

interface QuestionForm{
    date?: string;
    answer?: string;
    question?: string;
    image?: string;
};

interface FakeTag extends Tag {
  selected?: boolean;
}

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
  @Input() answer: string;
  @Input() date: string;
  @Input() total: number;
  @Input() data: QuestionForm[];
  @Input() tags?: FakeTag[];
  @Input() user?: User;
  @Input() users?: User[];
  showTags: boolean;
  env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
