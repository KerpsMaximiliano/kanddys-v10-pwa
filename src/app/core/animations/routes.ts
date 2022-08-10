import { trigger, transition, style, query, animateChild, animate, group} from "@angular/animations";

export const slideAnimations =
  trigger('routeAnimations', [
    transition('EntityDetailMetrics => ItemCreator', [
      style({ position: 'relative', maxWidth: '500px !important',  overflowX: "hidden"}),
      query(':enter, :leave', [
        style({
          position: 'relative',
          top: 0,
          left: 0,
          width: '*'
        })
      ], {optional: true}),
      query('.helper-headerv2', [
        style({
          position: 'relative',
        })
      ], {optional: true}),
      query('.fixed-container', [
        style({
          position: 'relative',
        })
      ], {optional: true}),
      query(':enter', [
        style({ left: '100%' })
      ],  {optional: true}),
      query(':enter', animateChild(), {optional: true}),
      query(':leave', animateChild(), {optional: true}),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '-100%', opacity: 0 }))
        ], {optional: true}),
        query(':enter', [
          animate('100ms 300ms ease-out', style({ left: '0%' }))
        ], {optional: true}),
        query('@*', animateChild(), {optional: true})
      ]),
    ]),
    transition('ItemCreator => EntityDetailMetrics', [
      style({ position: 'relative', maxWidth: '500px !important',  overflowX: "hidden"}),
      query(':enter, :leave', [
        style({
          position: 'relative',
          top: 0,
          left: 0,
          width: '*'
        })
      ], {optional: true}),
      query('.helper-headerv2', [
        style({
          position: 'relative',
        })
      ], {optional: true}),
      query('.fixed-container', [
        style({
          position: 'relative',
        })
      ], {optional: true}),
      query(':enter', [
        style({ left: '-100%' }),
      ],  {optional: true}),
      query(':enter', animateChild(), {optional: true}),
      query(':leave', animateChild(), {optional: true}),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '200%', opacity: 0 }))
        ], {optional: true}),
        query(':enter', [
          animate('100ms 300ms ease-out', style({ left: '0%' }))
        ], {optional: true}),
        query('@*', animateChild(), {optional: true})
      ]),
    ])
  ]);