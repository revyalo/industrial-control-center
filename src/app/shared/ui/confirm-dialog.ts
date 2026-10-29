import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<dialog
    #dialog
    [attr.aria-label]="title()"
    (cancel)="closed.emit()"
    (close)="closed.emit()"
  >
    <div class="dialog-body">
      <p class="eyebrow">CONFIRM ACTION</p>
      <h2>{{ title() }}</h2>
      <p>{{ message() }}</p>
      <div class="actions">
        <button class="button" autofocus (click)="closed.emit()">Cancel</button
        ><button class="button danger" (click)="confirmed.emit(); closed.emit()">
          {{ actionLabel() }}
        </button>
      </div>
    </div>
  </dialog>`,
  styles: `
    dialog {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 12px;
      max-width: 450px;
      width: calc(100% - 36px);
      padding: 0;
      box-shadow: var(--shadow);
    }
    dialog::backdrop {
      background: #0009;
      backdrop-filter: blur(4px);
    }
    .dialog-body {
      padding: 28px;
    }
    h2 {
      margin: 14px 0;
      font-size: 22px;
    }
    p:not(.eyebrow) {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.7;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 28px;
    }
  `,
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input('Confirm');
  readonly closed = output<void>();
  readonly confirmed = output<void>();
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  constructor() {
    effect(() => {
      const el = this.dialog()?.nativeElement;
      if (!el) return;
      if (this.open() && !el.open) el.showModal();
      else if (!this.open() && el.open) el.close();
    });
  }
}
