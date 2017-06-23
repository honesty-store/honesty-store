import { expect } from 'chai';
import { createTable, cruftForTable, deleteTable, nextId } from './__tests__/aws';

const suiteName = 'reduce';

describe.only(suiteName, () => {

  beforeAll(createTable(suiteName));
  afterAll(deleteTable(suiteName));
  const cruft = cruftForTable(suiteName);

  it('should throw if aggregate is not found', async () => {
    const id = nextId();
    try {
      await cruft.reduce(_ => id, _ => '', (aggregate, _) => aggregate)({ id: nextId() });
      fail('Aggregate not found');
    } catch (e) {
      if (e.message !== `Key not found ${id}`) {
        throw e;
      }
    }
  });

  it('should reduce the first event on to an empty aggregate', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    const aggregate = await reduce(event);
    expect(aggregate.lastReceived && aggregate.lastReceived.id).to.equal(event.id);
    expect(aggregate.lastReceived && aggregate.lastReceived.data).to.deep.equal(event);
    expect(aggregate.lastReceived && aggregate.lastReceived.previous).to.equal(undefined);
  });

  it('should archive event when limit reached', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    let aggregate = await reduce(event);
    aggregate = await reduce({
      id: nextId()
    });
    expect(aggregate.lastReceived && aggregate.lastReceived.id).to.not.equal(event.id);
    expect(aggregate.lastReceived && aggregate.lastReceived.previous).to.equal(event.id);
  });

  it('should ignore the last event', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    let aggregate = await reduce(event);
    expect(aggregate.version).to.equal(1);
    aggregate = await reduce(event);
    expect(aggregate.version).to.equal(1);
  });

  it('should ignore archived events', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    await cruft.create({ id: event.id, version: 0, data: event });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    const aggregate = await reduce(event);
    expect(aggregate.version).to.equal(0);
  });

  it('should store emitted events', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _, emit) => {
      emit({ id: 'a', version: 0 });
      emit({ id: 'b', version: 0 });
      emit({ id: 'c', version: 0 });
      return aggregate;
    });

    await reduce(event);

    await cruft.read('a');
    await cruft.read('b');
    await cruft.read('c');

    const oobKey = 'd';
    try {
      await cruft.read(oobKey);
    } catch (e) {
      if (e.message !== `Key not found ${oobKey}`) {
        throw e;
      }
    }
  });
});
