import { Directive, ElementRef, EventEmitter, Input, Output, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appIntersectionObserver]',
  standalone: true
})
export class IntersectionObserverDirective implements AfterViewInit, OnDestroy {
  @Input() threshold = 0.1;
  @Output() intersecting = new EventEmitter<boolean>();

  private readonly observer: IntersectionObserver;

  constructor(private readonly element: ElementRef) {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.intersecting.emit(entry.isIntersecting);
      },
      { threshold: this.threshold }
    );
  }

  ngAfterViewInit() {
    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}