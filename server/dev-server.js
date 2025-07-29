import app from './api/server.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local Dev Server running on port ${PORT}`);
});
