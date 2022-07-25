import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

const reservations = [
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
];

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
})
export class ReservationsComponent implements OnInit {
  tabs: string[] = ['ÚLTIMAS', 'FUTURAS', 'PASADAS'];
  active: number = 0;
  mouseDown = false;
  startX: any;
  scrollLeft: any;
  editMode: boolean;
  env: string = environment.assetsUrl;
  reservations: Array<any> = reservations;

  constructor() {}

  ngOnInit(): void {}

  placeholder = () => {
    console.log('Funcion Placeholder');
  };

  changeTab(i: number) {
    this.active = i;
  }

  startDragging(e, flag, el) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging(e, flag) {
    this.mouseDown = false;
  }

  moveEvent(e, el) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  toggleEdit = () => {
    this.editMode = !this.editMode;
  };

  deleteOrder() {
    console.log('Borra esta orden');
  }
}
