import { Component, OnInit } from '@angular/core';
import { FormStep } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
@Component({
  selector: 'app-new-item-contact-info',
  templateUrl: './new-item-contact-info.component.html',
  styleUrls: ['./new-item-contact-info.component.scss']
})
export class NewItemContactInfoComponent implements OnInit {
  scrollableForm: boolean = false;
  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: new FormControl('', Validators.required),
          label: '¿En cuál o cuáles # de WhatsApp recibirás las notificaciones de las ordenes?',
          inputType: 'phone',
          styles: {
            containerStyles: {
              marginTop: '38px',
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginTop: '48px',
              marginBottom: '27px',
            },
            bottomLabelStyles: {
              fontWeight: 'normal',
              fontStyle: 'italic',
              fontSize: '15px',
              marginTop: '22px',
              fontFamily: 'Roboto'
            }
          },
          bottomLabel: {
            text: 'Otras maneras de recibir las notificaciones >',
            clickable: true,
            callback: () => {
              console.log('Se ha clickeado el callback');
            },
          },
        }
      ],
      headerText: "INFORMACIÓN NECESARIA",
      stepButtonValidText: "RECIBE UN LINK PARA CONFIRMAR LOS ACCESOS",
      stepButtonInvalidText: "ESCRIBE LOS CONTACTOS CON ACCESO DE ADMIN",
      avoidGoingToNextStep: true,
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
