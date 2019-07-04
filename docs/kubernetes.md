
# Minikube 


## Installation

**Installation (on Linux Mint)**

- [Install VirtualBox](https://computingforgeeks.com/install-virtualbox-on-kali-linux-linux-mint/)
- [Install and Set Up kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-linux)
- [Install Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)

*More references*

- [Problem while installing Virtualbox](https://askubuntu.com/questions/841898/problem-while-installing-virtualbox)


## KUBECTL COMMANDS

[kubectl reference](https://kubernetes.io/docs/reference/)
[kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

### KUBECTL GET PODS

`$ kubectl get pods [pod name]`
`$ kubectl get pod [pod name]`

- Lists all pods in all namespaces
- Provides the pod name, how many instances of the pod are running & ready, its status, how many times they have restarted, and their age.


### KUBECTL DESCRIBE POD

`$ kubectl describe pods [pod name]`
`$ kubectl describe pod [pod name]`

Describes detailed information about all pods or a specific pod (optional pod name argument)

### KUBECTL EXPOSE PORT

`$ kubectl expose <type name> <identifier/name> [--port=external port] [--target-port=container-port] [--type=service-type]`

Exposes a port (TCP or UDP) for a given deployment, pod, or other resource.

*Examples*

Expose specific service port
`$ kubectl expose deployment binance-bot --port=80 --type=NodePort`

Expose all pods with name binance-bot through LoadBalancer via port 80 as  binance-bot-lb
`$ kubectl expose deployment binance-bot --port=80 --target-port=80 --type=LoadBalancer --name binance-bot-lb`

### KUBECTL PORT-FORWARD

`$ kubectl port-forward <pod name> [LOCAL_PORT:REMOTE_PORT]`

Forwards one or more local ports to a pod

*Example*

`$ kubectl port-forward <pod name> binance-bot 80:8080`

### KUBECTL ATTACH

`$ kubectl attach <pod name> -c <container name>`

Attaches to a process that is already running inside an existing container (displays logs)

*Example*

`$ kubectl port-forward <pod name> binance-bot 80:8080`

### KUBECTL EXEC

`$ kubectl exec [-it] <pod name> [-c CONTAINER] <command> [args ...]`

- Executes a command in a container
- -i option will pass stdin to the container
- -t option will specify stdin as TTY

*Example*

`$ kubectl exec -ti binance-bot bash`

### KUBECTL LABEL PODS

`$ kubectl label [--owerrite] <type> KEY_1=VAL_1 KEY_2=VAL_2 ...` 

Updates the labels on a resource

*Example*

`$ kubectl label pods binance-bot healthy=false`

### KUBECTL RUN

`$ kubectl run <name> --image=image`  

Run a particular image on the cluster

*Example*

`$ kubectl run binance-bot --image=kuandrei/binance-bot --port=80`

### KUBECTL SCALE

`$ kubectl scale --replicas=replicas <pod name>`  

Scales the particular resource

*Example*

`$ kubectl scale --replicas=4 deployment/tomcat-deployment`

## Deploying the Dashboard UI

*Install*

`
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/aio/deploy/recommended/kubernetes-dashboard.yaml
$ kubectl proxy
`
[Access Web UI](http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/)


## References

[Kubernetes Tutorial](https://www.youtube.com/watch?v=gpmerrSpbHg)



