import { Component, Element, State, Event, EventEmitter } from '@stencil/core';
import _ from 'lodash';

import { AV_API_KEY } from '../../global/global';

interface ISearchResult {
  symbol: string;
  name: string;
}

@Component({
  tag: 'uc-stock-finder',
  styleUrl: './stock-finder.css',
  shadow: true
})
export class StockFinder {
  @Element() el: HTMLElement;

  @State() results: ISearchResult[] = [];
  @State() loading = false;

  @Event({ bubbles: true, composed: true }) ucSymbolSelected: EventEmitter<
    string
  >;

  private stockNameRef: HTMLInputElement;

  private onSelectSymbol = (symbol: string) => {
    this.ucSymbolSelected.emit(symbol);
  };

  private onSubmit = (e: Event) => {
    e.preventDefault();
    this.search();
  };

  private search = async () => {
    this.loading = true;
    this.results = [];
    try {
      const keywords = this.stockNameRef.value;
      const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${AV_API_KEY}`;
      const res = await fetch(url);
      if (res.status !== 200) {
        throw new Error('invalid');
      }
      const json = await res.json();
      if (!_.isEmpty(json.bestMatches)) {
        this.results = json.bestMatches.map(d => ({
          symbol: d['1. symbol'],
          name: d['2. name']
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  };

  renderResults = () => {
    let searchResults = null;
    if (this.loading) {
      searchResults = <uc-spinner />;
    } else if (!_.isEmpty(this.results)) {
      searchResults = (
        <ul>
          {this.results.map(d => (
            <li onClick={() => this.onSelectSymbol(d.symbol)}>
              <strong>{d.symbol}</strong> {d.name}
            </li>
          ))}
        </ul>
      );
    }
    return searchResults;
  };

  render() {
    return [
      <form onSubmit={this.onSubmit}>
        <input
          autoComplete="off"
          id="stock-symbol"
          type="text"
          ref={el => (this.stockNameRef = el)}
        />
        <button type="submit">Find!</button>
      </form>,
      <div>{this.renderResults()}</div>
    ];
  }
}
