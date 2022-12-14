/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

// @flow

import * as React from 'react';
import explicitConnect from 'firefox-profiler/utils/connect';

import type { ConnectedProps } from 'firefox-profiler/utils/connect';
import { getUploadPhase } from 'firefox-profiler/selectors/publish';

type StateProps = {|
  +isUploading: boolean,
|};

type Props = ConnectedProps<{||}, StateProps, {||}>;

class BeforeUnloadManagerImpl extends React.PureComponent<Props> {
  manageBeforeUnloadListener() {
    const { isUploading } = this.props;
    if (isUploading) {
      window.addEventListener('beforeunload', this.handleUnload);
    } else {
      window.removeEventListener('beforeunload', this.handleUnload);
    }
  }

  handleUnload = (event: BeforeUnloadEvent) => {
    // To be cross-browser and future-proof, we need to use these techniques.
    // Especially at the time this code is written, Chrome doesn't support using
    // preventDefault to trigger the unload alert.
    event.preventDefault();
    event.returnValue = 'Are you sure you want to close while uploading?';
  };

  componentDidMount() {
    this.manageBeforeUnloadListener();
  }

  componentDidUpdate() {
    this.manageBeforeUnloadListener();
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleUnload);
  }

  render() {
    return false;
  }
}

export const BeforeUnloadManager = explicitConnect<{||}, StateProps, {||}>({
  mapStateToProps: (state) => ({
    isUploading: getUploadPhase(state) === 'uploading',
  }),
  component: BeforeUnloadManagerImpl,
});
