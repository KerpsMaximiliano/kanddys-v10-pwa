import { 
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { isEmail } from 'src/app/core/helpers/strings.helpers';
import { Chat, Message } from 'src/app/core/models/chat';
import { AuthService } from 'src/app/core/services/auth.service';

interface DialogTemplate {
  title?: string;
  description: string;
  options: Array<{
    value: string;
    callback: () => void;
  }>;
  styles?: Record<string, Record<string, string>>;
  bottomLabel?: string;
  login?: () => void;
  phone?: () => void;
  url?: () => void;
}

@Component({
  selector: 'app-signup-chat',
  templateUrl: './signup-chat.component.html',
  styleUrls: ['./signup-chat.component.scss']
})
export class SignupChatComponent implements OnInit {
  @ViewChild('chatContainer') private chatContainer: ElementRef;
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

  showEditButton = false;
  hideInput: boolean = false;
  isEdit: boolean = false
  inputValue: string = '';

  @Output() openLogin: EventEmitter<boolean> = new EventEmitter();

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef
  ) { }

  ngAfterViewInit(): void {
    this.scrollToBottom()
  }

  ngOnInit(): void {
    this.welcomeMessage()
  }

  async welcomeMessage() {
    const message = `
    <p>Hola, soy Laia, y te estaba esperando!!</p>

    <p>Cuando agregues detalles en mi memoria te ayudaré a que:</p>
    <ul>
    <li>Respondamos de forma consistente desde el Website, Shopify, WhatsApp e Instagram.</li>
    <li>Vendamos. Coticemos. Facturemos. Organicemos los pedidos.</li>
    <li>Si quieres, premiarémos a quienes venden por nosotros y a los compradores para que vuelvan a comprarnos.</li>
    <li>Si hay algo en lo que no pueda ayudarte, por favor escríbele a Daviel por WhatsApp 
    <span class="phone-event" >(918)815-6444</span> aquí el <span  class=" url-event">url.com</span></li>
    </ul>
    <p>¿Y tú, me estabas esperando?</p>
    `
    await this.addMessage({
      sender: 'IA',
      message,
      chatId: ""
    })
    let phoneRef = this.elRef.nativeElement.querySelector('.phone-event')
    phoneRef.addEventListener('click', this.phoneMethod.bind(this))
    phoneRef.style.color = '#25638F'
    let urlRef = this.elRef.nativeElement.querySelector('.url-event')
    urlRef.addEventListener('click', this.urlMethod.bind(this))
    urlRef.style.color = '#25638F'
  }

  phoneMethod() {
    this.data.phone()
  }

  urlMethod() {
    this.data.url()
  }

  /**
   * Envia la respuesta del usuario por input
   *
   */
  async sendMessage() {
    const message: string = this.chatFormGroup.get('input').value
    const isEmailValid = message && isEmail(message)

    if (isEmailValid) {
      const newMessage = { sender: 'user', message, chatId: '' }
      await this.addMessage(newMessage);

      let userRegistered = null;
      try {
        userRegistered = await this.authService.checkUser(message)
      } catch (error) {
        console.error(error);
      }

      if (userRegistered) {
        await this.addMessage({
          sender: 'IA',
          message: "Este correo está registrado. Por favor, intente otro",
          chatId: ""
        })
        return
      }

      if (!userRegistered) {
        this.hideInput = true
        this.showEditButton = true
        await this.registerUser(message);
        await this.addMessage({
          sender: 'IA',
          message: `
          <p>Gracias por reservarme.</p>

          <p>
          Cuando puedas por favor escríbele a Daviel por WhatsApp 
          <span  class="phone-event">(918)815-6444</span> 
          aquí el <span  class="url-event">url.com</span>
          para que le dejes saber como entrenarme para Ti y empezar a formar parte de tu equipo.
          </p>
          `,
          chatId: ""
        })
        let phoneRef = this.elRef.nativeElement.querySelector('.phone-event')
        phoneRef.addEventListener('click', this.phoneMethod.bind(this))
        phoneRef.style.color = '#25638F'
        let urlRef = this.elRef.nativeElement.querySelector('.url-event')
        urlRef.addEventListener('click', this.urlMethod.bind(this))
        urlRef.style.color = '#25638F'
      }
    }
  }

  async registerUser(email: string) {
    try {
      const input = { email, password: "123" }
      await this.authService.signup(input, "none")
    } catch (error) {
      console.error(error)
    }
  }

  async sendEditMessage() {
    const message: string = this.chatFormGroup.get('input').value
    const isEmailValid = message && isEmail(message)

    if (isEmailValid) {
      const index = this.chat.messages.findIndex(message => message.sender === 'user')
      this.chat.messages[index].message = message
      this.isEdit = false
      this.hideInput = true
      this.showEditButton = true
      await this.registerUser(message);
    }
  }

  /**
   * Añade el mensaje al listado de mensajes
   *
   * @param message
   */
  async addMessage(message: Message) {
    this.chat.messages.push(message)

    // Forzar la detección de cambios para actualizar la vista
    this.cdr.detectChanges();

    this.scrollToBottom()
  }

  editMessage() {
    this.hideInput = false
    this.isEdit = true
    this.showEditButton = false
  }

  scrollToBottom(): void {
    try {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
      container.scrollIntoView({ behavior: 'smooth', alignToTop: false });
    } catch (error) {
      console.error('Error al hacer scroll:', error);
    }
  }

  callLogin() {
    this.data.login();
  }

  close() {
    this._bottomSheetRef.dismiss();
  }
}
