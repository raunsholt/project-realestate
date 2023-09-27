// pages/api/taskStatus.js
import { getTaskStatus } from './generateText';

export default async function handler(req, res) {
  console.log('Task Status API Endpoint Hit'); // add this line
  await getTaskStatus(req, res);
}
