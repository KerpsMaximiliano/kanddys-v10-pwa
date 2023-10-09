import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Chat } from 'src/app/core/models/chat';
import { ChatService } from 'src/app/core/services/chat.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { UsersService } from 'src/app/core/services/users.service';
import { User } from 'src/app/core/models/user';
import { HeaderService } from 'src/app/core/services/header.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

interface ExtendedChat extends Chat {
  receiver?: User;
  receiverId?: string;
}

@Component({
  selector: 'app-laia-chats',
  templateUrl: './laia-chats.component.html',
  styleUrls: ['./laia-chats.component.scss'],
})
export class LaiaChatsComponent implements OnInit {
  assetsURL = environment.assetsUrl;
  itemSearchbar: FormControl = new FormControl('');
  chats: Array<ExtendedChat> = [];
  usersById: Record<string, User> = {};
  chatsByMonth: Array<{
    id: string;
    month: {
      number: number;
      label: string;
    };
    year: number;
    chats: Array<ExtendedChat>;
  }> = [];
  monthsByNumber = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre',
  };

  constructor(
    private chatsService: ChatService,
    private usersService: UsersService,
    private router: Router,
    private merchantsService: MerchantsService,
    private headersService: HeaderService
  ) {}

  async ngOnInit() {
    const chats = await this.chatsService.listMyChats();
    let usersToFetch = [];

    if (chats) {
      this.chats = chats;

      this.chats.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      this.chats.forEach((chat, index) => {
        usersToFetch = usersToFetch.concat(
          chat.owners.map((user) => user.userId)
        );
      });

      const users: Array<User> = await this.usersService.paginateUsers({
        findBy: {
          id: usersToFetch,
        },
      });

      if (users && users.length) {
        users.forEach((user) => {
          this.usersById[user._id] = user;
        });
      }

      this.chats.forEach((chat, index) => {
        const creationDate = new Date(chat.createdAt);
        const month = creationDate.getMonth() + 1;
        const year = creationDate.getFullYear();

        const userId = chat.owners.find(
          (owner) => owner.userId !== this.headersService.user._id
        ).userId;

        if (userId) {
          chat.receiver = this.usersById[userId];
        }

        if (this.chatsByMonth.length === 0)
          this.chatsByMonth.push({
            id: month + '-' + year,
            month: {
              number: month,
              label: this.monthsByNumber[month],
            },
            year,
            chats: [],
          });

        if (
          this.chatsByMonth.length > 0 &&
          this.chatsByMonth[this.chatsByMonth.length - 1].month.number === month
        ) {
          this.chatsByMonth[this.chatsByMonth.length - 1].chats.push(chat);
        } else {
          this.chatsByMonth.push({
            id: month + '-' + year,
            month: {
              number: month,
              label: this.monthsByNumber[month],
            },
            year,
            chats: [],
          });

          this.chatsByMonth[this.chatsByMonth.length - 1].chats.push(chat);
        }
      });
    }
  }

  getCreationDateDifferenceAsItsSaid(dateISOString) {
    const dateObj = new Date(dateISOString);
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const hour = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    moment.locale('es');
    return moment([year, month, day, hour, minutes]).fromNow();
  }

  async goToChatDetail(chat: ExtendedChat) {
    lockUI();

    const merchantDefault = await this.merchantsService.merchantDefault(
      chat.receiver._id
    );

    unlockUI();

    this.router.navigate([
      'ecommerce/' + merchantDefault?.slug + '/chat-merchant/' + chat._id,
    ]);
  }
}
