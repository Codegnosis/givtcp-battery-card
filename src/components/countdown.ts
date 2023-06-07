import {html, LitElement, PropertyValues, TemplateResult} from "lit";
import {customElement, property} from 'lit/decorators.js';

@customElement('givtcp-battery-card-countdown')
export class GivTCPBatteryCardCountdown extends LitElement {
    @property() secs!: number;

    @property() private _counter?: number = 0;
    private _interval?: number;

    disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this._interval);
    }

    secondsToDuration(d: number) {
        const leftPad = (num: number) => (num < 10 ? `0${num}` : num);

        const h = Math.floor(d / 3600);
        const m = Math.floor((d % 3600) / 60);
        const s = Math.floor((d % 3600) % 60);

        if (h > 0) {
            return `${h}:${leftPad(m)}:${leftPad(s)}`;
        }
        if (m > 0) {
            return `${m}:${leftPad(s)}`;
        }
        if (s > 0) {
            return '' + s;
        }
        return '0';
    }

    protected render(): TemplateResult {
        if (!this._counter) {
            return html`0`;
        }

        if(this._counter <= 0) {
            return html`0`;
        }

        return html`${this.secondsToDuration(this._counter)}`;
    }

    updated(changedProperties: PropertyValues) {
        if (changedProperties.has('secs')) {
            clearInterval(this._interval);
            if(this.secs > 0) {
                this._counter = this.secs;
                this._countdownInterval();
            } else {
                this._counter = 0;
            }
        }

        if (changedProperties.has('_counter')) {
            if(this._counter) {
                if(this._counter <= 0) {
                    clearInterval(this._interval);
                    this._counter = 0;
                }
            }
        }
    }

    _countdownInterval() {
        this._interval = setInterval(() => {
            this._countdown();
        }, 1000);
    }

    _countdown() {
        if(this._counter) {
            this._counter -= 1;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "givtcp-battery-card-countdown": GivTCPBatteryCardCountdown;
    }
}
