# Account Manager

This is an API based account manager that probably has security issues. Not sure, but ill find them eventually


## How it works

Everything you log into is an API, even the account manager page (API ID 0). 


When you log in to an API, you receive a token. This token is made up of your user id, a random hash allowing for multiple logins, and the api id. This token is sent to the API's site, and then is the responsibility of the API site to keep secure. 


The API site can make requests to this backend with the user's token and the API ID. This backend will verify the following on request:

* The user exists
* The session ID exists and is under the users control
* The session ID was created with the given API ID

This prevents API ID spoofing, token spoofing, and user ID spoofing.

Logging out will invalidate the token you are logged in from. This prevents the API site from accessing user information, however this does not mean the API site you were logged in to no longer has access to your information. The API site is able to get and save the following data in your account:

* Account name
* Email
* Date created

Deleting your account will remove your information from this backend, and invalidate any login tokens that exist under your account. Deletion is permanent.