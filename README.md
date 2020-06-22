# Reloto

> Reloto is a platform to rent and loan tools.

Currently uses GitHub Actions for CI.

Creating a new service:
1. Create directory. If a Node/TS service, can likely copy the Dockerfile, .dockerignore, .gitignore, tsconfig.json, package.json (and change appropriate fields in package.json).
2. The src directory houses the events, models, and routes directories with their appropriate test subdirectories.
3. Can also likely add the __mocks__ directory and test directory for setup, inside the src directory .
4. Add the appropriate yaml files to the infra/k8s directory. You can probably model the service off of existing files if possible. The '*-depl.yaml' files have the 'Deployment' and 'Service' configs. Make sure to adjust environment variables as necessary.
5. Add the env variables as necessary to the Kubernetes environment. Keep opsec in mind, making sure to keep these out of git.
6. Add the appropriate config to the skaffold.dev directory at the project root. Again you can probably use template.
7. Add the appropriate CI script to .github/workflows/tests.yml
8. You may need to add listeners in the other services for the event flow of your service. For example, the Orders service listens for CUD operations from the Tools service.
9. Add the proper routing config to the ingress-srv.yaml so NGINX can hit the correct endpoint.


Kubernetes Contexts

doctl is used to manage Digital Ocean cluster.

brew install doctl

to authenticate:
doctl auth init (will be prompted for api key)

add Digital Ocean kubectl cluster info
doctl kubernetes cluster kubeconfig save <cluster_name>

lists k8s contexts
kubectl config view

set current context
kubectl congid use-context <context_name>

