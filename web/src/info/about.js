import React from 'react';
import { Back } from '../chrome/link';
import Page from '../chrome/page';

export default () =>
    <Page left={<Back/>}
        title="About"
        subtitle="honesty.store"
        invert={true}
        nav={false}>
        <div>
            <p>Lorem ipsum...</p>
        </div>
    </Page>;