import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationExtras, Route, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { urltoFile } from 'src/app/core/helpers/files.helpers';
import { completeImageURL, isVideo } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SlideInput } from 'src/app/core/models/post';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { QuotationItem } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { OptionsDialogComponent, OptionsDialogTemplate } from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { environment } from 'src/environments/environment';


type btnFilterName = 'exhibits' | 'noExhibits' | 'hidden' | 'byCommission' | 'lowStock'
type consumerType = 'supplier' | 'default'

@Component({
  selector: 'app-provider-items',
  templateUrl: './provider-items.component.html',
  styleUrls: ['./provider-items.component.scss'],
})
export class ProviderItemsComponent implements OnInit {
  drawerOpened: boolean = false;
  assetsFolder: string = environment.assetsUrl;
  presentationOpened: boolean = false;

  //Searchbar variables
  searchOpened: boolean = false;
  itemSearchbar: FormControl = new FormControl('');
  searchFilters: Array<{
    label: string;
    key: string;
  }> = [
      {
        label: 'Los necesitan pero no tienen tus precios (78)',
        key: 'neededButNotYours',
      },
      {
        label: 'Articulos que estoy exhibiendo',
        key: 'providedByMe',
      },
    ];
  isSwitchActive = false;

  isSupplier = true;
  hiddenDashboard = false;
  itemsFiltering = []

  /**Button for filtering */
  btnConsumerState = {
    supplier: false,
    default: false
  }

  btnFilterState = {
    exhibits: false,
    noExhibits: false,
    hidden: false,
    byCommission: false,
    lowStock: false,
  }

  /** Total items */
  totalHidden: number = 0
  totalAllItems: number = 0
  totalItemsByCommission: number = 0
  totalItemsByLowStock: number = 0

