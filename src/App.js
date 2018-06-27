import React, { Component } from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import './App.css';
import BraintreeWebDropIn from "braintree-web-drop-in";

const SANDBOX_TOKENIZATION_KEY = 'sandbox_39ggph7w_5qgyxghdfd2pzwqx';

class App extends Component {

  _wrapper;

  async componentDidMount() {
		this.instance = await BraintreeWebDropIn.create({
			container: ReactDOM.findDOMNode(this._wrapper),
			...{authorization: SANDBOX_TOKENIZATION_KEY}
		});
	}

	async buy() {
		const { paymentRequest } = await this.instance.requestPaymentMethod();
		{/* TODO send paymentRequest to server here */}
	}

  render() {
    return (
      <div className="App">
        <div className="DropIn" ref={ ref => (this._wrapper = ref) } />
				<button onClick={ this.buy.bind(this) }>Submit Payment! (Not really) :)</button>
      </div>
    );
  }
}

export default App;
