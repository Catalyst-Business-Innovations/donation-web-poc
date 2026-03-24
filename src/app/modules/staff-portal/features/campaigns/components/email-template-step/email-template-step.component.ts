import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { IconComponent, IconName } from '@shared/components/icon/icon.component';
import {
  EmailBlock,
  EmailBlockType,
  EmailStarterTemplate,
  EMAIL_STARTER_TEMPLATES,
  TemplateMergeVariables
} from '@core/models/domain.models';
import { BlockTypeOption } from '../../models/campaigns.state';

@Component({
  selector: 'app-email-template-step',
  standalone: true,
  imports: [FormsModule, TitleCasePipe, IconComponent],
  templateUrl: './email-template-step.component.html',
  styleUrl: './email-template-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailTemplateStepComponent {
  readonly emailSubject = input.required<string>();
  readonly emailBlocks = input.required<EmailBlock[]>();
  readonly selectedBlockId = input.required<string | null>();
  readonly showStarterPicker = input.required<boolean>();
  readonly isViewMode = input.required<boolean>();
  readonly emailSubjectPreview = input.required<string>();

  readonly subjectChanged = output<string>();
  readonly starterApplied = output<EmailStarterTemplate>();
  readonly blockAdded = output<EmailBlockType>();
  readonly blockSelected = output<string>();
  readonly blockUpdated = output<{ id: string; patch: Partial<EmailBlock> }>();
  readonly blockRemoved = output<string>();
  readonly blockMoved = output<{ id: string; dir: -1 | 1 }>();
  readonly starterPickerToggled = output<void>();

  protected readonly starters = EMAIL_STARTER_TEMPLATES;
  protected readonly mergeVars = TemplateMergeVariables;
  protected readonly blockTypes: BlockTypeOption[] = [
    { type: 'header', label: 'Heading', icon: 'file-text' },
    { type: 'text', label: 'Text', icon: 'file' },
    { type: 'button', label: 'Button', icon: 'arrow-right' },
    { type: 'divider', label: 'Divider', icon: 'more-vertical' },
    { type: 'image', label: 'Image', icon: 'image' },
    { type: 'spacer', label: 'Spacer', icon: 'layers' }
  ];

  get selectedBlock(): EmailBlock | null {
    return this.emailBlocks().find(b => b.id === this.selectedBlockId()) ?? null;
  }

  blockIcon(type: EmailBlockType): IconName {
    return this.blockTypes.find(b => b.type === type)?.icon ?? 'file';
  }

  previewBlockContent(content: string): string {
    // This is a pure display concern; the actual preview merge happens in the page
    return content;
  }

  onMergeVarClick(varKey: string): void {
    const block = this.selectedBlock;
    if (block) {
      this.blockUpdated.emit({ id: block.id, patch: { content: block.content + varKey } });
    }
  }
}
