import {
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-dynamic-component',
  templateUrl: './dynamic-component.component.html',
  styleUrls: ['./dynamic-component.component.scss'],
})
export class DynamicComponentComponent implements OnInit, OnChanges {
  @Input() component: Type<any>;
  @Input() componentInputs: Record<string, any> = {};
  @Input() componentOutputs: any;
  @Input() shouldRemoveItFromTheView: boolean = false;
  @ViewChild('embeddedComponent', { read: ViewContainerRef, static: true })
  embeddedComponentRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadBodyComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    const log: string[] = [];
    for (const propName in changes) {
      const changedProp = changes[propName];

      //Fuerza el re renderizado del componente dinamico
      if (!changedProp.isFirstChange() && propName === "shouldRemoveItFromTheView") {
        if (changedProp.currentValue) {
          this.removeBodyComponent();
          this.shouldRemoveItFromTheView = false;
          this.loadBodyComponent();
        };
      }
    }
  }

  loadBodyComponent() {
    // This is improved version from official site:
    // https://angular.io/guide/dynamic-component-loader
    // it needs no directive and is more robust

    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(this.component);

    this.embeddedComponentRef.clear();

    const newComponent =
      this.embeddedComponentRef.createComponent(componentFactory);

    Object.entries(this.componentInputs).forEach(
      ([key, value]: [string, any]) => {
        newComponent.instance[key] = value;
      }
    );

    if (this.componentOutputs)
      this.componentOutputs.forEach((output) => {
        if (newComponent.instance[output.name] && output.callback)
          newComponent.instance[output.name].subscribe(output.callback);
      });
  }

  removeBodyComponent() {
    // Find the component
    // Remove component from the view
    this.embeddedComponentRef.remove(0);
  }
}
