import {
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'app-dynamic-component',
  templateUrl: './dynamic-component.component.html',
  styleUrls: ['./dynamic-component.component.scss'],
})
export class DynamicComponentComponent implements OnInit {
  @Input() component: Type<any>;
  @Input() componentInputs: Record<string, any> = {};
  @Input() componentOutputs: any;
  @ViewChild('embeddedComponent', { read: ViewContainerRef, static: true })
  embeddedComponentRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.loadBodyComponent();
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

    this.componentOutputs.forEach((output) => {
      console.log(newComponent.instance);
      if (newComponent.instance[output.name])
        newComponent.instance[output.name].subscribe(output.callback);
    });
  }
}
