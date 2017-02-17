import React from 'react';
import { connect } from 'react-redux';
import Button from '../chrome/button';
import { DANGER } from '../chrome/colors';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import { performRegister2 } from '../actions/register2';
import './card.css';

const TOPUP_AMOUNT = 500;

const setCursorPosition = (element) => () => {
  requestAnimationFrame(() => {
    element.selectionStart = element.selectionEnd = element.value.length;
  });
};

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: '',
      exp: '',
      cvc: ''
    };
  }

  handleNumberChange(event) {
    const matches = event.target.value.match(/\d/g);
    const numbers = matches == null ? [] : [...matches];
    const number = numbers.reduce((output, number, index) => {
      const separator = (index % 4 === 0 && index > 0) ? ' ' : '';
      return `${output}${separator}${number}`;
    }, '');

    this.setState({ number: number.substr(0, 19) }, setCursorPosition(event.target));
  }

  handleExpChange(event) {
    const matches = event.target.value.match(/\d/g);
    const numbers = matches == null ? [] : [...matches];
    const exp = numbers.reduce((output, number, index) => {
      const separator = (index % 2 === 0 && index > 0) ? ' / ' : '';
      return `${output}${separator}${number}`;
    }, '');
    this.setState({ exp: exp.substr(0, 7) }, setCursorPosition(event.target));
  }

  handleCVCChange(event) {
    const matches = event.target.value.match(/\d/g);
    const numbers = matches == null ? [] : [...matches];
    const cvc = numbers.join('');
    this.setState({ cvc: cvc.substr(0, 3) }, setCursorPosition(event.target));
  }

  handleSubmit(e) {
    e.preventDefault();
    const { storeCode, itemId, emailAddress, performRegister2 } = this.props;
    const { number, cvc, exp } = this.state;
    const cardDetails = { number, cvc, exp };
    performRegister2({ storeCode, itemID: itemId, topUpAmount: TOPUP_AMOUNT, emailAddress, cardDetails });
  }

  style(name, error) {
    return (error != null && error.param === name) ? { borderBottomColor: DANGER } : {};
  }

  getConfirmButtonText() {
    const topUpText = 'Confirm £5 Top Up';
    const { itemId } = this.props;
    return itemId ? `${topUpText} & Purchase` : topUpText;
  }

  render() {
    const { error } = this.props;
    const { number, exp, cvc } = this.state;
    return <Page left={<Back>Register</Back>}
      title={`Top Up`}
      invert={true}
      nav={false}
      fullscreen={true}>
      <form className="register-card" onSubmit={(e) => this.handleSubmit(e)}>
        {
          error ?
            <div style={{ color: DANGER }}>
              <p>There was a problem collecting payment from your card, please check the details</p>
              <p>{error.message}</p>
            </div>
            :
            <div>
              <p>Please enter the details of the card you want us to collect your first £5 top up from</p>
              <p>Don't worry, your balance won't expire, we'll never perform a top up without your
                        permission and you can close your account at any time</p>
            </div>
        }
        <p>
          <input name="number"
            autoComplete="cc-number"
            placeholder="1111 2222 3333 4444"
            style={this.style('number', error)}
            value={number}
            pattern="[0-9]*"
            noValidate
            onChange={(e) => this.handleNumberChange(e)} />
        </p>
        <p className="register-card-tight">
          <input name="exp"
            autoComplete="cc-exp"
            value={exp}
            pattern="[0-9]*"
            noValidate
            placeholder="Expiry (MM / YY)"
            style={this.style('exp', error)}
            onChange={(e) => this.handleExpChange(e)} />
          <input name="cvc"
            autoComplete="cc-csc"
            value={cvc}
            pattern="[0-9]*"
            noValidate
            placeholder="CVV (3-digits)"
            style={this.style('cvc', error)}
            onChange={(e) => this.handleCVCChange(e)} />
        </p>
        <p><Button onClick={(e) => this.handleSubmit(e)}>{this.getConfirmButtonText()}</Button></p>
      </form>
    </Page>;
  }
}

const mapStateToProps = ({ register: { error } }, { params: { itemId, emailAddress }}) => ({
  itemId,
  emailAddress,
  error
});

const mapDispatchToProps = { performRegister2 };


export default connect(mapStateToProps, mapDispatchToProps)(Card);