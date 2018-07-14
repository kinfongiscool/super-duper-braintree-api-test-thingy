import React, { Component } from 'react';
import ReactDOM from "react-dom";
import './App.css';
import BraintreeWebDropIn from "braintree-web-drop-in";

class App extends Component {

  _wrapper;

  async componentDidMount() {
    this.getClientToken();
	}

  async setDropIn(clientToken) {
    this.instance = await BraintreeWebDropIn.create({
      container: ReactDOM.findDOMNode(this._wrapper),
      ...{ authorization: clientToken }
    });
  }

  async getClientToken() {
    await fetch('/client_token', {
      method: 'GET'
    }).then( (res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        alert('Error getting client token, status code = ' + res.status + ' statusText = ' + res.statusText);
      }
    }).then( (resData) => {
        if (resData.clientToken) {
          this.setDropIn(resData.clientToken);
        } else {
          alert('Error parsing client token, status code = ' + resData.status + ' statusText = ' + resData.statusText);
        }
    }).catch(function (err) {
      console.error(err);
    })
  }

	async checkOut() {

    const { nonce } = await this.instance.requestPaymentMethod();
		await fetch('/check_out', {
      method: 'POST',
      body: JSON.stringify({
        'paymentMethodNonce': nonce
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }).then( (res) => {
      console.log("checkOut()" + res)

      if (res.status === 200) {
        alert('Status code = 200, which means it probably worked!');
      } else {
        alert('Error sending payment, status code = ' + res.status + ' statusText = ' + res.statusText);
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
				<button onClick={ this.checkOut.bind(this) }>Continue</button>
          <div className="Content">
            <p>This page is a quick implementation of the Braintree Web Drop In for my application for the API Specialist position listed on the <a href="https://boards.greenhouse.io/braintree/jobs/1141106?gh_jid=1141106">Braintree careers page.</a></p>
            <p>In order to complete this project, I used the <a href="https://github.com/braintree/braintree-web-drop-in">Braintree Web Drop In</a>, <a href="https://github.com/facebookincubator/create-react-app">Create React App</a>, and referred to the <a href="https://developers.braintreepayments.com/start/overview">Braintree Developer Docs</a>.</p>
        </div>
      </div>
    );
  }
}

export default App;
