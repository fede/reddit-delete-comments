# reddit-delete-comments
Silly node script to delete comments older than _days_

## Setup
Replace the variables accordingly
variable name | accepted values | description
-|-|-
TOKEN|Use the token from the App, you will need to spy your traffic to get the auth bearer token | User session token.
USERNAME|Reddit username|The API requires the username to retrieve the list
DAYS|Number|Amount of days that the comment should be older than to be deleted.
PAGINATION_LIMIT|Number|Comments come paginated, if you are having rate limit issues, you can lower this number.
