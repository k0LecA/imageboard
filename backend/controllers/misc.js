import getLastThreadId from '../models/misc.js';

const getThreadCount = async (req, res) => {
  try {
    const threadCount = await getLastThreadId();
    return res.status(200).json(threadCount);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default getThreadCount;
