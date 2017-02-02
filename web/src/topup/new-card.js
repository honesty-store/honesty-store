import React from 'react';
import Button from '../chrome/button';
import { Back } from '../chrome/link';
import Page from '../chrome/page';

export default ({ params: { amount } }) =>
  <Page left={<Back>Card</Back>}
    title={`Top Up`}
    invert={true}
    nav={false}
    fullscreen={true}>
    <div>
      <h1>Want to add a different card?</h1>
      <p>If you want to add or change your card details please chat with customer support.</p>
      <p><Button to={`/help`}>Chat to Customer Support</Button></p>
    </div>
  </Page>;