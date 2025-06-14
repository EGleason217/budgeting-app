const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const accountRoutes = require('./routes/accounts'); 
const entryRoutes = require('./routes/entries');
const projectionRoutes = require('./routes/projections');


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route handlers
app.use('/accounts', accountRoutes);
app.use('/entries', entryRoutes);
app.use('/projections', projectionRoutes);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.use('/entries', entryRoutes);
