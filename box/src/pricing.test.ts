jest.mock('./batch');

import { expect } from 'chai';
import { BoxSubmission } from './client';
import calculatePricing, { getAverageItemCost, getItemCost } from './pricing';

const precision = 0.5;

const storeId = 'test';

const boxSubmission: BoxSubmission = {
  shippingCost: 300,
  boxItems: [
    {
      itemID: 'item-a',
      batches: [
        { id: '30', count: 2 },
        { id: '37.125', count: 1 }
      ]
    },
    {
      itemID: 'item-b',
      batches: [
        { id: '37.333333333333336', count: 5 }
      ]
    }
  ]
};

describe('Average Cost', () => {
  it('should calcualate the average item cost across the batches', () => {
    const { boxItems } = boxSubmission;
    const averageItemCost = getAverageItemCost(boxItems);
    expect(averageItemCost).to.be.approximately(35, precision);
  });
});

describe('Wholesale item cost', () => {
  it('should determine the wholesale value of item-a', () => {
    const { boxItems } = boxSubmission;
    const batches = boxItems[0].batches;
    const wholesaleItemCost = getItemCost(batches);
    expect(wholesaleItemCost).to.be.approximately(32, precision);
  });

  it('should determine the wholesale value of item b', () => {
    const { boxItems } = boxSubmission;
    const batches = boxItems[1].batches;
    const wholesaleItemCost = getItemCost(batches);
    expect(wholesaleItemCost).to.be.approximately(37, precision);
  });
});

describe('Box Submission', () => {
  it('should calculate box item costs', () => {
    const { boxItems } = calculatePricing(storeId, boxSubmission);

    const {
      wholesaleCost,
      warehousingCost,
      packagingCost,
      packingCost,
      shippingCost,
      serviceFee,
      creditCardFee,
      subtotal,
      VAT,
      total
    } = boxItems[0];

    expect(wholesaleCost).to.be.approximately(32.375, precision, 'Incorrect wholesale cost');
    expect(warehousingCost).to.be.approximately(7, precision, 'Incorrect warehousing cost');
    expect(packagingCost).to.be.approximately(43, precision, 'Incorrect packaging cost');
    expect(packingCost).to.be.approximately(29, precision, 'Incorrect packing cost');
    expect(shippingCost).to.be.approximately(43, precision, 'Incorrect shipping cost');
    expect(serviceFee).to.be.approximately(5, precision, 'Incorrect service fee');

    expect(subtotal).to.be.approximately(159, precision, 'Incorrect subtotal');
    expect(creditCardFee).to.be.approximately(12, precision, 'Incorrect credit card fee');
    expect(VAT).to.be.approximately(43, precision, 'Incorrect item VAT');
    expect(total).to.be.approximately(213, precision, 'Incorrect item price');
  });

  it('should calculate total items in box', () => {
    const { count } = calculatePricing(storeId, boxSubmission);
    expect(count).to.equal(8);
  });

  it('should calculate total of individual box items', () => {
    const { boxItems } = calculatePricing(storeId, boxSubmission);
    const { count: boxItem0Count } = boxItems[0];
    const { count: boxItem1Count } = boxItems[1];
    expect(boxItem0Count).to.equal(3);
    expect(boxItem1Count).to.equal(5);
  });

  it('should assign storeId to box', () => {
    const { storeId: boxStoreId } = calculatePricing(storeId, boxSubmission);
    expect(boxStoreId).to.equal(storeId);
  });
});
