const jwt = require('jsonwebtoken');
const axios = require('axios');
const token = jwt.sign({ userId: 'test-user', email: 'test@example.com' }, process.env.JWT_SECRET || 'fallback-secret-change-me');
axios.post('https://codementor-ai-few5.onrender.com/api/ai', {
  code: 'print("hi")',
  language: 'python',
  action: 'explain'
}, {
  headers: { Authorization: 'Bearer ' + token }
}).then(res => {
  console.log('SUCCESS');
}).catch(err => {
  console.log('ERROR:', err.response ? err.response.data : err.message);
});
