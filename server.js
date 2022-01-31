"use strict";

// const app = require("./app");
// const { PORT } = require("./config");

// app.listen(PORT, function () {
//   // console.log(`Started on http://localhost:${PORT}`);
// });


app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});