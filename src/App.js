import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import BraintreeWebDropIn from 'braintree-web-drop-in';
import BraintreeWeb from 'braintree-web';

class App extends Component {

  submitButton;
  form;

  constructor(props) {
    super(props);

    this.createHostedFields = this.createHostedFields.bind(this);
  }

  async componentDidMount() {
    this.getClientToken();
  }

  async setBraintree(clientToken) {
    BraintreeWeb.client.create({
      authorization: clientToken
    }, (err, clientInstance) => {
      if (err) {
        console.error(err);
        return;
      }
      this.createHostedFields(clientInstance);
    });
  }

  createHostedFields(clientInstance) {
    BraintreeWeb.hostedFields.create({
      client: clientInstance,
      styles: {
        'input': {
          'font-size': '16px',
          'color': '#ccc',
          'font-family': 'Lato',
        },
        ':focus': {
          'color': 'black'
        },
        '.valid': {
          'color': '#40BCD8'
        }
      },
      fields: {
        number: {
          selector: '#cardNumber',
          placeholder: '4111 1111 1111 1111'
        },
        expirationDate: {
          selector: '#expirationDate',
          placeholder: 'MM/YYYY'
        },
        cvv: {
          selector: '#cvv',
          placeholder: '123'
        }
      }
    }, (err, hostedFieldsInstance) => {
      this.instance = hostedFieldsInstance;
      this.submitButton.removeAttribute('disabled');
      var teardown = (event) => {
        event.preventDefault();
        hostedFieldsInstance.teardown( () => {
          this.createHostedFields(clientInstance);
          this.form.removeEventListener('submit', teardown, false);
        });
      };

      this.form.addEventListener('submit', teardown, false);
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
        this.setBraintree(resData.clientToken);
      } else {
        alert('Error parsing client token, status code = ' + resData.status + ' statusText = ' + resData.statusText);
      }
    }).catch( (err) => {
      console.error(err);
    })
  }

  async checkOut() {
    this.instance.tokenize().then( async (payload) => {
      this.submitButton.setAttribute('disabled', 'disabled');
      await fetch('/check_out', {
        method: 'POST',
        body: JSON.stringify({
          'paymentMethodNonce': payload.nonce
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }).then( (res) => {
        if (res.status === 200) {
          alert('Status code = 200, which means it probably worked!');
        } else {
          alert('Error processing payment, status code = ' + res.status + ' statusText = ' + res.statusText);
        }
      })
    }).catch( (err) => {
      this.submitButton.removeAttribute('disabled');
      console.error(err);
    });
  };

  async componentWillUnmount() {
    if (this.instance) {
      await this.instance.teardown();
    }
  }

  render() {
    return (
      <div className="App">
        <div className="hosted-field-form-container" >
          <form className="hosted-field-form" ref={ ref => (this.form = ref) }>
            <label className="hosted-field-label" htmlFor="card-number">Card Number</label>
            <div className="hosted-field" id="cardNumber"/>
            <label className="hosted-field-label" htmlFor="expirationDate">Expiration Date</label>
            <div className="hosted-field" id="expirationDate"/>
            <label className="hosted-field-label" htmlFor="cvv">CVV</label>
            <div className="hosted-field" id="cvv"/>
          </form>
          <button ref={ ref => (this.submitButton = ref) } onClick={ this.checkOut.bind(this) }>Continue</button>
        </div>
      </div>
    );
  }
}

export default App;
