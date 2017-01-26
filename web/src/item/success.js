import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';

export const ItemPurchaseSuccess = ({ item: { name } }) =>
    <Success title={`Enjoy your ${name}!`}
        subtitle="Thank you for your honesty!"
        image={require("../store/assets/packet.svg")}
        onClick={() => browserHistory.replace(`/history`)}/>;

const mapStateToProps = (
    { store: { items = [] } },
    { params: { itemId } }
) => {
    const item = items.find(item => item.id === itemId);
    return {
        item: item || {}
    };
};

export default connect(mapStateToProps)(ItemPurchaseSuccess);
