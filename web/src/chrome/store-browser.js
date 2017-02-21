import React from 'react';
import Button from '../chrome/button';

const extractStoreCode = (url) => {
  const [storeCode] = url.match(/([^/]*)$/);
  return storeCode === 'honesty.store' ? '' : storeCode;
};

class StoreBrowser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      storeCode: ''
    };
  }

  handleStoreCodeChange(event) {
    const { value } = event.target;
    const storeCode = extractStoreCode(value);
    this.setState({
      storeCode: `https://honesty.store/${storeCode}`
    });
  }

  openStore(e) {
    e.preventDefault();
    const { onSubmit } = this.props;
    const storeCode = extractStoreCode(this.state.storeCode);
    if (storeCode !== '') {
      onSubmit(storeCode);
    }
  }

  render() {
    const { storeCode } = this.state;
    return (
      <form onSubmit={(e) => this.openStore(e)}>
        <p className="home-store-code">
          <input name="storeCode"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            value={storeCode}
            type="text"
            placeholder="https://honesty.store/your-store-code"
            onFocus={(e) => this.handleStoreCodeChange(e)}
            onChange={(e) => this.handleStoreCodeChange(e)} />
        </p>
        <p>
          <Button onClick={(e) => this.openStore(e)}>Browse Store</Button>
        </p>
      </form>
    );
  }
}

export default StoreBrowser;
