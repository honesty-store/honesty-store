import React from 'react';
import { connect } from 'react-redux';
import Page from '../chrome/page';
import List from '../chrome/list';
import './index.css';

const Balance = ({ balance }) => {
  const formattedBalance = (balance/100).toFixed(2);
  return (
    <div className="store-title-balance">
      <small>Balance</small>
      <h1><small>£</small>{formattedBalance}</h1>
    </div>
  );
};

const itemRenderer = (data, index) => (
  <div className="store-item">
    <img src={require("./assets/freddo.png")}/>
    <p>Dairy Milk Freddo Caramel</p>
  </div>
);

const Store = ({ params: { storeId }, balance, loading, items }) =>
  <Page title="Store"
    subtitle={`@${storeId}`}
    right={<Balance balance={balance}/>}
    storeId={storeId}
    loading={loading}>
    <List data={items} itemRenderer={itemRenderer}/>
  </Page>;

const mapStateToProps = ({ pending, user: { balance }, store: { items } }) => ({
  loading: pending.length > 0,
  balance: balance || 0,
  items
});

export default connect(mapStateToProps)(Store);
