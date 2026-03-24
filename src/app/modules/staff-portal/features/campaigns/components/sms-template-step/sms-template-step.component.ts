import { ChangeDetectionStrategy, Component, input, output, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TemplateMergeVariables } from '@core/models/domain.models';
import { smsCharCount, smsSegments } from '../../models/campaigns.mapper';

@Component({
  selector: 'app-sms-template-step',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './sms-template-step.component.html',
  styleUrl: './sms-template-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmsTemplateStepComponent {
  readonly smsBody = input.required<string>();
  readonly isViewMode = input.required<boolean>();
  readonly smsBodyPreview = input.required<string>();

  readonly bodyChanged = output<string>();

  protected readonly mergeVars = TemplateMergeVariables;

  @ViewChild('smsBodyEditor') smsBodyRef?: ElementRef<HTMLTextAreaElement>;

  get charCount(): number {
    return smsCharCount(this.smsBody());
  }

  get segments(): number {
    return smsSegments(this.smsBody());
  }

  get previewCharCount(): number {
    return this.smsBodyPreview().length;
  }

  insertVariable(varKey: string): void {
    const el = this.smsBodyRef?.nativeElement;
    const body = this.smsBody();
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = body.substring(0, start);
      const after = body.substring(end);
      this.bodyChanged.emit(before + varKey + after);
      setTimeout(() => {
        el.focus();
        el.selectionStart = el.selectionEnd = start + varKey.length;
      });
    } else {
      this.bodyChanged.emit(body + varKey);
    }
  }
}
