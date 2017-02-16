import React from 'react';
import axios from 'axios';

let ax = axios.create({
  baseURL: 'https://api.travis-ci.org/v3/',
  timeout: 20000,
});

export default class App extends React.Component {
  static async getInitialProps() {
    // Find all the FB repos
    let res = await ax.get(
      'owner/facebook',
      {params: {include: 'organization.repositories'}}
    );
    let repos = res.data.repositories.filter(repo => repo.active);
    return {
      repos: repos,
    };
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.repos.map(repo => <div>{repo.slug}</div>)}
      </div>
    );
  }
}
