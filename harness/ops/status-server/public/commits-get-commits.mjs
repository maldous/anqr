import { getCommits } from '../lib/commits.js';

const commitsCacheAge = 1000 * 60 * 5;

const handler = async (req, res) => {
  try {
    const commits = await getCommits();
    res.setHeader('Cache-Control', `public, max-age=${commitsCacheAge / 1000}`);
    res.status(200).json(commits);
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
};

export default handler;
