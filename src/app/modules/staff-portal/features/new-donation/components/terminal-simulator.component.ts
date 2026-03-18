import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

interface TerminalMessage {
  type: 'request' | 'approved' | 'declined';
  amount?: number;
  txnRef?: string;
  reason?: string;
}

@Component({
  selector: 'app-terminal-simulator',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="tsim-page">
      <div class="tsim-device">
        <div class="tsim-screen">
          @if (!responded()) {
            <div class="tsim-logo">💳</div>
            <div class="tsim-amount">\${{ amount().toFixed(2) }}</div>
            <div class="tsim-prompt">Tap, insert, or swipe card</div>
            <div class="tsim-pulse-ring"></div>

            <div class="tsim-actions">
              <button class="tsim-action-btn tsim-approve-btn" (click)="approve()">
                <app-icon name="check-circle" [size]="28"></app-icon>
                <span>Approve</span>
              </button>
              <button class="tsim-action-btn tsim-decline-btn" (click)="decline()">
                <app-icon name="x-circle" [size]="28"></app-icon>
                <span>Decline</span>
              </button>
            </div>
          } @else if (approvedResult()) {
            <div class="tsim-result tsim-result-ok">
              <app-icon name="check-circle" [size]="48"></app-icon>
              <div class="tsim-result-title">Approved</div>
              <div class="tsim-result-sub">Transaction Ref: {{ txnRef() }}</div>
              <div class="tsim-result-amount">\${{ amount().toFixed(2) }}</div>
            </div>
          } @else {
            <div class="tsim-result tsim-result-fail">
              <app-icon name="x-circle" [size]="48"></app-icon>
              <div class="tsim-result-title">Declined</div>
              <div class="tsim-result-sub">{{ declineReason() }}</div>
              <button class="tsim-retry-btn" (click)="retry()">Try Again</button>
            </div>
          }
        </div>
        <div class="tsim-footer">Card Terminal Simulator</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .tsim-page {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
      font-family: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    }
    .tsim-device {
      width: 360px;
      background: #111;
      border-radius: 28px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .tsim-screen {
      background: #1a1a2e;
      border-radius: 18px;
      padding: 32px 24px;
      text-align: center;
      min-height: 380px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .tsim-logo { font-size: 48px; margin-bottom: 8px; }
    .tsim-amount {
      font-size: 36px;
      font-weight: 900;
      color: #fff;
      letter-spacing: -1px;
    }
    .tsim-prompt {
      font-size: 14px;
      color: #a5b4fc;
      margin-bottom: 8px;
    }
    .tsim-pulse-ring {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #818cf8;
      margin: 8px 0 16px;
      animation: tsim-pulse 1.5s ease-in-out infinite;
    }
    @keyframes tsim-pulse {
      0%, 100% { opacity: 0.4; transform: scale(1); box-shadow: 0 0 0 0 rgba(129,140,248,0.4); }
      50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 0 12px rgba(129,140,248,0); }
    }
    .tsim-actions {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      width: 100%;
    }
    .tsim-action-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 18px 12px;
      border-radius: 14px;
      border: 2px solid transparent;
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .tsim-approve-btn {
      background: rgba(22, 163, 74, 0.15);
      color: #4ade80;
      border-color: rgba(22, 163, 74, 0.3);
      &:hover { background: rgba(22, 163, 74, 0.3); border-color: #4ade80; }
    }
    .tsim-decline-btn {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.3);
      &:hover { background: rgba(239, 68, 68, 0.3); border-color: #f87171; }
    }
    .tsim-result {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .tsim-result-ok { color: #4ade80; }
    .tsim-result-fail { color: #f87171; }
    .tsim-result-title {
      font-size: 24px;
      font-weight: 900;
    }
    .tsim-result-sub {
      font-size: 13px;
      opacity: 0.7;
      font-family: monospace;
    }
    .tsim-result-amount {
      font-size: 28px;
      font-weight: 800;
      margin-top: 4px;
    }
    .tsim-retry-btn {
      margin-top: 12px;
      padding: 10px 28px;
      border-radius: 10px;
      border: 2px solid rgba(248, 113, 113, 0.4);
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      &:hover { background: rgba(239, 68, 68, 0.3); }
    }
    .tsim-footer {
      text-align: center;
      color: #555;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 16px;
    }
  `]
})
export class TerminalSimulatorComponent implements OnInit, OnDestroy {
  private channel!: BroadcastChannel;

  readonly amount = signal<number>(0);
  readonly responded = signal(false);
  readonly approvedResult = signal(false);
  readonly txnRef = signal('');
  readonly declineReason = signal('');

  private readonly declineReasons = [
    'Insufficient funds',
    'Card expired',
    'Transaction limit exceeded',
    'Card blocked by issuer'
  ];

  ngOnInit(): void {
    this.channel = new BroadcastChannel('card-terminal');
    this.channel.onmessage = (event: MessageEvent<TerminalMessage>) => {
      if (event.data.type === 'request') {
        this.amount.set(event.data.amount ?? 0);
        this.responded.set(false);
        this.approvedResult.set(false);
      }
    };
  }

  ngOnDestroy(): void {
    this.channel?.close();
  }

  approve(): void {
    const ref = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    this.txnRef.set(ref);
    this.responded.set(true);
    this.approvedResult.set(true);
    this.channel.postMessage({
      type: 'approved',
      txnRef: ref,
      amount: this.amount()
    } as TerminalMessage);
    setTimeout(() => window.close(), 1500);
  }

  decline(): void {
    const reason = this.declineReasons[Math.floor(Math.random() * this.declineReasons.length)];
    this.declineReason.set(reason);
    this.responded.set(true);
    this.approvedResult.set(false);
    this.channel.postMessage({
      type: 'declined',
      reason
    } as TerminalMessage);
    setTimeout(() => window.close(), 1500);
  }

  retry(): void {
    this.responded.set(false);
    this.approvedResult.set(false);
  }
}
