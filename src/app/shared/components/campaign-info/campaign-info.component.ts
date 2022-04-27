import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-campaign-info',
  templateUrl: './campaign-info.component.html',
  styleUrls: ['./campaign-info.component.scss']
})
export class CampaignInfoComponent implements OnInit {
  @Input() mode: string = 'campaign';
  @Input() Ctext: string = 'Fundar Mi club';
  @Input() campaign: Object = [
    {
      title: 'Campaña actual:',
      texts:['La campaña actual es enfocada en el dia de las madres y en santo domingo', 'Los productos comprados por la audiencia llegaran el sabado 28 de mayo',
       'El consumo de los Kanddys (Gift-cards) hasta el 2023']
    },
    {
      title: 'Monetizacion:',
      texts: ['Los clubs ganan el 70% de la colaboracion que paga el comerciante y el 100% cuando es quien invita']
    },
    {
      title: 'Activa tu club gratis para ganar dinero e invitar a comerciantes:'
    }
  ];
  @Input() itemURL: string = 'https://givengiftcardurl.com';
  @Input() information: string = 'Los envios de esta campaña son esclusivamente en Santo Domingo, República Dominicana el Sábado 28 de Mayo.';
  constructor() { }

  ngOnInit(): void {
  }

}
