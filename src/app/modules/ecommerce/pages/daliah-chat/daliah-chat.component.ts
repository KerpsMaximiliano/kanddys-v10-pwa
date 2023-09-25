import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Socket, io } from 'socket.io-client';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';

// const SERVER_URL = 'http://localhost:8000'; // Replace with your server URL

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
  selector: 'app-daliah-chat',
  templateUrl: './daliah-chat.component.html',
  styleUrls: ['./daliah-chat.component.scss']
})
export class DaliahChatComponent implements OnInit {
  @ViewChild('chatContainer') chatContainer: ElementRef;

  private socket: Socket;
  chat: Chat = {
    _id: '',
    owners: [],
    messages: [],
    admins: [],
    isGroup: false,
  };
  chatFormGroup: FormGroup = new FormGroup({
    input: new FormControl('', Validators.required),
  });
  conversationId: null = null;
  isTheUserTheMerchant: boolean = false;

  groupOptions = [
    {
      id: "OPTIONS",
      text: "Productores y exportadores de flores y follajes",
    },
    {
      id: "OPTIONS",
      text: "Importadores, mayoristas y minoristas de flores y follajes de diferentes mercados",
    },
    {
      id: "OPTIONS",
      text: "Proveedores de insumos, equipos, tecnología y servicios para la industria floricultora",
    },
    {
      id: "OPTIONS",
      text: "Asociaciones, gremios, entidades gubernamentales y organismos internacionales vinculados al sector floricultor",
    },
    {
      id: "OPTIONS",
      text: "Medios de comunicación especializados en floricultura y horticultura",
    }
  ]

  hideOptions = false;
  hideInput = true;

  optionState = '';

  constructor(
    public headerService: HeaderService,
    private route: ActivatedRoute,
    private gpt3Service: Gpt3Service
  ) {
  }

  ngOnInit() {
    this.chat.messages = [
      { sender: 'IA', message: "Hola, soy Dalia, en que te puedo ser más útil?" },
      { sender: 'user', message: "En lo que vendo" },
      { sender: 'IA', message: "En qué lo puedo ayudar?" }
    ]
    // this.route.params.subscribe(({ chatId }) => {
    //   if (
    //     this.headerService.saleflow.merchant.owner._id ===
    //     this.headerService.user?._id
    //   )
    //     this.isTheUserTheMerchant = true;

    //   this.socket = io(SERVER_URL, {
    //     extraHeaders: {
    //       token: localStorage.getItem('session-token'),
    //     },
    //   });

    //   // client-side
    //   this.socket.on('connect', () => {
    //     // Send a message to the server
    //     if (!chatId) {
    //       this.socket.emit('GET_OR_CREATE_CHAT', {
    //         owners: [this.socket.id],
    //         userId: this.headerService.saleflow.merchant.owner._id,
    //       });
    //     } else {
    //       this.socket.emit('GET_OR_CREATE_CHAT', {
    //         owners: [this.socket.id],
    //         chatId: chatId,
    //       });
    //     }
    //     this.socket.on('GET_OR_CREATE_CHAT', (chat) => {
    //       this.chat = chat;
    //     });

    //     this.socket.on('MESSAGE_SEND', (messageReceived: Message) => {
    //       console.log("messageReceived", messageReceived);
    //       console.log("myUser", this.headerService.user);
    //       this.chat.messages.push(messageReceived);
    //     });

    //     /*
    //     this.socket.emit('CHAT_LIST');

    //     this.socket.on('CHAT_LIST', (data) => {
    //       console.log('DATA LIST', data);
    //     });*/

    //     this.socket.on('ERROR', (data) => {
    //       console.error('ERROR', data);
    //     });
    //   });

    //   this.socket.on('disconnect', () => {
    //     console.log('desconectado'); // undefined
    //   });
    // });
  }

  /**
   * Envia la opción seleccionada por el usuario
   *
   * @param index la posición de la opción
   */
  sendOption(index: number) {
    const optionSelected = this.groupOptions[index]
    const newMessage = { sender: 'user', message: optionSelected.text, chatId: '' }
    this.addMessage(newMessage)
    this.optionsBySelect(optionSelected.id)
  }

  /**
   * Envia la respuesta del usuario por input
   *
   */
  sendMessage() {
    const message = this.chatFormGroup.get('input').value
    if (message) {
      const newMessage = { sender: 'user', message, chatId: '' }
      this.addMessage(newMessage)
      console.log(this.optionState)
      this.verifyStateChat()
    }
    this.chatFormGroup.get('input').setValue('')
  }

  /**
   * Añade el mensaje al listado de mensajes
   *
   * @param message
   */
  async addMessage(message: Message) {
    this.chat.messages.push(message)
    // this.socket.emit('MESSAGE_SEND', {
    //   chatId: this.chat._id,
    //   message: this.chatFormGroup.get('input').value,
    // });

    // if (!this.isTheUserTheMerchant) {
    //   await this.gpt3Service.requestResponseFromKnowledgeBase(
    //     this.chatFormGroup.get('input').value,
    //     this.headerService.saleflow._id,
    //     this.conversationId ? this.conversationId : null,
    //     this.chat._id,
    //     this.socket.id
    //   );
    // }

    this.scrollToBottom()
  }

