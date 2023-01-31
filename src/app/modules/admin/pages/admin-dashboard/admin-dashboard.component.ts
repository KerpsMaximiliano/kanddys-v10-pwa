import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  environment: string = environment.assetsUrl;

  tags: Array<any> = [
    {
      name: "WeDo Store",
      subMenu:{
        options: ["Mis Artículos", "Foro, encuestas"],
        selected: 0,
      }
    },
    {
      name: "Collections",
      subMenu: {
        options: ["Creadas", "Predefinidas", "Para vender mas"],
        selected: 0
      }
    }
  ];
  
  selected: number = 0

  createdCollections: Array<any> = 
  [
    {
      imgURL:"https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/16703498602455c99b82c99f1c4d5b61e47a4f9dc23cb42d784fe03594cb2d718ff2ceac8624d.png",
      title: "Arreglos con Globos",
      description:
      [
        "144 productos. 41 ventas en total.",
        "15 ventas ayer. 4 hoy."
      ]
    },
    {
      imgURL:"./../../../../../assets/images/abeja04.png",
      title: "Arreglos con Globos",
      description:
      [
        "144 productos. 41 ventas en total.",
        "15 ventas ayer. 4 hoy."
      ]
    },
    {
      imgURL:"https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/16703498602455c99b82c99f1c4d5b61e47a4f9dc23cb42d784fe03594cb2d718ff2ceac8624d.png",
      title: "Arreglos con Globos",
      description:
      [
        "144 productos. 41 ventas en total.",
        "15 ventas ayer. 4 hoy."
      ]
    },
    {
      imgURL:"https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/16703498602455c99b82c99f1c4d5b61e47a4f9dc23cb42d784fe03594cb2d718ff2ceac8624d.png",
      title: "Arreglos con Globos",
      description:
      [
        "144 productos. 41 ventas en total.",
        "15 ventas ayer. 4 hoy."
      ]
    }
  ]

  predefinedCollections: Array<any> = 
  [
    {
      imgURL:"",
      title: "Facturas",
      description:
      [
        "0 ventas. 0 productos.vendidos."
      ]
    },
    {
      imgURL:"",
      title: "El 20% de Items mas vendido",
      description:
      [
        "0 productos."
      ]
    },
    {
      imgURL:"",
      title: "El 20% de quienes mas compran",
      description:
      [
        "0 compradores."
      ]
    },
    {
      imgURL:"",
      title: "El 20% de quienes mas compran",
      description:
      [
        "0 compradores."
      ]
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

  selectTag(index: number){
    if(index!= this.selected){
      this.tags[this.selected].subMenu.selected = 0
      this.selected = index;
    }
  }

  changeSubOption(tagIndex: number, optionIndex: number)
  {
    this.tags[tagIndex].subMenu.selected = optionIndex;
  }
}
