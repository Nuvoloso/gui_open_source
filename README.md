# gui

This repository contains the source required for building the GUI (client and server). The web service provides appropriate APIs for the client to use, interfacing with other backend services as needed (kontroller, database, etc). The GUI also requires a connection to the metrics database.

`services-node` contains the web server and pass through APIs. The client code is in the `slog` directory.

## Dependencies

Development of the GUI requires a running Nuvolso deployment in a Cloud Service Provider (CSP).
As part of the deployment in the CSP, you will need to take note of the ELB hostname that is created. You will reference this hostname as part of running the GUI services locally for development.

You need to have the following installed:

-   [Node](https://nodejs.org/en/download/package-manager/) v10.16.0 or higher
-   The installation requires access to shared certificates from the [tools](https://github.com/Nuvoloso/tools) project. The Makefile will attempt to copy the certificates from the `tools` project. The Makefile assumes that the `tools` project is a peer to the top of the GUI repository in the file system. Override the `TOOLS_REPO` variable from `../tools` to wherever you have it installed if necessary. See the `tools` project [README](https://github.com/Nuvoloso/tools/blob/master/README.md) for more information.
-   To deploy a cluster, follow the instructions in [setup instructions](https://docs.google.com/document/d/14vEGmdB06FRJ2T-Y7VVs0f26R0RuibrsCSNU4uGMgqQ/edit#heading=h.g72ylbfz2wn0).

## Instructions

### Build

You need to build the project using `make` and then manually start the services.

-   Clone the project into `gui` and cd to that directory
-   `# make`

### Metrics

If you deploy your clusters from your local laptop, you can easily set up a port forward to the metrics database.

`kubectl -n nuvoloso-management port-forward metricsdb-0 5432:5432`

If you are deploying a development instance in the CSP, you may need to chain your port forwarding to the CSP instance.
The easiest way to do so is to chain a ssh command followed by a Kubernetes port forwarding command in the instance.
This example assumes the cluster is launched from an instance in the CSP.

You need to forward the default metrics port _5432_ to the instance.

`sudo ssh -i ${PEM_FILE} -L5432:localhost:5432 ubuntu@${INSTANCE_IP}`

One you are logged into the instance, you need to create a port forward to the metrics container:

`kubectl -n nuvoloso-management port-forward metricsdb-0 5432:5432`

If you are using multiple clusters, you may need to specify the context as well:

`kubectl --context dev18mgmt.k8s.local -n nuvoloso-management port-forward metricsdb-0 5432:5432`

### Service start

You can start the services with the following command, substituting _\${ELB_HOSTNAME}_ with the hostname of your ELB in the CSP deployment.

`# NODE_ENV=production API_HOST=${ELB_HOSTNAME} npm start`

The service is successfully started when the following messages are displayed:

```
2019-09-19T17:41:23+00:00 Version [77d87aa8d9dfd27a053aba245f13554ed304d14e 2019-09-18T20:47:29+0000 GUI_master:600]
2019-09-19T17:41:23+00:00 Starting service
Warning: connect.session() MemoryStore is not
designed for a production environment, as it will leak
memory, and will not scale past a single process.
2019-09-19T17:41:23+00:00 Waiting for metrics database service to be available at metricsdb/5432
2019-09-19T17:41:23+00:00 We are live on port: 8000
2019-09-19T17:41:23+00:00 Connected to API service: https://localhost:8443/api/v1
2019-09-19T17:41:23+00:00 --> Connected to metrics database
2019-09-19T17:41:23+00:00 --> Metrics database services READY
```

Available services-node environment variable configs:

| Variable  | Description                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API_PORT  | Should match whatever port number nvcentrald listens on. If none is set, services-node's API requests will not have a port set by default. Production and testing against [Deployment](https://github.com/Nuvoloso/deployment) do not need this set since Nginx will route URL to the correct port.                                                                                                             |
| API_HOST  | Point to which host services-node should make the API requests, namely the ELB hostname. If set, protocol will default to HTTPS. If none is set, default is http://localhost.                                                                                                                                                                                                                                   |
| AUTH_PORT | Most likely only needed for local development, can specify the port number the local auth service is running on. Typical setup will be running on port 5555. If none is set, services-node's API requests will not have a port set by default. Production and testing against [Deployment](https://github.com/Nuvoloso/deployment) probably won't need this set since Nginx will route URL to the correct port. |
| NODE_ENV  | Set to "production" to cause API requests to use HTTPS to interact with nvcentrald. If this is not set, HTTP is used.                                                                                                                                                                                                                                                                                              |

You can kill the service using `^C`.

Normally nodemon will be running and will detect changes in any source code and reload as needed. Otherwise you can rebuild and restart the services yourself.

## Connect to the UI:

Connect to the UI at https://localhost:8000

Default development username/password is admin/admin.

## Developing the UI

### Dependencies

See _Dependencies_ section above.

### Development server

From the slog directory, run:

`# npm start`

You can run both (services-node and development server) in parallel on the same system. The standard webservice runs on port 8000 and the development server runs on port 3000 without HTTPS (http://localhost:3000)

If you want to connect to the webservices for debugging from Vscode or other IDE, run:

`# npm run debug`

### Available environment variable configs:

| Variable | Description                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HOST     | Host the web browser points to. If set, protocol will default to HTTPS, assuming an external AWS deployment. If none is set, default is localhost.                                                                 |
| PORT     | Will default to 3000 if both PORT and HOST are not set. If HOST is set, PORT will not have a default since some external deployments won't use a port number.                                                      |
| NODE_ENV | Node will set this to "production" by default in production deployments, otherwise this is not set in local development. It is unlikely this needs to be set, but is available for testing specific circumstances. |

## Functional tests

### Testing framework (Cypress)

We leverage the testing framework Cypress (https://cypress.io). The tool is installed as part of the NPM installation.

You will need to make sure your environment is configured correctly by updating the one in place or passing variables on the command line. You can update `cypress.json` file in place or provide an alternate configuration file via the command line. Example

`./node_modules/.bin/cypress open -e "NUVO_MANAGEMENT_HOST=$MANAGEMENT_HOST" --config-file ./cypress_dev18.json`

You can launch the tool in an interactive mode or in batch mode.

### Browse and run the tests individually

`# npm run cypress:open`

There is a small window that opens where you can select a specific test to run.

### Run all tests

`# npm run cypress:run`

Runs all tests as specified by 'testFiles' in the cypress configuration file (`cypress.json`).

### Environment variables

The default environment variables are set in the `cypress.json` config file.

There are several environmental variables that have to be configured in 'cypress.json' or passed through the command line. They are

| VARIABLE                | EXAMPLE                                   | DESCRIPTION                                                 |
| ----------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| "AWS_ACCESS_KEY_ID"     | "ABCD5BLNJHKUBYKGABCD"                    | AWS access key id                                           |
| "AWS_SECRET_ACCESS_KEY" | "ABCDnsOz8GIBByvipNse7f/7aQ0hD9v5V9kABCD" | AWS secret key                                              |
| "KOPS_STATE_STORE"      | "s3://kops-abcd-nuvoloso"                 | KOPS state store used for k8s clusters                      |
| "NUVO_CY_CLUSTER_APP"   | "abcdapp.k8s.local"                       | name of application cluster in k8s                          |
| "NUVO_CY_CLUSTER_MGMT"  | "abcdmgmt.k8s.local"                      | name of management cluster in k8s                           |
| "NUVO_CY_SCP_REMOTE"    | "ubuntu@test"                             | identify of remote user used for scp command                |
| "NUVO_CY_SCP"           | "scp -i ~/aws/test.pem"                   | scp command with any dependent ssh options                  |
| "NUVO_CY_SSH"           | "ssh -i ~/aws/test.pem ubuntu@test"       | ssh command with any depend ssh options and the target user |

When running the tests you can use one or two k8s clusters. When using one k8s cluster, the same name should be used for `NUVO_CY_CLUSTER_APP` and `NUVO_CY_CLUSTER_MGMT`. If you have two Kubernetes clusters deployed, you should provide unique names for those two environment variables.

### Run individual tests from the command line

The cypress CLI accepts a `--spec` argument to restrict which tests are run.

The standard set of tests needs to be run sequentially. The tests are named/organized so they are run in the correct order.

#### Testing with a real cluster

These test use the built-in users (Tenant Admin, Normal Account). If you are running a development server for the GUI locally, you launch with

`# ./node_modules/.bin/cypress open`

If you want to tests against a deployed server in a cloud provider, you need to specify the `baseUrl` environment variable.

`# ./node_modules/.bin/cypress open -e 'baseUrl=https://a45fcc383dbd311e98ad20a20936909f-582624056us-west-2.elb.amazonaws.com`

#### Test deployment of a new cluster

There are a set of test files in

`gui/slog/cypress/integration/nuvoloso/cluster_and_app`

These tests will run through the same sequence a customer would at initial startup

-   Create a CSP domain and credential
-   Create a cluster
-   Download and apply the cluster YAML
-   Create a protection domain
-   Create a pool for the account
-   Download and apply the account secret
-   Deploy a test application in the cluster (the dynamic PVC YAML is hardcoded as it doesn't change)

You run the tests in the order they are deployed in the directory.

-   00_validate_access.spec.js
-   01_deploy_cluster_pools.spec.js
-   02_create_application.spec.js

Other tests may run after those initial 3 and should be numbered appropriately if there is an ordering requirement.

From the `slog` folder start cypress as follows:

`./node_modules/.bin/cypress open -c "testFiles=./nuvoloso/cluster_and_app/**"`

Or

`./node_modules/.bin/cypress run -c "testFiles=./nuvoloso/cluster_and_app/**"`

Run the commands in order from the cypress window.

### Redux logging

There is support for the Chrome extension Redux DevTools in our code base. See

https://github.com/zalmoxisus/redux-devtools-extension.

Install the extension and enable it as needed. The client has the support turned on by default.

Alternatively you can use the redux logging package by enabling through the launch point. All logging will happen in the browser's console output.

`# REACT_APP_NUVO_GUI_LOGGING=log npm start`

## Dist/Builds

For production builds

`# make build`

To start the web server in production, run:

`# npm run serve`

## Jenkins Build Job Configuration

The details of the Jenkins job configuration can be found here:
[gui Repo GitHub and Jenkins Job Configuration Details](https://docs.google.com/document/d/1lUs_W_jFkfxt5LAna9sVqhaJRO9sZjoRBifJd9h-cmY)

## Making containers

There are two options in Jenkins.

[deployment-parameterized-flex](https://jenkins.nuvoloso.com:8443/job/deployment-parameterized-flex/): Specify specific builds for all projects.

[deployment_gui](https://jenkins.nuvoloso.com:8443/job/deployment_gui/): Specify a specific GUI build and picks up latest successful master builds for all other projects.

You can set the environment variable CONTAINER_TAG and it will be picked up by the build process. The same mechanism
is used for kontroller/Storelandia builds.
