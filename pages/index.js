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

    // Maps repo id to additional data
    this.state = {};
  }

  // Loads data for the repo with the provided id
  // Just calls setState when it's done
  async loadRepo(id) {
    let res = await ax.get(
      `repo/${id}/builds`,
      {
        params: {
          include: 'job.started_at,job.finished_at,job.queue,job.state', limit: 100
        }
      }
    );

    return res;
  }

  async loadAll() {
    for (let repo of this.props.repos) {
      let res = await this.loadRepo(repo.id);
      for (let build of res.data.builds) {
        if (build.finished_at) {
          continue;
        }

        // TODO: use job.started_at and job.finished_at
        console.log(build.jobs[0]);
        console.log(build.jobs[1]);
        console.log(build.jobs[2]);
      }
    }
  }

  componentWillMount() {
    this.loadAll();
  }

  render() {
    return (
      <div>
        {this.props.repos.map(repo => <div>{repo.id} - {repo.slug}</div>)}
      </div>
    );
  }
}
