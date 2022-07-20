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
  icon?: {
    src: string,
    callback?(params): any;
    width: number;
    height: number;
  };
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
  @Input() headlineLeftIcon: {
    icon: string,
    callback?(params): any;
    width: number;
    height: number;
  } = null;
  @Input() headlineRightIcon: {
    icon: string,
    callback?(params): any;
    width: number;
    height: number;
  } = null;
  @Input() headlineRightText: {
    text: string,
    callback?(...params): any;
    color: string;
    fontSize: string;
    fontFamily: string;
  } = null;
  @Input() headlineTitleStyles: Record<string, any> = null;
  @Input() headlineRightTextStyles: Record<string, any> = null;
  @Input() headlineContainerStyles: Record<string, any> = null;
  @Input() tagListStyles: Record<string, any> = null;
  @Input() tagListTextStyles: Record<string, any> = null;
  @Input() answer: string;
  @Input() date: string;
  @Input() total: number;
  @Input() data: QuestionForm[];
  @Input() tags?: FakeTag[];
  @Input() collapseTags?: boolean = true;
  @Input() tagsLabel: string;
  @Input() chipMode: number = 1;
  @Input() user?: User;
  @Input() users?: User[];
  showTags: boolean;
  env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
