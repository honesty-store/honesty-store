import React from 'react';
import { Link } from 'react-router';
import safeLookupItemImage from '../item/safeLookupItemImage';
import Currency from '../format/Currency';

export default ({ item: { id, name, price: { total: price }, image, qualifier, count, isMarketplace } }) =>
  <Link to={`/item/${id}`} className="btn regular flex navy" style={{ filter: count === 0 ? 'grayscale()' : undefined }}>
    <div className="flex-none col-3">
      <div className="bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${safeLookupItemImage(image)})`, paddingBottom: '100%' }}>
        {'\u00a0'}
      </div>
    </div>
    <div className="ml2 mt1 mb1 flex-auto flex flex-column justify-center">
      <h2 className="h2 mt0 mb0">
        {name}
      </h2>
      {
        qualifier &&
        <p className="mt0 mb0 aqua">
          {qualifier}
        </p>
      }
    </div>
    <div className="ml2 flex-none flex flex-column justify-around">
      <h2 className={`mt0 mb0 btn btn-primary ${isMarketplace && 'btn-more'}`}>
        <Currency amount={price} />
      </h2>
    </div>
  </Link>;
