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

`;
