import React from 'react';
import history from '../history';
import { Success } from '../chrome/modal';

export default () =>
  <Success title="We've received your message and will be back in touch shortly"
    subtitle="Sorry you're having problems!"
    onClick={() => history.replace(`/help`)} />;
