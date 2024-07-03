const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// SQLite database setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// Define User model
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Define RideRequest model
const RideRequest = sequelize.define('RideRequest', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.ENUM('airport', 'railway station'),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    }
  });

// Define associations
User.hasMany(RideRequest);
RideRequest.belongsTo(User);

// Routes

// Create ride request
app.post('/api/ride-requests', async (req, res) => {
    try {
      console.log('Received request body:', req.body);
      const rideRequest = await RideRequest.create(req.body);
      res.status(201).send(rideRequest);
    } catch (error) {
      console.error('Error creating ride request:', error);
      res.status(400).json({ message: error.message });
    }
  });

// Get recent ride requests
app.get('/api/ride-requests', async (req, res) => {
    try {
      const rideRequests = await RideRequest.findAll({
        limit: 10,
        order: [['date', 'DESC']],
        attributes: ['id', 'name', 'destination', 'date']
      });
      res.json(rideRequests);
    } catch (error) {
      console.error('Error fetching ride requests:', error);
      res.status(500).json({ message: 'Error fetching ride requests', error: error.message });
    }
  });

// Search ride requests
app.get('/api/ride-requests/search', async (req, res) => {
  try {
    const { destination, date } = req.query;
    const whereClause = {};
    
    if (destination) {
      whereClause.destination = destination;
    }
    
    if (date) {
      const searchDate = new Date(date);
      whereClause.date = {
        [Op.gte]: searchDate,
        [Op.lt]: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000) // Next day
      };
    }

    const rideRequests = await RideRequest.findAll({
      where: whereClause,
      order: [['date', 'ASC']],
      attributes: ['id', 'name', 'destination', 'date']
    });
    
    res.json(rideRequests);
  } catch (error) {
    console.error('Error searching ride requests:', error);
    res.status(500).json({ message: 'Error searching ride requests', error: error.message });
  }
});

// Get ride details
app.get('/api/ride-requests/:id', async (req, res) => {
  try {
    const rideRequest = await RideRequest.findByPk(req.params.id, {
      attributes: ['id', 'name', 'phone', 'destination', 'date', 'notes']
    });
    if (rideRequest) {
      res.json(rideRequest);
    } else {
      res.status(404).json({ message: 'Ride request not found' });
    }
  } catch (error) {
    console.error('Error fetching ride details:', error);
    res.status(500).json({ message: 'Error fetching ride details', error: error.message });
  }
});

// Sync database and start server
sequelize.sync({ force: true }).then(() => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  }).catch(err => console.error('Unable to sync database:', err));