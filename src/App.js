import React, { Component } from 'react';
import './App.css';
import BraintreeWeb from 'braintree-web';

class App extends Component {

  submitButton;
  form;

  constructor(props) {
    super(props);

    this.state = {
      submitButtonText: "Enter Card Info",
      submitButtonDisabled: true,
    }

    this.createHostedFields = this.createHostedFields.bind(this);
  }

  setSubmitButtonDefault() {
    this.setState({
      submitButtonText: 'Enter Card Info',
      submitButtonDisabled: false
    });
  }

  setSubmitButtonValid() {
    this.setState({
      submitButtonText: 'Check Out',
      submitButtonDisabled: false
    });
  }

  setSubmitButtonProcessing() {
    this.setState({
      submitButtonText: 'Processing...',
      submitButtonDisabled: true
    });
  }

  setSubmitButtonSuccess() {
    this.setState({
      submitButtonText: 'Success! Resetting...',
      submitButtonDisabled: true
    });
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

      hostedFieldsInstance.on('validityChange', (event) => {
        var formValid = Object.keys(event.fields).every(function (key) {
          return event.fields[key].isValid;
        });
        if (formValid) {
          this.setSubmitButtonValid();
        } else {
          this.setSubmitButtonDefault();
        }
      });

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
        alert('Error getting client token, status code = ' + res.status);
      }
    }).then( (resData) => {
      if (resData.clientToken) {
        this.setBraintree(resData.clientToken);
      } else {
        alert('Error parsing client token.');
      }
    }).catch( (error) => {
      alert('Failed to initialize, unable to get client token, error: ' + error);
    })
  }

  async checkOut() {
    this.setSubmitButtonProcessing();
    this.instance.tokenize().then( async (payload) => {
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
          this.setSubmitButtonSuccess();
          this.form.submit();
        } else {
          this.setSubmitButtonDefault();
          alert('Error processing payment, status code = ' + res.status);
        }
      })
    }).catch( (error) => {
      this.setSubmitButtonDefault();
      alert('Failed to submit transaction, error: ' + error);
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
          <button ref={ ref => (this.submitButton = ref) } onClick={ this.checkOut.bind(this) } disabled={ this.state.submitButtonDisabled }>{ this.state.submitButtonText }</button>
        </div>
      </div>
    );
  }
}

export default App;
