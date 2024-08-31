const express  = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userRoutes = require("./routes/userRoutes");
const expensesRoutes = require("./routes/expensesRoute");
const dashboardRoutes = require("./routes/dashboardRoute");




const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors('*'));

mongoose.connect(process.env.MONGODB_URI, {

    // useUnifiedTopology: true,
    // useNewUrlParser: true
  })
  .then(() => {
    console.log('Connected to MongoDB SuccessFully');
    app.listen(process.env.PORT, () => {
      console.log(`Server listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB', error);
  });


  app.get("/",(req,res)=>{
    res.json({"welcome":"Hi Atheel we are welcome"});
  });


  app.use('/auth',userRoutes);
  app.use('/expense',expensesRoutes);
  app.use('/dashboard',dashboardRoutes);
  