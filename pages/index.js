import React from 'react'

export default class App extends React.Component {
  static async getInitialProps() {
    return {
      hello: 'world',
    };
  }

  render() {
    return (
      <div>hello {this.props.hello}</div>
    );
  }
}
