import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { performTopup } from '../actions/topup';
import { BRAND_LIGHT, MUTED_TEXT, LIGHT_TEXT } from '../chrome/colors';
import Button from '../chrome/button';
import Page from '../chrome/page';
import { Back } from '../chrome/link';
import Currency from '../format/Currency';
import './existing-card.css';

const zeroPadMonth = (month) => {
  const prefix = month < 10 ? '0' : '';
  return `${prefix}${month}`;
};

const CardTemplate = ({ header, brand, last4, expiry, amount, newLinkText, buttonType, onClick }) =>
  <div className="topup-existing-card">
      <h4>{header}</h4>
      <div className="topup-existing-card-container">
        <div className="topup-existing-card-image">
          <div className="topup-existing-card-image-background" />
          <div className={`topup-existing-card-image-${brand.toLowerCase()}`} />
          <p className="topup-existing-card-image-number" style={{ color: MUTED_TEXT }}>
            <span>****</span>
            <span>****</span>
            <span>****</span>
            <span style={{ color: LIGHT_TEXT }}>{last4}</span>
          </p>
          <p className="topup-existing-card-image-expiry" style={{ color: LIGHT_TEXT }}>{expiry}</p>
        </div>
        <p>
          <Link to={`/topup/${amount}/new`} style={{ color: BRAND_LIGHT }}>{newLinkText}</Link>
        </p>
      </div>
      <p className="topup-existing-card-topup">
        <Button type={buttonType} onClick={onClick}>Confirm <Currency amount={amount} /> Top Up</Button>
      </p>
    </div>;

const TopupCard = ({ cardDetails: { brand, last4, expMonth, expYear }, amount, performTopup }) => {
  const expiry = `${zeroPadMonth(expMonth)}/${expYear % 100}`;

  return (
    <CardTemplate
      header={<span>Please check this is the card you want to top up <Currency amount={amount} /> from</span>}
      brand={brand}
      last4={last4}
      expiry={expiry}
      amount={amount}
      newLinkText='Add a different card'
      buttonType='enabled'
      onClick={() => performTopup({ amount })}
    />
  );
};

const NewCard = ({ amount }) =>
    <CardTemplate
      header={<span>No card details to top up <Currency amount={amount} /> from - please add a new card</span>}
      brand='visa'
      last4='****'
      expiry='00/00'
      amount={amount}
      newLinkText='Add a new card'
      buttonType='disabled'
      onClick={() => {}}
    />;

const TopupPrompt = ({ amount, cardDetails, performTopup }) =>
  <Page left={<Back>Balance</Back>}
    title={`Top Up`}
    invert={true}
    nav={false}
    fullscreen={true}>
    {
      cardDetails
        ? <TopupCard cardDetails={cardDetails} amount={amount} performTopup={performTopup} />
        : <NewCard amount={amount} />
    }
  </Page>;

const mapStateToProps = ({
  user: {
    balance = 0,
    cardDetails // maybe undefined
  },
}) => ({
  balance,
  cardDetails
});

const mapDispatchToProps = { performTopup };

const mergeProps = (stateProps, dispatchProps, { params: { amount }}) => ({
  ...stateProps,
  ...dispatchProps,
  amount: Number(amount)
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(TopupPrompt);