  /**
   * LLleva al el contenido al fondo del chat con el Scroll
   */
  scrollToBottom(): void {
    const container = this.chatContainer.nativeElement;

    // Scroll to the bottom of the container using smooth scrolling behavior
    container.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  verifyStateChat() {
    /**
     * Support by IA
     */
    if (this.optionState === "SUPPORT-IA-EMAIL") {
      this.optionsWithIA("SUPPORT-EMAIL")
      return
    }

    if (this.optionState === 'SUPPORT-IA-HELP-DETAILS') {
      this.optionsWithIA("HELP-DETAILS")
    }

    if (this.optionState === 'SUPPORT-IA-CONTINUE') {
      this.optionsBySelect("IA-CONTINUE")
    }

    /**
     * Support by HUMAN
     */
    if (this.optionState === "SUPPORT-HUMAN") {
      this.optionsBySelect("FINISH-HUMAN")
      return
    }

    if (this.optionState === "FINISH-HUMAN") {
      this.optionsWithoutIA("FINISH")
      return
    }
  }

  private optionsBySelect(option: string) {
    if (option === "OPTIONS") {
      setTimeout(() => {
        const message = "¿Quisieras aprovechar lo que te puedo brindar usando la Inteligencia Artificial para ahorrarte tiempo en IentreopcionesseleccionadaDelLanding?"
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
        this.groupOptions = [
          { id: "SUPPORT-IA", text: "Si", },
          { id: "SUPPORT-HUMAN", text: "No", }
        ]
      }, 1000);
    }

    if (option === "SUPPORT-IA") {
      setTimeout(() => {
        const message = "Perfecto 🕺.  Te empezaré a informar de posibles herramientas que te ayudarán en lo que vendes .."
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
      }, 1000);

      setTimeout(() => {
        const message = "Cuando puedas, plis déjame saber en que eMail puedo guardar este chat."
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
        this.hideInput = false
        this.hideOptions = true
        this.optionState = "SUPPORT-IA-EMAIL"
      }, 1000);
    }

    if (option === "IA-CONTINUE") {
      this.hideOptions = true
      this.optionState = ''
      this.groupOptions = [
        {
          id: "OPTIONS",
          text: "Productores y exportadores de flores y follajes",
        },
        {
          id: "OPTIONS",
          text: "Importadores, mayoristas y minoristas de flores y follajes de diferentes mercados",
        },
        {
          id: "OPTIONS",
          text: "Proveedores de insumos, equipos, tecnología y servicios para la industria floricultora",
        },
        {
          id: "OPTIONS",
          text: "Asociaciones, gremios, entidades gubernamentales y organismos internacionales vinculados al sector floricultor",
        },
        {
          id: "OPTIONS",
          text: "Medios de comunicación especializados en floricultura y horticultura",
        }
      ]
      setTimeout(() => {
        const message = "¿En qué lo podemos ayudar?"
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
        this.hideOptions = false
      }, 1000);
    }

    if (option === "IA-FINISH") {
      this.hideOptions = true
      this.optionState = ''
      setTimeout(() => {
        const message = "Muchas gracias por su atención."
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
      }, 1000);
    }

    if (option === "SUPPORT-HUMAN") {
      setTimeout(() => {
        const message = "oki doki 🕺.. confirmaré que responderte con quienes me asisten a mí"
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
      }, 1000);

      setTimeout(() => {
        const message = "Por cierto, como te llamas?"
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
        this.hideInput = false
        this.hideOptions = true
        this.optionState = 'FINISH-HUMAN'
      }, 1000);
    }
  }

  private optionsWithIA(option: string) {
    if (option === "SUPPORT-EMAIL") {
      this.hideInput = true
      setTimeout(() => {
        const message = "Por si acaso, te mandaré un correo para que puedas regresar a este Chat y también lo tendrás disponible en www.flores.club, tu clave de acceso es: 4587 (la puedes cambiar luego) .."
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
      }, 1000);

      setTimeout(() => {
        const message = "Basado en lo que vendes actulamente, por favor dime donde está el mayor de tus problema:"
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
        this.hideInput = false
        this.optionState = 'SUPPORT-IA-HELP-DETAILS'
      }, 1000);
    }

    if (option === "HELP-DETAILS") {
      this.hideInput = true
      setTimeout(() => {
        const message = "Entiendo que wedwedew dwedwewefdewfdewfwefwefwefwefewfewfewfewfewfewfewfwefewfwefewfewf .. "
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
      }, 1000);

      setTimeout(() => {
        const message = "¿Entendí bien?, quieres agregar algo más?"
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
        this.groupOptions = [
          { id: "SUPPORT-IA-CONTINUE", text: "Si", },
          { id: "SUPPORT-IA-FINISH", text: "No", }
        ]
        this.hideOptions = false
        this.optionState = 'SUPPORT-IA-CONTINUE'
      }, 1000);
    }
  }

  private optionsWithoutIA(option: string) {
    if (option === "FINISH") {
      this.hideInput = true
      setTimeout(() => {
        const message = "Un placer nombreID, bien, te mandaré un eMail cuando mis asistentes me ayuden a indagar soluciones de loquentendí-ID"
        const newMessage = { message, sender: 'IA', chatId: '' }
        this.addMessage(newMessage)
        this.optionState = ''
      }, 1000);
    }
  }
}