  //Pagination-specific variables
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
      page: 1,
      pageSize: 15,
      status: 'complete',
    };
  reachTheEndOfPagination: boolean = false;

  //Items variables
  totalItemsHidden: number = 0
  itemsISell: Array<Item> = [];
  itemsIDontSell: Array<Item> = [];
  renderItemsPromise: Promise<{ listItems: Item[] }>;
  unitsForItemsThatYouDontSell: Record<string, number> = {};

  //userSpecific variables
  isTheUserAMerchant: boolean = null;

  //Subscriptions
  queryParamsSubscription: Subscription;

  //magicLink-specific variables
  encodedJSONData: string;
  fetchedItemsFromMagicLink: Array<Item> = [];

  //Tutorial-specific variables
  searchTutorialsOpened: boolean = false;
  itemsTutorialOpened: boolean = false;
  itemsTutorialCardsOpened: Record<string, boolean> = {
    price: true,
    stock: true,
  };
  searchTutorialCardsOpened: Record<string, boolean> = {
    searchbar: true,
    sold: true,
    orders: true,
  };
  numberOfItemsSold: number = 0;

  isUserLogged = false
  isUserVerified = false

  plataformFeeTypeActual = 'platform_fee_user'

  private keyPresentationState = 'providersPresentationClosed'
  private keyTutorialState = 'tutorialClosed'
  private merchantData: Merchant | null = null;
  private saleflowData: SaleFlow | null = null;

  constructor(
    private headerService: HeaderService,
    private itemsService: ItemsService,
    private appService: AppService,
    private saleflowService: SaleFlowService,
    public merchantsService: MerchantsService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private orderService: OrderService
  ) { }

  async ngOnInit() {
    const existToken = localStorage.getItem('session-token')
    if (existToken) {
      if (!this.headerService.user) {
        this.handleUserSubscription()
      } else {
        this.isUserLogged = true
        await this.executeInitProcesses();
      }
    }

    if (!existToken) {
      await this.executeInitProcesses();
      await this.fetchItemsForNotSell(true, false);

    }

    this.initInputValueChanges()
  }

  /**
   * Inicializa la detección de cambios en el input
   */
  initInputValueChanges() {
    this.itemSearchbar.valueChanges.subscribe(async () => {
      if (this.isUserLogged) {
        await this.fetchItemsForSell();
      }
      await this.fetchItemsForNotSell(true, false);
    });
  }

  /**
   * Maneja la suscripción del usuario.
   *
   * Se encarga de suscribirse a los eventos de la aplicación relacionados
   * con la autenticación del usuario. Cuando se recibe un evento de autenticación
   * se ejecutan una serie de tareas para configurar y procesar la sesión del usuario.
   */
  handleUserSubscription() {
    const subscription = this.appService.events
      .pipe(filter((e) => e.type === 'auth'))
      .subscribe(async ({ data }) => {
        this.getDefaultMerchantAndSaleflows(data.user)
          .then(async ({ merchantDefault, saleflowDefault }) => {
            this.merchantData = merchantDefault;
            this.saleflowData = saleflowDefault
            this.isUserLogged = true

            this.isSupplier = this.verifyIfIsSupplier(this.merchantData);
            this.getStatusSwitch();
            await this.executeInitProcesses();
            setTimeout(async () => {
              if (this.merchantData?._id) {
                await this.fetchItemsForSell();
                await this.fetchQuantifyFilters();
              }
            }, 1000);
          })
        subscription.unsubscribe();
      });
  }

  /**
   * Inicializa el proceso para obtener los datos a mostrar en pantalla, como los items
   * del merchant, la cantidad de items vendidos, el estado para mostrar el modal del
   * tutorial
   */
  async executeInitProcesses() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ jsondata }) => {
        this.encodedJSONData = jsondata;
        if (this.encodedJSONData) {
          this.parseMagicLinkData();
        }

        this.checkIfPresentationWasClosedBefore();
        this.checkIfTutorialWasOpen()

        await this.getNumberOfItemsSold();
      }
    );
  }


  /**
   * Obtiene el total de items segun el tipo de filtro.
   * Entre los tipos de filtros estan: items ocutlos, todos, por comision
   * o por bajo precio
   */
  async fetchQuantifyFilters() {
    try {
      const merchantTotal = await this.itemsService.itemsQuantityOfFilters(this.merchantData._id)
      if (merchantTotal) {
        this.totalHidden = merchantTotal.hidden
        this.totalAllItems = merchantTotal.all
        this.totalItemsByCommission = merchantTotal.commissionable
        this.totalItemsByLowStock = merchantTotal.lowStock
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Obtiene el estado del switch consultando el merchant. Si el merchant es valido,
   * obtendrá los datos del saleflpw. Y si este ultimo es válido, recibirá el estado
   * del switch si está activo o inactivo.
   *
   * Si no hay merchant, no hace nada
   */
  getStatusSwitch() {
    const isValidMerchant = this.merchantsService.verifyValidMerchant()
    if (!isValidMerchant) {
      this.isSwitchActive = false
    } else {
      const status = !this.saleflowData?.status || this.saleflowData?.status === 'open'
      this.isSwitchActive = status
      this.isUserVerified = true
    }
  }

  onUpdate() {
    this.plataformFeeTypeActual = this.plataformFeeTypeActual === 'platform_fee_user'
      ? 'platform_fee_merchant'
      : 'platform_fee_user'
    const input = {
      input: {
        platformFeeType: this.plataformFeeTypeActual
      }
    }
    this.merchantsService
      .updateMerchantFuncionality(input, this.merchantData._id)
      .then(() => {
        console.log("Los datos han sido actualizado. Type actual: ", this.plataformFeeTypeActual)

      })
  }

  /**
   * Cambia el estado del consumidor de supplier o default
   */
  onChangeConsumerState(selected: consumerType) {
    this.btnConsumerState[selected] = !this.btnConsumerState[selected]
    this.filteringItemsBySearchbar(this.itemSearchbar.value)
  }

  /**
   * Verifica si el usuario es de tipo proveedor o no.
   *
   * @params merchant - datos del merchant
   * @returns {Boolean} un boleano que indica si es supplier o no
   */
  verifyIfIsSupplier(merchant: Merchant): boolean {
    return merchant.roles[0]?.code !== 'STORE'
  }

  /**
   * Función para realizar paginación infinita en una página de dashboard.
   * Se encarga de cargar más elementos cuando el usuario llega al final de la página.
   */
  async infinitePagination() {
    const targetClass = '.dashboard-page';
    const page = document.querySelector(targetClass);
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    // Calcula la diferencia entre la posición vertical y la altura total de la página
    const difference = Math.abs(verticalScroll - pageScrollHeight);

    if (verticalScroll >= pageScrollHeight || difference <= 50) {
      if (
        this.paginationState.status === 'complete' &&
        !this.reachTheEndOfPagination
      ) {
        if (this.isUserLogged) {
          await this.fetchItemsForSell(false, true);
        } else {
          await this.fetchItemsForNotSell(false, true);
        }
      }
    }
  }

  openTutorials = () => {
    this.presentationOpened = false;
    localStorage.setItem(this.keyTutorialState, 'true');

    if (
      this.headerService.user &&
      this.merchantsService.merchantData &&
      this.numberOfItemsSold > 0
    ) {
      this.searchTutorialsOpened = true;
    }
  };

  /**
 * Revisa si el tutorial fue abierta.y lo abre si no lo estaba
 */
  checkIfTutorialWasOpen = () => {
    const tutorialState = localStorage.getItem(this.keyTutorialState);
    if (!tutorialState) {
      this.showTutorialModal();
    }
  };

  /**
   * Revisa si la presentación fue abierta.
   */
  checkIfPresentationWasClosedBefore = () => {
    const tutorialState = localStorage.getItem(this.keyPresentationState);
    const tutorialStateParsed = tutorialState ? JSON.parse(tutorialState) : false;

    if (!tutorialStateParsed && !this.headerService.user) {
      this.presentationOpened = true;
    }
  };

  /**
   * Verifica si el merchant ha tenido una orden y muestra el tutorial
   */
  showTutorialModal() {
    this.merchantsService.merchantDefault().then(merchant => {
      const pagination: PaginationInput = {
        findBy: {
          merchant: merchant?._id,
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: 1,
        }
      }
      this.orderService.orderPaginate(pagination)
        .then(orders => {
          if (orders?.orderPaginate.length) {
            localStorage.setItem(this.keyTutorialState, 'true')
            this.searchTutorialsOpened = true
          }
        })
    })
  }

  /**
   * Cierra el tutorial de busqueda. Si las cartas han sido cerradas,
   * almacena el estado en el localstorage
   *
   * @param cardName nombre de la carta que se cerró
   */
  closeSearchTutorial = (cardName: string) => {
    this.searchTutorialCardsOpened[cardName] = false;

    if (
      !this.searchTutorialCardsOpened['sold'] &&
      !this.searchTutorialCardsOpened['orders']
    ) {
      this.searchTutorialsOpened = false;
      localStorage.setItem(this.keyTutorialState, 'true')
    }
  };

  closeItemsTutorial = (cardName: string) => {
    this.itemsTutorialCardsOpened[cardName] = false;

    if (!this.itemsTutorialCardsOpened['price']) {
      this.itemsTutorialOpened = false;
    }
  };


  toggleStoreVisibility() {
    if (this.isUserVerified) {
      const input = {
        status: this.isSwitchActive ? "closed" : "open"
      }

      this.saleflowService.updateSaleflow(input, this.saleflowData._id)
        .then(() => this.isSwitchActive = !this.isSwitchActive)
        .catch(error => {
          console.error(error);
          const message = 'Ocurrió un error al intentar cambiar la visibilidad de tu tienda, intenta más tarde'
          this.headerService.showErrorToast(message);
        })
    }

    if (!this.isUserVerified) {
      const message = 'Te falto datos para completar en tu perfil para activar esta función'
      this.headerService.showErrorToast(message);
    }

    if (!this.isUserLogged) {
      const message = 'Debes iniciar sesión para activar esta función'
      this.headerService.showErrorToast(message);
    }
  }

  /**
 * Obtiene el numero de items vendidos
 */
  async getNumberOfItemsSold() {
    if (this.isTheUserAMerchant) {
      const sold = await this.itemsService.itemsQuantitySoldTotal({
        findBy: {
          merchant: this.merchantsService.merchantData._id,
        },
        options: {
          limit: -1,
        },
      });
      this.numberOfItemsSold = sold?.total;
    }
  }

  /**
   * Obtiene todos los items para vender
   */
  async fetchItemsForSell(
    restartPagination = false,
    triggeredFromScroll = false,
  ) {
    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.reachTheEndOfPagination = false;
      this.paginationState.page = 1;
      this.itemsISell = [];
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      findBy: {
        merchant: this.merchantData._id,
        _id: {
          __in: this.saleflowData.items.map((item) => item.item._id)
        }
      },
      options: {
        limit: this.paginationState.pageSize,
        page: this.paginationState.page - 1,
        sortBy: 'createdAt:desc',
      },
    };

    await this.processPaginationItems(pagination, triggeredFromScroll, this.itemsISell)
  }

  /**
   * Obtiene todos los items que no se venden
   */
  async fetchItemsForNotSell(
    restartPagination = false,
    triggeredFromScroll = false,
  ) {
    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.reachTheEndOfPagination = false;
      this.paginationState.page = 1;
      this.itemsIDontSell = [];
    } else {
      this.paginationState.page++;
    }
    const pagination: PaginationInput = {
      findBy: {
        type: 'supplier',
        parentItem: null,
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    await this.processPaginationItems(pagination, triggeredFromScroll, this.itemsIDontSell)
  }

  createItemBasedOnExistingSupplierItems(item: Item) {
    this.itemsService.temporalItemInput = {
      name: item.name,
      layout: item.layout,
      description: item.description,
    };
    this.itemsService.temporalItem = item;

    if (!this.headerService.flowRouteForEachPage)
      this.headerService.flowRouteForEachPage = {};

    this.headerService.flowRouteForEachPage['provider-items'] = this.router.url;

    return this.router.navigate(['/ecommerce/inventory-creator'], {
      queryParams: {
        existingItem: true,
      },
    });
  }

  async changeAmount(
    item: Item,
    type: 'add' | 'subtract' | 'infinite',
    itemIndex: number,
    providedByMe: boolean
  ) {
    try {
      let newAmount: number;
      if (type === 'add' && providedByMe) {
        newAmount = item.stock >= 0 ? item.stock + 1 : 1;
        item.useStock = true;
      } else if (type === 'subtract' && providedByMe) {
        newAmount = item.stock >= 1 ? item.stock - 1 : 0;
        item.useStock = true;
      }

      if (type === 'add' && !providedByMe) {
        newAmount = !this.unitsForItemsThatYouDontSell[item._id]
          ? 1
          : this.unitsForItemsThatYouDontSell[item._id] + 1;
        item.useStock = true;
      } else if (type === 'subtract' && !providedByMe) {
        newAmount =
          this.unitsForItemsThatYouDontSell[item._id] >= 1
            ? this.unitsForItemsThatYouDontSell[item._id] - 1
            : 0;
        item.useStock = true;
      }

      if (type === 'infinite' && providedByMe) {
        this.itemsService.updateItem(
          {
            useStock: false,
          },
          item._id
        );
        this.itemsISell[itemIndex].useStock = false;
        return;
      } else if (type === 'infinite' && !providedByMe) {
        this.itemsIDontSell[itemIndex].useStock = false;
        return;
      }

      if (providedByMe) {
        this.itemsService.updateItem(
          {
            stock: newAmount,
            useStock: true,
          },
          item._id
        );

        this.itemsISell[itemIndex].stock = newAmount;
        this.itemsISell[itemIndex].useStock = true;
      } else {
        this.itemsIDontSell[itemIndex].stock = newAmount;
        this.itemsIDontSell[itemIndex].useStock = true;
        this.unitsForItemsThatYouDontSell[item._id] = newAmount;
      }
    } catch (error) {
      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  async showSearch() {
    this.searchOpened = true;
    setTimeout(() => {
      (document
        .querySelector('#search-from-results-view') as HTMLInputElement)
        ?.focus();
    }, 100);
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }

  async parseMagicLinkData() {
    if (this.isTheUserAMerchant === null) {
      this.isTheUserAMerchant =
        await this.headerService.checkIfUserIsAMerchantAndFetchItsData();
    }

    if (this.encodedJSONData) {
      let parsedData = JSON.parse(decodeURIComponent(this.encodedJSONData));

      if (parsedData.createdItem) {
        await this.authenticateItemFromMagicLinkData(parsedData);
      }

      if (parsedData.updateItem) {
        await this.updateSingleItemFromMagicLinkData(parsedData);
      }

      if (parsedData.itemsToUpdate) {
        await this.updateItemsFromMagicLinkData(parsedData);
      }

      if (parsedData.quotationItems) {
        await this.authenticateSupplierQuotationItems(parsedData);
      }

      return;
    }
  }

  //MAGIC LINK SPECIFIC METHODS
  authenticateItemFromMagicLinkData = async (
    parsedData: Record<string, any>
  ) => {
    try {
      lockUI();
      const createdItemId = parsedData.createdItem;
      const saleflowDefault = await this.saleflowService.saleflowDefault(
        this.merchantsService.merchantData._id
      );

      await this.itemsService.authItem(
        this.merchantsService.merchantData._id,
        createdItemId
      );

      await this.saleflowService.addItemToSaleFlow(
        {
          item: createdItemId,
        },
        saleflowDefault._id
      );

      unlockUI();

      window.location.href = environment.uri + '/ecommerce/provider-items';
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  updateSingleItemFromMagicLinkData = async (
    parsedData: Record<string, any>
  ) => {
    try {
      lockUI();
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      const { _id: itemToUpdate, ...rest } = parsedData.updateItem;

      await this.itemsService.updateItem(rest, itemToUpdate);

      unlockUI();
      window.location.href = environment.uri + '/ecommerce/provider-items';
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  updateItemsFromMagicLinkData = async (parsedData: Record<string, any>) => {
    try {
      lockUI();
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      await Promise.all(
        Object.keys(parsedData.itemsToUpdate).map((itemId) =>
          this.itemsService.updateItem(parsedData.itemsToUpdate[itemId], itemId)
        )
      );

      if (!parsedData.quotationItems) {
        unlockUI();
        window.location.href = environment.uri + '/ecommerce/provider-items';
      }
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  authenticateSupplierQuotationItems = async (
    parsedData: Record<string, any>
  ) => {
    try {
      lockUI();
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      const saleflow = await this.saleflowService.saleflowDefault(
        this.merchantsService.merchantData?._id
      );

      const quotationItemsIDs = parsedData.quotationItems.split('-');

      this.headerService.saleflow = saleflow;
      this.headerService.storeSaleflow(saleflow);

      const supplierSpecificItemsInput: PaginationInput = {
        findBy: {
          _id: {
            __in: ([] = quotationItemsIDs),
          },
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      //Fetches supplier specfic items, meaning they already are on the saleflow
      let quotationItems: Array<Item> = [];

      quotationItems = (
        await this.itemsService.listItems(supplierSpecificItemsInput)
      )?.listItems;

      if (quotationItems?.length) {
        this.fetchedItemsFromMagicLink = quotationItems;

        if (!this.fetchedItemsFromMagicLink[0].merchant) {
          await Promise.all(
            this.fetchedItemsFromMagicLink.map((item) =>
              this.itemsService.authItem(
                this.merchantsService.merchantData._id,
                item._id
              )
            )
          );

          await Promise.all(
            this.fetchedItemsFromMagicLink.map((item) =>
              this.saleflowService.addItemToSaleFlow(
                {
                  item: item._id,
                },
                this.headerService.saleflow._id
              )
            )
          );
        }
      }

      unlockUI();
      window.location.href = environment.uri + '/ecommerce/provider-items';
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  async addPrice(item: Item) {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label:
            '¿Cuál es el precio de venta de' +
            (item.name
              ? ' ' +
              item.name +
              (item.description ? '(' + item.description + ')?' : '')
              : 'l articulo?'),
          name: 'price',
          type: 'currency',
          validators: [Validators.pattern(/[\S]/), Validators.min(0)],
        },
      ],
      buttonsTexts: {
        accept: 'Exhibirlo a los Miembros',
        cancel: 'Cancelar',
      },
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result.controls.price.valid) {
        const price = Number(result.value['price']);

        if (!this.headerService.user) {
          lockUI();
          const itemInput = await this.getItemInputForItemsThatYouDontSell(
            price,
            item
          );

          unlockUI();

          this.openMagicLinkDialog(itemInput);
        } else {
          lockUI();

          const itemInput = await this.getItemInputForItemsThatYouDontSell(
            price,
            item
          );

          const saleflowDefault = await this.saleflowService.saleflowDefault(
            this.merchantsService.merchantData._id
          );

          const createdItem = (await this.itemsService.createItem(itemInput))
            ?.createItem;

          await this.saleflowService.addItemToSaleFlow(
            {
              item: createdItem._id,
            },
            saleflowDefault._id
          );

          this.itemsISell.unshift(createdItem);

          const itemIndex = this.itemsIDontSell.findIndex(
            (itemInList) => item._id === itemInList._id
          );

          this.itemsIDontSell.splice(itemIndex, 1);

          this.snackbar.open('Ahora estás exhibiendo el producto!', '', {
            duration: 5000,
          });

          unlockUI();
        }
      }
    });
  }

  determineIfItemNeedsToBeUpdatedOrCreated = async (
    merchantDefault: Merchant,
    parentItemId: string
  ): Promise<{
    operation: 'UPDATE' | 'CREATE';
    itemId?: string;
  }> => {
    lockUI();

    const supplierSpecificItemsInput: PaginationInput = {
      findBy: {
        parentItem: {
          $in: ([] = [parentItemId]),
        },
        merchant: merchantDefault?._id,
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
        page: 1,
      },
    };

    //Fetches supplier specfic items, meaning they already are on the saleflow
    let itemsAlreadyProviderByTheMerchant: Array<QuotationItem> = [];

    itemsAlreadyProviderByTheMerchant = (
      await this.itemsService.listItems(supplierSpecificItemsInput)
    )?.listItems;

    unlockUI();

    return {
      operation:
        itemsAlreadyProviderByTheMerchant.length > 0 ? 'UPDATE' : 'CREATE',
      itemId:
        itemsAlreadyProviderByTheMerchant.length > 0
          ? itemsAlreadyProviderByTheMerchant[0]._id
          : null,
    };
  };

  async editPrice(item: Item, itemIndex: number) {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label:
            '¿Cuál es el precio de venta de' +
            (item.name ? ' ' + item.name : 'l articulo?'),
          name: 'price',
          type: 'currency',
          validators: [Validators.pattern(/[\S]/), Validators.min(0)],
        },
      ],
      buttonsTexts: {
        accept: 'Actualizar precio',
        cancel: 'Cancelar',
      },
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result.controls.price.valid) {
        lockUI();

        try {
          const price = Number(result.value['price']);

          await this.itemsService.updateItem(
            {
              pricing: price,
            },
            item._id
          );

          this.itemsISell[itemIndex].pricing = price;

          unlockUI();
        } catch (error) {
          unlockUI();
          this.headerService.showErrorToast();
          console.error(error);
        }
      }
    });
  }

  getItemInputForItemsThatYouDontSell = async (
    price: number,
    item: Item
  ): Promise<ItemInput> => {
    const itemInput: ItemInput = {
      name: item.name,
      layout: item.layout,
      description: item.description,
      pricing: price,
      stock:
        this.unitsForItemsThatYouDontSell[item._id] >= 0
          ? this.unitsForItemsThatYouDontSell[item._id]
          : 0,
      notificationStock: true,
      notificationStockLimit: item.notificationStockLimit,
      useStock: item.useStock,
      type: "supplier",
    };

    if (this.merchantsService.merchantData) {
      itemInput.merchant = this.merchantsService.merchantData._id;
    }

    const slides: any[] = item.images
      .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
      .map(({ index, ...image }) => {
        return {
          url: completeImageURL(image.value),
          index,
          type: 'poster',
          text: '',
          _id: image._id,
        };
      });

    let itemSlideIndex = 0;

    for await (const slide of slides) {
      if (slide.url && !slide.media) {
        slides[itemSlideIndex].media = await urltoFile(
          slide.url,
          'file' + itemSlideIndex
        );
      }

      itemSlideIndex++;
    }

    let images: ItemImageInput[] = slides.map(
      (slide: SlideInput, index: number) => {
        return {
          file: slide.media,
          index,
          active: true,
        };
      }
    );

    itemInput.images = images;

    itemInput.parentItem = item._id;

    return itemInput;
  };

  async openMagicLinkDialog(itemInput: ItemInput) {
    let fieldsToCreateInEmailDialog: FormData = {
      title: {
        text: 'Correo Electrónico para guardarlo:',
      },
      buttonsTexts: {
        accept: 'Recibir el enlace con acceso',
        cancel: 'Cancelar',
      },
      containerStyles: {
        padding: '35px 23px 38px 18px',
      },
      hideBottomButtons: true,
      fields: [
        {
          name: 'magicLinkEmailOrPhone',
          type: 'email',
          placeholder: 'Escribe el correo electrónico..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
          styles: {
            gap: '0px',
          },
          bottomTexts: [
            {
              text: 'Este correo también sirve para accesar al Club y aprovechar todas las herramientas que se están creando.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                marginBottom: '28px',
                marginTop: '36px',
              },
            },
            {
              text: 'La promesa del Club es desarrollar funcionalidades que necesites.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                margin: '0px',
                padding: '0px',
              },
            },
          ],
          submitButton: {
            text: '>',
            styles: {
              borderRadius: '8px',
              background: '#87CD9B',
              padding: '6px 15px',
              color: '#181D17',
              textAlign: 'center',
              fontFamily: 'InterBold',
              fontSize: '17px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              position: 'absolute',
              right: '1px',
              top: '8px',
            },
          },
        },
      ],
    };

    const emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
      panelClass: 'login'
    });

    emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        const emailOrPhone = result?.value['magicLinkEmailOrPhone'];
        const myUser = await this.authService.checkUser(emailOrPhone);
        const myMerchant = !myUser
          ? null
          : await this.merchantsService.merchantDefault(myUser._id);

        let optionsDialogTemplate: OptionsDialogTemplate = null;

        if (!myUser) {
          optionsDialogTemplate = {
            title:
              'Notamos que es la primera vez que intentas acceder con este correo, prefieres:',
            options: [
              {
                value:
                  'Empezar mi Membresía al Club con este correo electrónico',
                callback: async () => {
                  let fieldsToCreateInMerchantRegistrationDialog: FormData = {
                    buttonsTexts: {
                      accept: 'Guardar mis datos comerciales',
                      cancel: 'Omitir',
                    },
                    containerStyles: {
                      padding: '39.74px 17px 47px 24px',
                    },
                    fields: [
                      {
                        label: 'Nombre Comercial que verán tus compradores:',
                        name: 'merchantName',
                        type: 'text',
                        placeholder: 'Escribe el nombre comercial',
                        validators: [Validators.pattern(/[\S]/)],
                        inputStyles: {
                          padding: '11px 1px',
                        },
                      },
                      {
                        label:
                          'WhatsApp que recibirá las facturas que te mandarán los compradores:',
                        name: 'merchantPhone',
                        type: 'phone',
                        placeholder: 'Escribe el nombre comercial',
                        validators: [Validators.pattern(/[\S]/)],
                        inputStyles: {
                          padding: '11px 1px',
                        },
                      },
                    ],
                  };

                  const merchantRegistrationDialogRef = this.dialog.open(
                    FormComponent,
                    {
                      data: fieldsToCreateInMerchantRegistrationDialog,
                      disableClose: true,
                      panelClass: ['login', 'merchant-registration'],
                    }
                  );

                  merchantRegistrationDialogRef
                    .afterClosed()
                    .subscribe(async (result: FormGroup) => {
                      const merchantInput: Record<string, any> = {};

                      if (result?.controls?.merchantName.valid)
                        merchantInput.name = result?.value['merchantName'];

                      if (result?.controls?.merchantPhone.valid)
                        merchantInput.phone = result?.value['merchantPhone'];
                      lockUI();

                      try {
                        let toBeDone: {
                          operation: 'UPDATE' | 'CREATE';
                          itemId?: string;
                        } = {
                          operation: 'CREATE',
                        };

                        if (myMerchant) {
                          toBeDone =
                            await this.determineIfItemNeedsToBeUpdatedOrCreated(
                              myMerchant,
                              itemInput.parentItem
                            );
                        }

                        if (toBeDone.operation === 'CREATE') {
                          const createdItem = (
                            await this.itemsService.createPreItem(itemInput)
                          )?.createPreItem;

                          let redirectionRoute = '/ecommerce/provider-items';

                          await this.authService.generateMagicLink(
                            emailOrPhone,
                            redirectionRoute,
                            null,
                            'MerchantAccess',
                            {
                              jsondata: JSON.stringify({
                                createdItem: createdItem._id,
                                merchantInput,
                              }),
                            },
                            []
                          );
                        } else if (toBeDone.operation === 'UPDATE') {
                          let redirectionRoute = '/ecommerce/provider-items';

                          await this.authService.generateMagicLink(
                            emailOrPhone,
                            redirectionRoute,
                            null,
                            'MerchantAccess',
                            {
                              jsondata: JSON.stringify({
                                updateItem: {
                                  _id: toBeDone.itemId,
                                  stock: itemInput.stock,
                                  pricing: itemInput.pricing,
                                },
                              }),
                            },
                            []
                          );
                        }

                        unlockUI();

                        this.router.navigate(['ecommerce/magic-link-sent']);
                      } catch (error) {
                        unlockUI();
                        console.error(error);
                        this.headerService.showErrorToast();
                      }
                    });
                },
              },
              {
                value: 'Intentar con otro correo electrónico.',
                callback: async () => {
                  return this.openMagicLinkDialog(itemInput);
                },
              },
              {
                value:
                  'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
                callback: async () => {
                  this.reportEmailIssue(emailOrPhone);
                },
              },
            ],
          };
        } else {
          optionsDialogTemplate = {
            title:
              'Bienvenido de vuelta ' +
              (myMerchant
                ? myMerchant.name
                : myUser.name || myUser.email || myUser.phone) +
              ', prefieres:',
            options: [
              {
                value: 'Prefiero acceder con la clave',
                callback: () => {
                  addPassword(emailOrPhone);
                },
              },
              {
                value: 'Prefiero recibir el enlace de acceso en mi correo',
                callback: async () => {
                  if (result?.controls?.magicLinkEmailOrPhone.valid) {
                    let emailOrPhone = result?.value['magicLinkEmailOrPhone'];

                    let toBeDone: {
                      operation: 'UPDATE' | 'CREATE';
                      itemId?: string;
                    } = {
                      operation: 'CREATE',
                    };

                    if (myMerchant) {
                      toBeDone =
                        await this.determineIfItemNeedsToBeUpdatedOrCreated(
                          myMerchant,
                          itemInput.parentItem
                        );
                    }

                    lockUI();

                    if (toBeDone.operation === 'CREATE') {
                      const createdItem = (
                        await this.itemsService.createPreItem(itemInput)
                      )?.createPreItem;

                      let redirectionRoute = '/ecommerce/provider-items';

                      await this.authService.generateMagicLink(
                        emailOrPhone,
                        redirectionRoute,
                        null,
                        'MerchantAccess',
                        {
                          jsondata: JSON.stringify({
                            createdItem: createdItem._id,
                          }),
                        },
                        []
                      );
                    } else if (toBeDone.operation === 'UPDATE') {
                      let redirectionRoute = '/ecommerce/provider-items';

                      await this.authService.generateMagicLink(
                        emailOrPhone,
                        redirectionRoute,
                        null,
                        'MerchantAccess',
                        {
                          jsondata: JSON.stringify({
                            updateItem: {
                              _id: toBeDone.itemId,
                              stock: itemInput.stock,
                              pricing: itemInput.pricing,
                            },
                          }),
                        },
                        []
                      );
                    }

                    unlockUI();

                    this.router.navigate(['ecommerce/magic-link-sent']);
                  } else if (
                    result?.controls?.magicLinkEmailOrPhone.valid === false
                  ) {
                    unlockUI();
                    this.snackbar.open('Datos invalidos', 'Cerrar', {
                      duration: 3000,
                    });
                  }
                },
              },
              {
                value:
                  'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
                callback: async () => {
                  this.reportEmailIssue(emailOrPhone);
                },
              },
            ],
          };
        }

        this.dialog.open(OptionsDialogComponent, {
          data: optionsDialogTemplate,
          disableClose: true,
          panelClass: 'login'
        });
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        unlockUI();
        this.snackbar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });

    const addPassword = async (emailOrPhone: string) => {
      emailDialogRef.close();

      let fieldsToCreate: FormData = {
        title: {
          text: 'Clave de Acceso:',
        },
        buttonsTexts: {
          accept: 'Accesar al Club',
          cancel: 'Cancelar',
        },
        fields: [
          {
            name: 'password',
            type: 'password',
            placeholder: 'Escribe la contraseña',
            validators: [Validators.pattern(/[\S]/)],
            bottomButton: {
              text: 'Prefiero recibir el correo con el enlace de acceso',
              callback: () => {
                //Cerrar 2do dialog

                return switchToMagicLinkDialog();
              },
            },
          },
        ],
      };

      const dialog2Ref = this.dialog.open(FormComponent, {
        data: fieldsToCreate,
        disableClose: true,
        panelClass: 'login'
      });

      dialog2Ref.afterClosed().subscribe(async (result: FormGroup) => {
        try {
          if (result?.controls?.password.valid) {
            let password = result?.value['password'];

            lockUI();

            const session = await this.authService.signin(
              emailOrPhone,
              password,
              true
            );

            if (!session) throw new Error('invalid credentials');

            const { merchantDefault, saleflowDefault } =
              await this.getDefaultMerchantAndSaleflows(session.user);

            itemInput.merchant = merchantDefault._id;

            const toBeDone =
              await this.determineIfItemNeedsToBeUpdatedOrCreated(
                merchantDefault,
                itemInput.parentItem
              );

            if (toBeDone.operation === 'CREATE') {
              const createdItem = (await this.itemsService.createItem(itemInput))
                ?.createItem;

              await this.saleflowService.addItemToSaleFlow(
                {
                  item: createdItem._id,
                },
                saleflowDefault._id
              );
            } else if (toBeDone.operation === 'UPDATE') {
              await this.itemsService.updateItem(itemInput, toBeDone.itemId)
            }


            window.location.href =
              environment.uri + '/ecommerce/provider-items';

            unlockUI();
          } else if (result?.controls?.password.valid === false) {
            unlockUI();
            this.snackbar.open('Datos invalidos', 'Cerrar', {
              duration: 3000,
            });
          }
        } catch (error) {
          unlockUI();
          console.error(error);
          this.headerService.showErrorToast();
        }
      });

      const switchToMagicLinkDialog = () => {
        dialog2Ref.close();
        return this.openMagicLinkDialog(itemInput);
      };
    };
  }

  async getDefaultMerchantAndSaleflows(user: User): Promise<{
    merchantDefault: Merchant;
    saleflowDefault: SaleFlow;
  }> {
    if (!user?._id) return null;

    let userMerchantDefault = await this.merchantsService.merchantDefault(
      user._id
    );

    if (!userMerchantDefault) {
      const merchants = await this.merchantsService.myMerchants();

      if (merchants.length === 0) {
        const { createMerchant: createdMerchant } =
          await this.merchantsService.createMerchant({
            owner: user._id,
            name:
              user.email?.split('@')[0] + '-saleflow' ||
              user.phone + '-saleflow',
            slug: user.email?.split('@')[0] || user.phone,
          });

        const { merchantSetDefault: defaultMerchant } =
          await this.merchantsService.setDefaultMerchant(createdMerchant._id);

        if (defaultMerchant) userMerchantDefault = defaultMerchant;
      }
    }

    let userSaleflowDefault = await this.saleflowService.saleflowDefault(
      userMerchantDefault._id
    );

    if (!userSaleflowDefault) {
      const { createSaleflow: createdSaleflow } =
        await this.saleflowService.createSaleflow({
          merchant: userMerchantDefault._id,
          name:
            user.email?.split('@')[0] + '-saleflow' || user.phone + '-saleflow',
          items: [],
        });

      const { saleflowSetDefault: defaultSaleflow } =
        await this.saleflowService.setDefaultSaleflow(
          userMerchantDefault._id,
          createdSaleflow._id
        );

      await this.saleflowService.createSaleFlowModule({
        saleflow: createdSaleflow._id,
        delivery: {
          deliveryLocation: true,
          isActive: true,
          moduleOrder: 0,
        } as any,
        post: {
          isActive: true,
          post: true,
          moduleOrder: 1,
        } as any,
      });

      userSaleflowDefault = defaultSaleflow;
    }

    return {
      merchantDefault: userMerchantDefault,
      saleflowDefault: userSaleflowDefault,
    };
  }

  sendWhatsappToAppOwner() {
    let message = `Hola, quiero agregar un artículo como proveedor de www.floristerias.club`;

    const whatsappLink = `https://api.whatsapp.com/send?phone=19188156444&text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappLink;
  }

  reportEmailIssue(emailOrPhone: string) {
    let message =
      `Algo anda mal porque es la primera vez que trato de acceder con este correo: ` +
      emailOrPhone;

    const whatsappLink = `https://api.whatsapp.com/send?phone=19188156444&text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappLink;
  }

  /**
   * Al hacer click en un boton, filtrará segun el boton seleccionado.
   * Además ocultará el dashboard si algun de los filtros están activos
   *
   * @param {btnFilterName} selected nombre del button del filtrado seleccionado
   */
  onChangeBtnFiltering(selected: btnFilterName) {
    this.btnFilterState[selected] = !this.btnFilterState[selected]
    this.hiddenDashboard = Object.values(this.btnFilterState).some(value => value)
    this.filteringItemsBySearchbar(this.itemSearchbar.value)
  }

  onCloseSearchbar() {
    this.searchOpened = false
  }

  /**
   * Busca en el searchbar con o sin el filtrado.
   * Ocultará o mostrará el dashboard segun si algun filtro está activo
   *
   * @param {EventTarget} event evento del input
   */
  onFilteringItemsBySearchbar(event: any) {
    this.itemSearchbar.setValue(event.target.value)
    const isSomeBtnActive = Object.values(this.btnFilterState).some(value => value)

    if (this.itemSearchbar.value) {
      this.hiddenDashboard = true
      this.filteringItemsBySearchbar(this.itemSearchbar.value)
    }

    if (!this.itemSearchbar.value && !isSomeBtnActive) {
      this.hiddenDashboard = false
    }
  }

  back() {
    return this.router.navigate(['ecommerce/club-landing'], {
      queryParams: {
        tabarIndex: 2
      }
    });
  }
  goToArticleDetail(id) {
    this.router.navigate(['ecommerce/admin-article-detail/' + id]);
  }

  /**
 * Filtrado de items por la barra de búsqueda
 * Puede obtener un filtrado más especifico dependiendo de si
 * alguno de los botones de filtrado han sido activados
 *
 * @param itemToSearch item a buscar
 */
  private filteringItemsBySearchbar(itemName: string) {
    const input: PaginationInput = {
      findBy: {
        status: this.btnFilterState.hidden ? "disabled" : "active",
        _id: {
          __in: this.saleflowData.items.map((item) => item.item._id)
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    if (this.btnFilterState.exhibits) {
      input.findBy = {
        ...input.findBy,
        merchant: {
          _id: this.merchantData._id
        }
      }
    }

    if (this.btnFilterState.noExhibits) {
      input.findBy = {
        ...input.findBy,
        parentItem: {
          $ne: null
        }
      }
    }

    if (this.btnFilterState.byCommission) {
      input.findBy = {
        ...input.findBy,
        allowCommission: true
      }
    }

    // Boton de items para filtrar los items por menos de 10 stock
    if (this.btnFilterState.lowStock) {
      input.filter = { maxStock: 10 }
    }

    if (this.btnConsumerState.supplier) {
      input.findBy = {
        ...input.findBy,
        type: 'supplier'
      }
    }

    if (this.btnConsumerState.default) {
      input.findBy = {
        ...input.findBy,
        type: 'default'
      }
    }

    if (this.btnConsumerState.supplier && this.btnConsumerState.default) {
      input.findBy = {
        ...input.findBy,
        type: ['supplier', 'default']
      }
    }

    this.saleflowService.listItems(input, false, itemName)
      .then(data => this.itemsFiltering = data.listItems)
  }

  /**
 * Procesa la paginación de los items
 *
 * @param pagination La información de paginación
 * @param triggeredFromScroll Indica si el proceso fue desencadenado por scroll
 * @param arrayItems El array en el que se guardará el resultado
 */
  private async processPaginationItems(
    pagination: PaginationInput,
    triggeredFromScroll: boolean,
    arrayItems: Item[]
  ) {
    const data = await this.saleflowService.listItems(pagination, true);
    const itemsQueryResult = data?.listItems || [];

    itemsQueryResult.forEach((item) => {
      item.stock = 0;
      item.useStock = true;
      item.images.forEach((image) => {
        if (!image.value.includes('http')) {
          image.value = 'https://' + image.value;
        }
      });
      item.images = item.images.sort(({ index: a }, { index: b }) => (a > b ? 1 : -1));
    });


    if (!itemsQueryResult.length && this.paginationState.page === 1) {
      arrayItems = []
    }

    // Condición para cuando llegas al final de la página
    if (!itemsQueryResult.length && this.paginationState.page !== 1) {
      this.paginationState.page--;
      this.reachTheEndOfPagination = true;
    }

    if (itemsQueryResult && itemsQueryResult.length > 0) {
      if (this.paginationState.page === 1) {
        arrayItems.length = 0;
        arrayItems.push(...itemsQueryResult);
      } else {
        arrayItems.push(...itemsQueryResult);
      }
    }

    this.paginationState.status = 'complete';

    if (!itemsQueryResult.length && !triggeredFromScroll) {
      arrayItems = [];
    }
  }
  updatePricing(id) {
    const navigationData: NavigationExtras = {
      replaceUrl: true,
      queryParams: {
        stockEdition: true
      }
    }
    return this.router.navigate(['ecommerce/provider-items-editor/' + id], navigationData);

  }
}
