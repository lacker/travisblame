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

    let working = 0;
    let queued = 0;
    for (let build of res.data.builds) {
      if (build.finished_at) {
        continue;
      }
      for (let job of build.jobs) {
        if (job.finished_at === null) {
          if (job.started_at === null) {
            queued++;
          } else {
            working++;
          }
        }
      }
      let update = {};
      update[id] = {working: working, queued: queued};
      this.setState(update);
    }
  }

  async loadAll() {
    for (let repo of this.props.repos) {
      await this.loadRepo(repo.id);
      for (let build of res.data.builds) {
        if (build.finished_at) {
          continue;
        }
      }
    }
  }

  componentWillMount() {
    this.loadAll();
  }

  // TODO: render using the state
  render() {
    return (
      <div>
        {this.props.repos.map(repo => <div>{repo.id} - {repo.slug}</div>)}
      </div>
    );
  }
}
