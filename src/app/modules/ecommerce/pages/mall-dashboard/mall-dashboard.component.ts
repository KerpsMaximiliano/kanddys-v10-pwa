import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mall-dashboard',
  templateUrl: './mall-dashboard.component.html',
  styleUrls: ['./mall-dashboard.component.scss']
})
export class MallDashboardComponent implements OnInit {
  headerButtons = [
    {
      text: "Compradores",
      func: () => this.redirect(),

    },
    {
      text: `$147,154.00 DOP Total vendido`,
      func: () => this.redirect(),
    },
    {
      text: "144 En Colaboraciones",
      func: () => this.redirect(),
    },
  ];
  tabsOptions: string[] = ["Regalos", "Eventos", "NFT", "Categorias"];


  constructor() { }

  ngOnInit(): void {
  }

  onTabChange(route: string) {
    console.log(route);
  }

  redirect() {
    console.log('dasdfsafsdf');
  }

}
