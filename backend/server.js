require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

const port = Number(process.env.PORT) || 3000;

connectToDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });
