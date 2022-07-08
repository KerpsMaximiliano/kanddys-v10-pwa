import { Component, Input, OnInit } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { UsersService } from 'src/app/core/services/users.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router'

interface QuestionForm{
  date?: string;
  answer?: string;
  question?: string;
  image?: string;
  tags?: Tag[];
};

@Component({
  selector: 'app-question-visitors-list',
  templateUrl: './question-visitors-list.component.html',
  styleUrls: ['./question-visitors-list.component.scss']
})
export class QuestionVisitorsListComponent implements OnInit {
  @Input() mode: number = 1;

  dummyTags: any[] = [
    {
      _id: "123456789",
      user: "123546789",
      updatedAt: "2022-06-14T01:48:10.049Z",
      counter: 5,
      containers: [],
      name: "Tag pro",
      createdAt: "2022-06-14T01:48:10.049Z",
      messageNotify: "Hola mami",
      notify: false,
      notifyMerchantOrder: false,
      notifyUserOrder: false
    },
    {
      _id: "123456789",
      user: "123546789",
      updatedAt: "2022-06-14T01:48:10.049Z",
      counter: 5,
      containers: [],
      name: "Tag pro",
      createdAt: "2022-06-14T01:48:10.049Z",
      messageNotify: "Hola mami",
      notify: false,
      notifyMerchantOrder: false,
      notifyUserOrder: false
    },
    {
      _id: "123456789",
      user: "123546789",
      updatedAt: "2022-06-14T01:48:10.049Z",
      counter: 5,
      containers: [],
      name: "Tag pro",
      createdAt: "2022-06-14T01:48:10.049Z",
      messageNotify: "Hola mami",
      notify: false,
      notifyMerchantOrder: false,
      notifyUserOrder: false
    }
  ];

  dummyUsers: User[] = []
  
  dummyAnswers: QuestionForm[][] = [
    [
      {
        answer: 'whaetver 1',
      },
    ],
    [
      {
        answer: 'whaetver 2',
      },
    ],
    [
      {
        answer: 'whaetver 3',
      },
    ],
    [
      {
        answer: 'whaetver 4',
      },
    ]
  ]

  dummyAnswers2: QuestionForm[][] = [
    [
      {
        image: "https://www.xtrafondos.com/wallpapers/resized/the-legend-of-zelda-breath-of-the-wild-4065.jpg?s=large"
      },
    ],
    [
      {
        image: "https://www.xtrafondos.com/wallpapers/resized/the-legend-of-zelda-breath-of-the-wild-4065.jpg?s=large"
      },
    ],
    [
      {
        image: "https://www.xtrafondos.com/wallpapers/resized/the-legend-of-zelda-breath-of-the-wild-4065.jpg?s=large"
      },
    ],
    [
      {
        image: "https://www.xtrafondos.com/wallpapers/resized/the-legend-of-zelda-breath-of-the-wild-4065.jpg?s=large"
      },
    ]
  ]

  dummyAnswers3: QuestionForm[][] = [
    [
      {
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non lorem id ex blandit aliquam. Mauris vehicula lectus nec sapien fermentum, id gravida nibh iaculis. Fusce id iaculis dolor, id dictum diam.'
      },
    ],
    [
      {
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non lorem id ex blandit aliquam. Mauris vehicula lectus nec sapien fermentum, id gravida nibh iaculis. Fusce id iaculis dolor, id dictum diam.'
      },
    ],
    [
      {
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non lorem id ex blandit aliquam. Mauris vehicula lectus nec sapien fermentum, id gravida nibh iaculis. Fusce id iaculis dolor, id dictum diam.'
      },
    ],
    [
      {
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non lorem id ex blandit aliquam. Mauris vehicula lectus nec sapien fermentum, id gravida nibh iaculis. Fusce id iaculis dolor, id dictum diam.'
      },
    ]
  ]

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) { }

  async ngOnInit(){
    const user = await this.authService.me();

    for(let i = 0; i < 3; i++) {
      this.dummyUsers.push(user);
    }
  }

}
