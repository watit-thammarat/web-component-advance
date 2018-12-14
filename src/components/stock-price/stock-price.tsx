import { Component, State, Element, Prop, Watch, Listen } from '@stencil/core';

import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'uc-stock-price',
  styleUrl: './stock-price.css',
  shadow: true
})
export class StockPrice {
  private stockSymbolRef: HTMLInputElement;
  // private initialStockInput = '';

  @Prop({ reflectToAttr: true, mutable: true }) stockInput: string = '';

  @Watch('stockInput')
  stockInputChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue && newValue !== this.stockSymbol) {
      this.stockSymbol = newValue;
    }
    this.implementFetchStock();
  }

  @State() price: number = null;
  @State() stockSymbol = '';
  @State() stockSymbolValid = false;
  @State() error = '';
  @State() loading = false;

  @Element() el: HTMLElement;

  componentWillLoad() {
    console.log('==> componentWillLoad');
    if (this.stockInput) {
      this.stockSymbol = this.stockInput;
      this.stockSymbolValid = true;
    }
  }

  componentDidLoad() {
    console.log('==> componentDidLoad');
    if (this.stockSymbol) {
      this.fetchStock();
    }
  }

  componentWillUpdate() {
    console.log('==> componentWillUpdate');
  }

  componentDidUpdate() {
    console.log('==> componentDidUpdate');
  }

  componentDidUnload() {
    console.log('==> componentDidUnload');
  }

  @Listen('body:ucSymbolSelected')
  onStockSymbolSelected(e: CustomEvent) {
    console.log('stock symbol selected: ', e);
    if (e.detail && e.detail !== this.stockSymbol) {
      this.stockSymbol = e.detail;
    }
    this.implementFetchStock();
  }

  private implementFetchStock = () => {
    if (this.stockSymbol.trim().length > 0) {
      this.stockSymbolValid = true;
      this.fetchStock();
    } else {
      this.stockSymbolValid = false;
      this.price = null;
    }
  };

  private fetchStock = async () => {
    this.error = '';
    this.price = null;
    this.loading = true;
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${
        this.stockSymbol
      }&apikey=${AV_API_KEY}`;
      const res = await fetch(url);
      if (res.status !== 200) {
        throw new Error('Invalid!');
      }
      const json = await res.json();
      if (!json['Global Quote']['05. price']) {
        throw new Error('Invalid symbol!');
      }
      this.price = +json['Global Quote']['05. price'];
    } catch (err) {
      console.error(err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  };

  private onSubmit = async (e: Event) => {
    e.preventDefault();
    this.error = '';
    this.stockSymbol = this.stockSymbolRef.value;
    this.fetchStock();
  };

  private onStockSysmbolChange = (e: Event) => {
    this.stockSymbol = (e.target as HTMLInputElement).value;
    this.stockSymbolValid = this.stockSymbol.trim().length > 0;
  };

  hostData() {
    return { class: this.error ? 'error' : '' };
  }

  render() {
    let dataContent = <p>Please enter a symbol</p>;
    if (this.loading) {
      dataContent = <uc-spinner />;
    } else if (this.price) {
      dataContent = <p>Price: ${this.price}</p>;
    } else if (this.error) {
      dataContent = <p>{this.error}</p>;
    }
    return [
      <form onSubmit={this.onSubmit}>
        <input
          autoComplete="off"
          id="stock-symbol"
          type="text"
          ref={el => (this.stockSymbolRef = el)}
          value={this.stockSymbol}
          onInput={this.onStockSysmbolChange}
        />
        <button type="submit" disabled={!this.stockSymbolValid || this.loading}>
          Fetch
        </button>
      </form>,
      <div>{dataContent}</div>
    ];
  }
}
