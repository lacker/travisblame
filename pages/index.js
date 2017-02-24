import React from 'react';
import axios from 'axios';

let ax = axios.create({
  baseURL: 'https://api.travis-ci.org/v3/',
  timeout: 20000,
});

// data is a list of lists of strings (or ints to be considered as strings)
// null is treated like ''
// each list in data should be the same length
function linify(data) {
  if (data.length === 0) {
    return [];
  }

  let columnLengths = [];
  let numColumns = data[0].length;
  for (let i = 0; i < numColumns; i++) {
    // Figure out how long column i needs to be
    // First set the minimum
    let columnLength = 8;
    for (let row of data) {
      if (row.length !== numColumns) {
        console.log(data);
        throw new Error('you should call linify with same-len cols');
      }
      columnLength = Math.max(
        columnLength,
        ('' + row[i]).length + 3
      );
    }
    columnLengths.push(columnLength);
  }

  let lines = []
  for (let row of data) {
    let line = '';
    for (let i = 0; i < columnLengths.length; i++) {
      // An inefficient reimplementation of left-pad
      let padded = '.';
      if (row[i] !== null && row[i] !== undefined) {
        padded = '' + row[i];
      }
      while (padded.length < columnLengths[i]) {
        padded = ' ' + padded;
      }
      line += padded;
    }
    lines.push(line);
  }
  return lines;
}

function preify(lines) {
  return (
    <pre>
      {lines.join('\n')}
    </pre>
  );
}

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
    }
  }

  componentWillMount() {
    this.loadAll();
  }

  // TODO: test if it works ok
  render() {
    let rows = [];
    for (let repo of this.props.repos) {
      let display = {
        slug: repo.slug,
      };
      let data = this.state[repo.id];
      if (data) {
        display.working = data.working;
        display.queued = data.queued;
        display.total = data.working + data.queued;
      }
      rows.push(display);
    }
    rows.sort((a, b) => {
      return (b.total || 0) - (a.total || 0);
    });
    return (
      <div>
        {preify(linify(
          rows.map(r => [r.slug, r.total, r.working, r.queued])
        ))}
      </div>
    );
  }
}
