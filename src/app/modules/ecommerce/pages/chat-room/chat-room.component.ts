import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Socket, io } from 'socket.io-client';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';

const SERVER_URL = 'http://localhost:8000'; // Replace with your server URL

interface Chat {
  name?: string;
  description?: string;
  owners: Array<string>;
  messages: Array<any>;
  admins: Array<string>;
  isGroup: boolean;
  _id: string;
}

interface Message {
  message: string;
  sender: string;
  chatId: string;
}

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit {
  private socket: Socket;
  chat: Chat;
  chatFormGroup: FormGroup = new FormGroup({
    input: new FormControl('', Validators.required),
  });
  conversationId: null = null;
  isTheUserTheMerchant: boolean = false;

  constructor(
    public headerService: HeaderService,
    private route: ActivatedRoute,
    private gpt3Service: Gpt3Service
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(({ chatId }) => {
      if (
        this.headerService.saleflow.merchant.owner._id ===
        this.headerService.user?._id
      )
        this.isTheUserTheMerchant = true;

      this.socket = io(SERVER_URL, {
        extraHeaders: {
          token: localStorage.getItem('session-token'),
        },
      });

      // client-side
      this.socket.on('connect', () => {
        // Send a message to the server
        if (!chatId) {
          this.socket.emit('GET_OR_CREATE_CHAT', {
            owners: [this.socket.id],
            userId: this.headerService.saleflow.merchant.owner._id,
          });
        } else {
          this.socket.emit('GET_OR_CREATE_CHAT', {
            owners: [this.socket.id],
            chatId: chatId,
          });
        }
        this.socket.on('GET_OR_CREATE_CHAT', (chat) => {
          this.chat = chat;
        });

        this.socket.on('MESSAGE_SEND', (messageReceived: Message) => {
          console.log("messageReceived", messageReceived);
          console.log("myUser", this.headerService.user);
          this.chat.messages.push(messageReceived);
        });

        /*
        this.socket.emit('CHAT_LIST');

        this.socket.on('CHAT_LIST', (data) => {
          console.log('DATA LIST', data);
        });*/

        this.socket.on('ERROR', (data) => {
          console.error('ERROR', data);
        });
      });

      this.socket.on('disconnect', () => {
        console.log('desconectado'); // undefined
      });
    });
  }

  async sendQuestion() {
    this.socket.emit('MESSAGE_SEND', {
      chatId: this.chat._id,
      message: this.chatFormGroup.get('input').value,
    });

    if (!this.isTheUserTheMerchant) {
      await this.gpt3Service.requestResponseFromKnowledgeBase(
        this.chatFormGroup.get('input').value,
        this.headerService.saleflow._id,
        this.conversationId ? this.conversationId : null,
        this.chat._id,
        this.socket.id
      );
    }
  }
}
