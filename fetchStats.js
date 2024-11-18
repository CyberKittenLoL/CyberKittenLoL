import fetch from "node-fetch";
import { promises as fs } from "fs";
import "dotenv/config";

const token = process.env.GITHUB_TOKEN;
const owner = "YOUR_OWNER"; // Replace with the owner's username or organization name

async function getRepos(owner) {
  const url = `https://api.github.com/users/${owner}/repos`;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const repos = await response.json();
  return repos.filter((repo) => !repo.fork);
}

async function getRepoLanguages(repo) {
  const url = repo.languages_url;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  return response.json();
}

async function main() {
  const repos = await getRepos(owner);
  const languageStats = {};

  for (const repo of repos) {
    const languages = await getRepoLanguages(repo);
    for (const [language, lines] of Object.entries(languages)) {
      if (languageStats[language]) {
        languageStats[language] += lines;
      } else {
        languageStats[language] = lines;
      }
    }
  }

  const jsonData = JSON.stringify(languageStats, null, 2);
  await fs.writeFile("languageStats.json", jsonData);

  //     const readmeContent = `
  // ## Language Statistics

  // ${Object.entries(languageStats).map(([language, lines]) => `${language}: ${lines}`).join('\n')}
  //     `;

  //     await fs.writeFile('README.md', readmeContent);
}

main();
