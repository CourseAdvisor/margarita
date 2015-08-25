# Manual

## Margarita specifics

This section covers things to know when working with Margarita in particular.

### Root URL
The tequila API is located at https://tequila.epfl.ch/cgi-bin/tequila/ whereas
Margarita defaults to http://localhost:3000/ . Margarita is designed to be used
as a drop-in replacement for tequila. Therefore, you only need to change the base
URL in your app to chose whether you want to use tequila or Margarita.

### Margarita login
Log-in using one of the [profiles](#profiles) defined in `/profiles.json`. The
login/password combo is always username/username.

### Profiles
Margarita's main feature is to be able to simulate any EPFL user using _profiles_.
Profiles are defined in `/profiles.json` as a hash of attribute/value pairs
associated with the username like this:
```
"username": {
  "attr1": "value 1",
  "attr2": "value 2",
  ...
}
```
`username` is the name used for login. For a complete list of available attributes,
see [attributes](#attributes).


## Tequila API

This section describes the Tequila authentication API. Things described here should
work exactly the same way whether you are using Tequila or Margarita.

Note that this reflects our understanding of the API and it is not an official documentation.
Therefore, it may be incomplete or contain errors. Be sure to submit a pull request if you
find a mistake.


### Overview

This is a typical 3-way authentication procedure between the **application**,
the **user** and **tequila**.

1. The **application** asks **tequila** to create a new request. Tequila answers
with a unique token. All request attributes are defined at this step.
2. The **application** sends the **user** to a login page on **tequila** using
the token.
3. The **user** authenticates with his credentials.
4. **tequila** checks the credentials; On success, it gives the user a new key
and redirects him to the **application**.
5. The **application** uses this key to ask **tequila** for the attributes it
requested in step 1.


### Request types

During this process, GET and POST requests are used. For GET requests, parameters
are passed in the URL as a standard query string
(ie. http://my_awesome_path?param1=val1&param2=val2).

POST requests however are a bit tricky. Key/value pairs should be transmitted in
the request body as `key=value`, **one pair per line**. I don't even know if there's
a MIME type for this format but what's sure is that it is not the default encoding
on any framework. We recommend you set the `Content-Type` header to `text/plain`
and format the request body yourself.

**While tequila ignores HTTP standards anyway, DO set `Content-Type: text/plain`
in your POST request or Margarita won't be able to parse the request.**


### Attributes

Listed here are all attributes which can be requested on createrequest.

- __uniqueid__: sciper number
- __name__: last name
- __firstname__: firstname
- __unit__: section?
- __unitid__: ???
- __where__: Some sort of semantic path in reverse order (eg. IN-BA6/IN-S/ETU/EPFL/CH)
- __group__: comma separated list of groups associated to the user
- __email__: EPFL email address
- __...__ This list may be incomplete, also if someone finds an exhaustive list,
please wave a hand...

### API endpoints

---
#### POST /createrequest
##### __parameters__:
- urlaccess: url the user should be redirected to once authenticated
- request: a comma separated list of [attributes](#attributes) the application is requesting

##### __response__:
A request token in the following format:  
`key={token}` where `{token}` is a 32 bytes alphanumeric string.

---
#### GET /requestauth?key={token}
##### __parameters__:
- key: The token obtained via /createrequest

##### __response__:
A user-readable form which POSTs to /login.

---
#### POST /login
##### __parameters__:
- username
- password: The actual password on tequila, the username on margarita.
- requestkey: The key from /createrequest.  

##### __warning__: This endpoint does not use the strange encoding other POST endpoints use. Content shoud be posted as `application/x-www-form-urlencoded`
##### __response__:
On success, 302 Found with the Location header set to `{urlaccess}?key={key}` where
`{urlaccess}` is the urlaccess parameter given in /createrequest and `{key}` is a
newly generated key.  
On failure, 200 Ok and shows the same form as /requestauth

---
#### POST /fetchattributes
##### __parameters__:
- key: The key given in `/login`

##### __response__:
A list of `key=value` pairs (one per line) with the requested attributes plus
some more attributes (TODO: see exactly what those attributes mean)

---
#### GET /logout
Tequila keeps the user logged in with a cookie to bypass the /requestauth form.
`/logout` clears that cookie. On Margarita, this has no effect.
