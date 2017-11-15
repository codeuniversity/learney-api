# Learney API
#### Learney is a product management tool with a focus on visualisation, displaying your learning goals in a well organized tree chart and helping you to estimate the time needed for reaching your goals.

This API was written in JavaScript, using NodeJS, and basically acts as a handler for the underlying MongoDB database. That's why it is crucial to have an instance of MongoDB installed and running. Then, simply install all dependencies using `npm install` and run the script using `node index.js`.

At the moment, the API only serves the minimal amount of functions, which are important for logging in, creating users, creating learning journeys and retrieving them. Also, I've added functions for developers like `clearUsers()` and `getAllUsers()`. Those can only be run within the script.

For using the API, after you created a user, you will need to generate an API token using the `/login` endpoint. After that, you will have to pass it with every request to authenticate.

#### Below, you see a list of all functions currently supported by the API.

| Endpoint | Purpose | Request data | Method |
|---|---|---|---|
| /createUser | Creating a new user. | {'email': INSERT_HERE, 'password': INSERT_HERE, 'firstname': INSERT_HERE, 'lastname': INSERT_HERE} | POST |
| /login | Generate a token to authenticate in further requests. | {'email': INSERT_HERE, 'password': INSERT_HERE} | GET |
| /getUserDetails | Retrieve both the users account data and the basic information of their learning journeys. | {'token': INSERT_HERE} | GET |
| /createLearney | Create a new learning journey. | {'token': INSERT_HERE, 'name': INSERT_HERE, 'field': INSERT_HERE} | POST |
| /createBranch | Create a new branch within a learning journey. | {'token': INSERT_HERE, 'name': INSERT_HERE, 'learney_id': INSERT_HERE} | POST |
| /createEntry | Create a new entry within a branch. | {'token': INSERT_HERE, 'name': INSERT_HERE, 'description': INSERT_HERE, 'url': INSERT_HERE, 'branch_id': INSERT_HERE} | POST |
| /getLearney | Retrieves a specific learning journey by its ID. | {'token': INSERT_HERE, 'learney_id': INSERT_HERE} | GET |
