import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-envelope-content',
  templateUrl: './envelope-content.component.html',
  styleUrls: ['./envelope-content.component.scss'],
})
export class EnvelopeContentComponent implements OnInit {
  @Input() title: string = 'Contenido del Sobre';
  @Input() nombreSobre: string = 'La mujer que le dicen DaVest!!';
  @Input() mensaje: string =
    'Por conseguir lo que veias imposible, por creer en ti, y por demostrarnos a todos lo grande y capaz que eres.';
  @Input() from: string = 'James Bond';
  @Input() to: string = 'Padme Amidala';
  @Input() shadows: boolean = true;
  constructor(private router: Router, private headerService: HeaderService) {}

  ngOnInit(): void {
    if (
      this.from &&
      this.from.length > 0 &&
      this.mensaje &&
      this.mensaje.length > 0 &&
      this.nombreSobre &&
      this.nombreSobre.length > 0
    ) {
      this.shadows = false;
    } else {
      this.shadows = true;
    }
  }

  editContent() {
    this.router.navigate([
      'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/create-giftcard',
    ]);
  }
}
