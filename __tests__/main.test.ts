import * as github from '@actions/github';

import {parsePatch} from '../src/git';

describe('GitHub API usage', () => {
  const token = process.env.GITHUB_TOKEN as string;
  const gh = github.getOctokit(token);

  it('should get commits from a PR', async () => {
    const resp1 = await gh.request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}',
      {
        owner: 'errata-ai',
        repo: 'vale',
        pull_number: 279
      }
    );

    // context.payload.pull_request.commits_url
    const resp2 = await gh.request(`GET ${resp1.data.commits_url}`, {
      owner: 'errata-ai',
      repo: 'vale'
    });
    expect(resp2.data.length).toEqual(1);

    await Promise.all(resp2.data.map(async (commit) => {
      const resp3 = await gh.repos.getCommit({
        owner: 'errata-ai',
        repo: 'vale',
        ref: commit.sha
      });
      expect(resp3.data.files.length).toEqual(1);
    }));
  });

  it('should get modified lines from a commit', async () => {
    const resp = await gh.repos.getCommit({
      owner: 'errata-ai',
      repo: 'vale',
      // https://github.com/errata-ai/vale/pull/279
      ref: 'bd7a022c9253297cc21a3dfa0bd5fc71e56dc215'
    });

    resp.data.files.forEach(file => {
      const lines = parsePatch(file.patch);
      expect(lines).toEqual([
        329,
        330,
        331,
        332,
        333,
        334,
        335,
        336,
        337,
        338,
        339,
        340,
        341,
        342,
        343,
        344,
        345,
        346,
        347,
        348,
        349,
        350,
        351,
        352,
        353,
        354,
        355,
        356,
        357
      ]);
    });
  });
});
