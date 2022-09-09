import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { AirtableService } from 'src/app/core/services/airtable.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-airtable-field-connection',
  templateUrl: './airtable-field-connection.component.html',
  styleUrls: ['./airtable-field-connection.component.scss']
})
export class AirtableFieldConnectionComponent implements OnInit {
  selectedTable: any;
  allTables: Array<Record<string, any>> = [];
  selectedField: {
    id: string;
    name: string;
  }

  footerConfig: FooterOptions = {
    bgColor: '#2874AD',
    color: '#fff',
    enabledStyles: {
      height: '30px',
      fontSize: '17px',
      padding: '0px'
    },
    disabledStyles: {
      height: '30px',
      fontSize: '17px',
      padding: '0px'
    }
  };

  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'selectedTable',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [],
          changeCallbackFunction: (change, params) => {
            this.selectedTable = change;
            const selectedTable = this.allTables.find(tableObject => tableObject.name === this.selectedTable);
            this.formSteps[0].fieldsList[0].collapsed = true;
            this.formSteps[0].fieldsList[1].collapsed = false;

            this.formSteps[0].fieldsList[1].selectionOptions = selectedTable.fields.map(field => field.name);
            this.formSteps[0].fieldsList[1].styles.containerStyles.display = 'flex';
          },
          label: 'Selecciona la tabla donde se guarda',
          inputType: 'radio',
          styles: {
            labelStyles: {
              fontFamily: 'RobotoMedium',
              fontWeight: '400',
              color: '#7B7B7B',
              fontSize: '17px',
              paddingBottom: '30px',
              paddingTop: '34px',
              margin: '0px'
            },
            fieldStyles: {
              paddingLeft: '0px',
              marginBottom: '12px'
            },
            containerStyles: {
              display: 'none'
            }
          },
        },
        {
          name: 'selectedField',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required) 
          },
          selectionOptions: [],
          changeCallbackFunction: (change, params) => {
            this.formSteps[0].fieldsList[1].collapsed = true;
          },
          label: 'Selecciona la columna (field, campo) donde se guarda:',
          inputType: 'radio',
          styles: {
            labelStyles: {
              fontFamily: 'RobotoMedium',
              fontWeight: '400',
              color: '#7B7B7B',
              fontSize: '17px',
              paddingBottom: '30px',
              paddingTop: '56px',
              margin: '0px'
            },
            fieldStyles: {
              paddingLeft: '0px',
              marginBottom: '12px'
            },
            containerStyles: {
              display: 'none',
              paddingBottom: '2rem'
            }
          },
        },
      ],
      pageHeader: {
        text: 'Sobre donde guardar la respuesta:',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: '900',
          color: 'black',
          fontSize: '22px',
          paddingBottom: '0px',
          paddingTop: '79px'
        },
      },
      hideHeader: true,
      footerConfig: this.footerConfig,
      stepButtonInvalidText: 'SELECCIONA LA TABLA Y LA COLUMNA',
      stepButtonValidText: 'CONECTA LA RESPUESTA A LA TABLAID EN EL FIELD ID'
    }
  ]

  constructor(
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private airtableService: AirtableService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async routeParams => {
      const { databaseName } = routeParams;

      const myUser = await this.authService.me();
  
      const database = await this.airtableService.getAirtableDatabaseStructure(myUser.phone, databaseName);
      
      if(database) {
        const parsedDatabase = JSON.parse(database.structure);

        this.formSteps[0].fieldsList[0].selectionOptions = Object.keys(parsedDatabase).map(table => {

          this.allTables.push(parsedDatabase[table]);
          
          return parsedDatabase[table].name;
        });
        this.formSteps[0].fieldsList[0].styles.containerStyles = {display: 'flex'};
      }

    });
  }

}
