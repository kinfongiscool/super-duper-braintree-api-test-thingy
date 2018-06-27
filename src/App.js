import React, { Component } from 'react';
import ReactDOM from "react-dom";
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
    const { nonce } = await this.instance.requestPaymentMethod();
		await fetch('/', {
      method: 'POST',
      body: JSON.stringify({'paymentMethodNonce': nonce}),
      headers: {"Content-Type": "application/json"}
    })
    .then( (res) => {
      console.log(res)
      if (res.status == 200) {
        alert('Status code = 200, which means it was probably okay!');
      } else {
        alert('Error, status code = ' + res.status + ' statusText = ' + res.statusText);
      }
    }).catch(function (err) {
      console.error(err);
    })
};

  async componentWillUnmount() {
    if (this.instance) {
      await this.instance.teardown();
    }
  }

  render() {
    return (
      <div className="App">
        <div className="DropIn" ref={ ref => (this._wrapper = ref) } />
				<button onClick={ this.buy.bind(this) }>Continue</button>
          <div className="Content">
            <p>This project was created using <a href="https://github.com/braintree/braintree-web-drop-in">Braintree Web Drop In</a> and <a href="https://github.com/facebookincubator/create-react-app">Create React App</a>.</p>
            <p>This project is a quick (and somewhat half-baked) implementation of the Braintree Web Drop In for my application for the API Specialist position listed on the <a href="https://boards.greenhouse.io/braintree/jobs/1141106?gh_jid=1141106">Braintree careers page</a></p>
            <p>I found the various Braintree resources and documentation to be very helpful and I learned a lot about Braintree tech (and picked up a few new web dev tricks along the way).</p>
          </div>
      </div>
    );
  }
}

export default App;
