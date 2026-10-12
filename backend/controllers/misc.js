import getLastThreadId from '../models/misc.js';

const getThreadCount = async (req, res, next) => {
  try {
    const threadCount = await getLastThreadId();
    return res.status(200).json({ data: threadCount });
  } catch (error) {
    return next(error);
  }
};

export default getThreadCount;
