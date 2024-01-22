import {css} from "lit";

export const styleCss = css`
  :host {
    --vc-background: var(--ha-card-background, var(--card-background-color, white));
    --vc-primary-text-color: var(--primary-text-color);
    --vc-secondary-text-color: var(--secondary-text-color);
    --vc-icon-color: var(--secondary-text-color);
    --vc-toolbar-background: var(--vc-background);
    --vc-toolbar-text-color: var(--secondary-text-color);
    --vc-toolbar-icon-color: var(--secondary-text-color);
    --vc-divider-color: var(--entities-divider-color, var(--divider-color));
    --vc-spacing: 10px;

    display: flex;
    flex: 1;
    flex-direction: column;
  }

  ha-card {
    flex-direction: column;
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .preview {
    background: var(--vc-background);
    position: relative;
    text-align: center;
    padding-bottom: 5px;

    &.not-available {
      filter: grayscale(1);
    }
  }

  .fill-gap {
    flex-grow: 1;
  }

  .more-info ha-icon {
    display: flex;
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: center;
    direction: ltr;
  }

  .status-text {
    color: var(--vc-secondary-text-color);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .status-text-small {
    color: var(--vc-secondary-text-color);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
  }

  .status mwc-circular-progress {
    --mdc-theme-primary: var(--vc-secondary-text-color) !important;
    margin-left: var(--vc-spacing);
  }

  .battery-name {
    text-align: center;
    font-weight: bold;
    color: var(--vc-primary-text-color);
    font-size: 16px;
  }

  .not-available .offline {
    text-align: center;
    color: var(--vc-primary-text-color);
    font-size: 16px;
  }

  .metadata {
    margin: var(--vc-spacing) auto;
  }

  .stats-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    color: var(--vc-secondary-text-color);
  }

  .stats-col {
    flex: 33%;
    margin-top: auto;
  }

  .stats {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    color: var(--vc-secondary-text-color);
  }

  .stats-block {
    cursor: pointer;
    margin: var(--vc-spacing) 0px;
    text-align: center;
  }

  .stats-value {
    font-size: 18px;
    color: var(--vc-primary-text-color);
  }

  .battery-icon-wrapper {
    display: flex;
    flex-direction: row;
    vertical-align: middle;
  }

  ha-icon {
    color: var(--vc-icon-color);
  }

  .icon-info {
    display: inline-block;
    vertical-align: middle;
  }

  .icon-title {
    color: var(--vc-primary-text-color);
    display: block;
    vertical-align: middle;
    padding: 0 3px;
    font-size: 45px;
    margin: 3px;
  }

  .icon-subtitle {
    display: block;
    vertical-align: middle;
    padding: 0 3px;
    font-size: 22px;
    margin-top: 25px;
  }

  .icon-subtitle-small {
    display: block;
    vertical-align: middle;
    padding: 0 3px;
    font-size: 18px;
    margin-top: 10px;
  }

  .battery-power-out {
    color: #db4437;
  }

  .battery-power-in {
    color: #43a047;
  }

  .rate-wrapper {
    width: 90%;
  }

  .progress-bar {
    width: 100%;
    padding: 2px;
    border-radius: 2px;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, .4);
  }

  .progress-bar-fill {
    display: block;
    height: 10px;
    border-radius: 2px;
  }
  
  .progress-bar-fill-n0 {
    background-color: rgba(0,0,0,0);
  }

  .progress-bar-fill-r10 {
    background-color: #DB4437ff;
  }

  .progress-bar-fill-r20 {
    background-color: #CD3C31ff;
  }

  .progress-bar-fill-r30 {
    background-color: #BF352Bff;
  }

  .progress-bar-fill-r40 {
    background-color: #B12D25ff;
  }

  .progress-bar-fill-r50 {
    background-color: #A3261Fff;
  }

  .progress-bar-fill-r60 {
    background-color: #961E18ff;
  }

  .progress-bar-fill-r70 {
    background-color: #881712ff;
  }

  .progress-bar-fill-r80 {
    background-color: #7A0F0Cff;
  }

  .progress-bar-fill-r90 {
    background-color: #6C0806ff;
  }

  .progress-bar-fill-r100 {
    background-color: #5E0000ff;
  }

  .progress-bar-fill-g10 {
    background-color: #43A047ff;
  }

  .progress-bar-fill-g20 {
    background-color: #3C9642ff;
  }

  .progress-bar-fill-g30 {
    background-color: #348C3Cff;
  }

  .progress-bar-fill-g40 {
    background-color: #2D8237ff;
  }

  .progress-bar-fill-g50 {
    background-color: #257832ff;
  }

  .progress-bar-fill-g60 {
    background-color: #1E6D2Cff;
  }

  .progress-bar-fill-g70 {
    background-color: #166327ff;
  }

  .progress-bar-fill-g80 {
    background-color: #0F5922ff;
  }

  .progress-bar-fill-g90 {
    background-color: #074F1Cff;
  }

  .progress-bar-fill-g100 {
    background-color: #004517ff;
  }

`;
