/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Localized } from '@fluent/react';

import './IdleSearchField.css';

type Props = {|
  +onIdleAfterChange: (string) => void,
  +onFocus?: () => void,
  +onBlur?: (Element | null) => void,
  +idlePeriod: number,
  +defaultValue: ?string,
  +className: ?string,
  +title: ?string,
|};

type State = {
  value: string,
  previousDefaultValue: string,
};

export class IdleSearchField extends PureComponent<Props, State> {
  _timeout: TimeoutID | null = null;
  _previouslyNotifiedValue: string;
  _input: HTMLInputElement | null = null;
  _takeInputRef = (input: HTMLInputElement | null) => (this._input = input);

  constructor(props: Props) {
    super(props);
    this.state = {
      value: props.defaultValue || '',
      previousDefaultValue: props.defaultValue || '',
    };
    this._previouslyNotifiedValue = this.state.value;
  }

  _onSearchFieldFocus = (e: SyntheticFocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();

    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  _onSearchFieldBlur = (e: { relatedTarget: Element | null }) => {
    if (this.props.onBlur) {
      this.props.onBlur(e.relatedTarget);
    }
  };

  _onSearchFieldChange = (e: SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      value: e.currentTarget.value,
    });

    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(this._onTimeout, this.props.idlePeriod);
  };

  _onTimeout = () => {
    this._timeout = null;
    this._notifyIfChanged(this.state.value);
  };

  _notifyIfChanged(value: string) {
    if (value !== this._previouslyNotifiedValue) {
      this._previouslyNotifiedValue = value;
      this.props.onIdleAfterChange(value);
    }
  }

  _onClearButtonClick = () => {
    if (this._input) {
      this._input.focus();
    }

    if (this._timeout !== null) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    this.setState({ value: '' });
    this._notifyIfChanged('');
  };

  _onFormSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
  }
  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.defaultValue !== state.previousDefaultValue) {
      return {
        previousDefaultValue: props.defaultValue || '',
        value: props.defaultValue || '',
      };
    }
    return null;
  }

  render() {
    const { className, title } = this.props;
    return (
      <form
        className={classNames('idleSearchField', className)}
        onSubmit={this._onFormSubmit}
      >
        <Localized
          id="IdleSearchField--search-input"
          attrs={{ placeholder: true }}
        >
          <input
            type="search"
            name="search"
            placeholder="Enter filter terms"
            className="idleSearchFieldInput photon-input"
            required="required"
            title={title}
            value={this.state.value}
            onChange={this._onSearchFieldChange}
            onFocus={this._onSearchFieldFocus}
            onBlur={this._onSearchFieldBlur}
            ref={this._takeInputRef}
          />
        </Localized>
        <input
          type="reset"
          className="idleSearchFieldButton"
          onClick={this._onClearButtonClick}
          tabIndex={-1}
        />
      </form>
    );
  }
}
