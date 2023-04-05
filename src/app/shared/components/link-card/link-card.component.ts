import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/core/models/webform';

@Component({
  selector: 'app-link-card',
  templateUrl: './link-card.component.html',
  styleUrls: ['./link-card.component.scss'],
})
export class LinkCardComponent implements OnInit {
  @Input() title: string = '¿Pregunta abiertaID?';
  @Input() text: string = '144 RespuestaID';
  @Input() question: Question = null;
  @Input() webformId: string = null;
  @Input() itemId: string = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  selectOption() {
    this.router.navigate(['/admin/webform-responses/' + this.webformId + '/' + this.itemId], {
      queryParams: {
        question: this.question._id,
        openResponses: true,
      },
    });
  }
}
