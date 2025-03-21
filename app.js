require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const client = require("@mailchimp/mailchimp_marketing");

const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configure Mailchimp client
client.setConfig({
  apiKey: MAILCHIMP_API_KEY,
  server: MAILCHIMP_SERVER_PREFIX,
});

// // Debugging: Log environment variables
// console.log("MAILCHIMP_LIST_ID:", MAILCHIMP_LIST_ID);
// console.log("MAILCHIMP_API_KEY:", MAILCHIMP_API_KEY);
// console.log("MAILCHIMP_SERVER_PREFIX:", MAILCHIMP_SERVER_PREFIX);
// console.log("Environment Variables:", process.env);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", async function (req, res) {
  const { fName, lName, email } = req.body;

  // Validate required fields
  if (!fName || !lName || !email) {
    res.sendFile(__dirname + "/failure.html");
  }

  try {
    const response = await client.lists.addListMember(MAILCHIMP_LIST_ID, {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: fName,
        LNAME: lName,
      },
    });

    console.log("Mailchimp API Response:", response);

    if (response.id) {
      console.log("Success: Member added successfully!");
      res.sendFile(__dirname + "/success.html");
    } else {
      console.log("Failure: Member not added.");
      res.sendFile(__dirname + "/failure.html");
    }
  } catch (error) {
    console.error("Mailchimp Error:", error.response?.body || error.message);
    res.sendFile(__dirname + "/failure.html");
  }
});

app.post("/failure", function (req, res) {
  res.redirect("/");
});

app.listen(port, function () {
  console.log(`Server is running on port: ${port}`);
});
