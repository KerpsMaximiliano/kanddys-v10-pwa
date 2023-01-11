import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Post, PostInput } from 'src/app/core/models/post';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-envelope-content',
  templateUrl: './envelope-content.component.html',
  styleUrls: ['./envelope-content.component.scss'],
})
export class EnvelopeContentComponent implements OnInit {
  @Input() post: Post | PostInput;
  constructor(private router: Router, private headerService: HeaderService) {}

  ngOnInit(): void {}

  editContent() {
    this.router.navigate([
      'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/create-giftcard',
    ]);
  }
}
