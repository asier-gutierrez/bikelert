# Bikelert

The code located in this repository contains Bikealert project's codebase.

# Limitations

API has not been secured yet with any secure protocol (HTTPS) and/or with usage limitations or authentication/authorization.

# How to use it

Before running or testing application, do not forget to install all
app required libraries by running the following command at the command
line interface.

```
npm install
```

## Running

Check environment variables section before running this.
```
npm run start
```

## Testing

Check environment variables section before running this.
```
npm run test
```

# Environment variables

Service can be ran including a file named service.env at the root folder or even setting
console/terminal environment variables before starting the application.

In case console/terminal environment variables want to be used
there is a variable named *from_env* that must have any value.

service.env variables must follow the format below:
```
<variable_name>=<value>
<variable_name>=<value>
...
```

## V1 Environment variables
```
watson_visual_recognition_version=
watson_visual_recognition_apikey=
watson_visual_recognition_classifier_id=
watson_visual_recognition_positive_class_name=
mongo_connection_string=
test_mongo_connection_string=
test_device_id=
test_device_cred1=
test_device_cred2=
PORT=
```