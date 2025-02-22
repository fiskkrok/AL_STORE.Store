import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";

@Component({
  selector: 'app-panel-wrapper',
  standalone: true,
  template: `
    <div class="panel-wrapper">
      <h2 class="panel-wrapper__title">{{ to.label }}</h2>
      <div class="panel-wrapper__content">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./panel-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelWrapperComponent extends FieldWrapper { }