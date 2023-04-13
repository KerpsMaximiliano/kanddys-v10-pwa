import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';

@Component({
  selector: 'app-router-options',
  templateUrl: './router-options.component.html',
  styleUrls: ['./router-options.component.scss'],
})
export class RouterOptionsComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private webformsService: WebformsService) {}

  @Input() title: string =
    '¿Cuáles son los principales desafíos que enfrenta su negocio en este momento?';

  @Input() options: Array<{
    text: string;
    link: string;
    file?: string;
    optionValue?: string;
    freeResponse?: boolean;
  }> = [];

  @Input() question: Question = null;
  @Input() webformId: string = null;
  @Input() itemId: string = null;

  ngOnInit(): void {}

  selectOption(selectedIndex: number, userProvidedResponses: boolean = false) {
    const queryParams: any = {
      question: this.question._id,
      selectedOption: selectedIndex,
    };

    if(userProvidedResponses) {
      delete queryParams.selectedOption;
      queryParams.openResponses = true;
    };

    this.webformsService.webformCreatorLastDialogs = [];

    this.router.navigate(['/admin/webform-responses/' + this.webformId + '/' + this.itemId], {
      queryParams,
    });
  }
}
