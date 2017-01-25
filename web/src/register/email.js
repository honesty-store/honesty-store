import React from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import Button from '../chrome/button';
import { BRAND_LIGHT, DANGER } from '../chrome/colors';
import { NotNow } from '../chrome/link';
import Page from '../chrome/page';
import isEmail from 'validator/lib/isEmail';
import { performSignin } from '../actions/signin';
import './email.css';

class Email extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            emailAddress: ''
        };
    }

    handleChange(event) {
        const emailAddress = event.target.value;
        this.setState({ emailAddress });
    }

    handleSubmit(e) {
        e.preventDefault();
        const { performSignin, params: { storeId, itemId } } = this.props;
        const { emailAddress } = this.state;
        const valid = isEmail(emailAddress);
        this.setState({ valid });
        if (valid) {
            performSignin({ storeId, itemId, emailAddress });
        }
    }

    style() {
        const { valid } = this.state;
        return valid === false ? { borderBottomColor: DANGER } : {};
    }

    render() {
        const { params: { storeId } } = this.props;
        const { valid } = this.state;
        return <Page left={<NotNow/>}
            title={`Register`}
            storeId={storeId}
            invert={true}
            nav={false}
            fullscreen={true}>
            <form className="register-email" onSubmit={(e) => this.handleSubmit(e)}>
                <h2>Want to sign up or sign in?</h2>
                {
                    valid !== false ?
                    <p>Please enter your email address below</p>
                    :
                    <p style={{ color: DANGER }}>Please enter a valid email address</p>
                }
                <p>
                    <input type="email"
                        name="emailAddress"
                        placeholder="honest.jo@honesty.store"
                        onChange={(e) => this.handleChange(e)}
                        style={this.style()}/>
                </p>
                <p><Button onClick={(e) => this.handleSubmit(e)}>Continue</Button></p>
                <p><Link to={`/${storeId}/help`} style={{ color: BRAND_LIGHT }}>Problems signing in?</Link></p>
            </form>
        </Page>;
    }
}

const mapStateToProps = (_, { params: { storeId, itemId }}) => ({
    storeId,
    itemId
});

const mapDispatchToProps = { performSignin };

export default connect(mapStateToProps, mapDispatchToProps)(Email);