
# Minikube 


## Installation

**Installation (on Linux Mint)**

- [Install VirtualBox](https://computingforgeeks.com/install-virtualbox-on-kali-linux-linux-mint/)
- [Install and Set Up kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-linux)
- [Install Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)

*More references*

- [Problem while installing Virtualbox](https://askubuntu.com/questions/841898/problem-while-installing-virtualbox)

## Minikube Setup Commands

- Linux: curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
- MacOS: curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/darwin/amd64/kubectl
- Windows: curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.8.0/bin/windows/amd64/kubectl.exe
- chmod +x ./kubectl
- sudo mv ./kubectl /usr/local/bin/kubectl
- kubectl version
- Linux: curl -Lo minikube https://storage.googleapis.com/minikube/releases/v0.23.0/minikube-linux-amd64 && chmod +x minikube && sudo mv minikube /usr/local/bin/
- macOS: curl -Lo minikube https://storage.googleapis.com/minikube/releases/v0.23.0/minikube-darwin-amd64 && chmod +x minikube && sudo mv minikube /usr/local/bin/
- minikube start
- kubectl run hello-minikube --image=gcr.io/google_containers/echoserver:1.4 --port=8080
- kubectl expose deployment hello-minikube --type=NodePort
- kubectl get pod
- curl $(minikube service hello-minikube --url)
- kubectl delete deployment hello-minikube
- minikube stop


## Basic Kubectl Commands

- kubectl get pods
- kubectl get pods [pod name]
- kubectl expose <type name> <identifier/name> [—port=external port] [—target-port=container-port [—type=service-type]
- kubectl port-forward <pod name> [LOCAL_PORT:]REMOTE_PORT]
- kubectl attach <pod name> -c <container>
- kubectl exec [-it] <pod name> [-c CONTAINER] — COMMAND [args…]
- kubectl label [—overwrite] <type> KEY_1=VAL_1 ….
- kubectl run <name> —image=image
- kubectl scale --replicas=replicas <pod name>


[kubectl reference](https://kubernetes.io/docs/reference/)

[kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)


## Creating a Secret with a Docker Config

[reference](https://kubernetes.io/docs/concepts/containers/images/#creating-a-secret-with-a-docker-config)

`
$ kubectl create secret docker-registry $SECRETNAME \
    --docker-username=$USERNAME \
    --docker-password=$PW \
    --docker-email=$EMAIL
`

After that add to deployment.yaml:

```
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  containers:
  - name: myapp
    image: $IMAGE
  imagePullSecrets:
  - name: $SECRETNAME
```


## Deploying the Dashboard UI

*Install*

`
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/aio/deploy/recommended/kubernetes-dashboard.yaml
$ kubectl proxy
`
[Access Web UI](http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/)


## References

[Kubernetes Tutorial](https://www.youtube.com/watch?v=gpmerrSpbHg)



