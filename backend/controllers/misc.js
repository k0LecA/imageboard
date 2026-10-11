import getLastThreadId from '../models/misc.js';

const getThreadCount = async (req,res)=>{
  try {
    const result = await getLastThreadId();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export default getThreadCount;
