const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
// const request = require("request");
const client = require("@mailchimp/mailchimp_marketing");
const port = 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
client.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", async function (req, res) {
  // extracts fName, lName and email fron the request body
  const { fName, lName, email } = req.body;

  // Validate required fields
  if (!fName || !lName || !email) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Add member to Mailchimp list
    const response = await client.lists.batchListMembers(
      process.env.MAILCHIMP_LIST_ID,
      {
        members: [
          {
            email_address: email,
            status: "subscribed",
            merge_fields: {
              FNAME: fName,
              LNAME: lName,
            },
          },
        ],
      }
    );

    console.log("Mailchimp API Response:", response);

    // Check if the API call was successful
    if (response.new_members && response.new_members.length > 0) {
      console.log("Success: Member added successfully!");
      res.sendFile(__dirname + "/success.html");
    } else {
      console.log("Failure: Member not added.");
      res.sendFile(__dirname + "/failure.html");
    }
  } catch (error) {
    console.error("Error:", error);
    res.sendFile(__dirname + "/failure.html");
  }
});
app.post("/failure", function (req, res) {
  res.redirect("/");
});
// app.post("/", function (req, res) {
//   const fName = req.body.fName;
//   const lName = req.body.lName;
//   const email = req.body.email;

//   const data = {
//     members: [
//       {
//         email_address: email,
//         status: "subscribed",
//         merge_fields: {
//           FNAME: fName,
//           LNAME: lName,
//         },
//       },
//     ],
//   };
//   const jsonData = JSON.stringify(data);

//   const url = "https://us16.api.mailchimp.com/3.0/lists/1eb70b975c";
//   const options = {
//     method: "POST",
//     auth: "suraj:453888ebbc43dc1f672f4754745402df-us16",
//   };

//   const request = https.request(url, options, function (response) {
//     response.on("data", function (data) {
//       console.log(JSON.parse(data));
//     });
//   });
//   request.write(jsonData);
//   request.end();
// });

app.listen(port, function () {
  console.log("Server is running on port: 3000");
});

// list id - 1eb70b975c
// api key = 453888ebbc43dc1f672f4754745402df-us16
