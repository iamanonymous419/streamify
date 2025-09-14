# Streamify - Kubernetes Minikube Project

A full-stack application deployed on Kubernetes using Minikube, featuring a frontend, backend API, and MongoDB database with horizontal pod autoscaling and ingress routing.

## Project Structure

```
├── README.md
├── backend/
│   ├── config.yaml         # Backend configuration
│   ├── dep.yaml            # Backend deployment
│   ├── hpa.yaml            # Horizontal Pod Autoscaler
│   ├── secrets.yaml        # Backend secrets
│   └── svc.yaml            # Backend service
├── database/
│   ├── dep.yaml            # MongoDB deployment
│   ├── pv.yaml             # Persistent Volume
│   ├── pvc.yaml            # Persistent Volume Claim
│   ├── secrets.yaml        # Database secrets
│   └── svc.yaml            # Database service
├── frontend/
│   ├── config.yaml         # Frontend configuration
│   ├── dep.yaml            # Frontend deployment
│   ├── hpa.yaml            # Horizontal Pod Autoscaler
│   └── svc.yaml            # Frontend service
├── ingress.yaml            # Ingress controller configuration
└── namespace.yaml          # Namespace definition
```

## Prerequisites

Before running this project, you need to install the following tools:

### 1. Install Docker

**Ubuntu/Debian:**
```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Restart to apply group changes
newgrp docker
```

**macOS:**
```bash
# Install using Homebrew
brew install --cask docker

# Or download from: https://docs.docker.com/desktop/mac/install/
```

**Windows:**
Download and install Docker Desktop from: https://docs.docker.com/desktop/windows/install/

### 2. Install kubectl

**Ubuntu/Debian:**
```bash
# Download kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Make executable and move to PATH
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify installation
kubectl version --client
```

**macOS:**
```bash
# Using Homebrew
brew install kubectl

# Or using curl (same as Linux)
```

**Windows:**
```powershell
# Using Chocolatey
choco install kubernetes-cli

# Or download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
```

### 3. Install Minikube

**Ubuntu/Debian:**
```bash
# Download minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install minikube
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

**macOS:**
```bash
# Using Homebrew
brew install minikube

# Or using curl
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube
```

**Windows:**
```powershell
# Using Chocolatey
choco install minikube

# Or download installer from: https://minikube.sigs.k8s.io/docs/start/
```

## Setup and Deployment

### 1. Start Minikube

```bash
# Start minikube with recommended settings
minikube start --driver=docker --memory=4096 --cpus=2

# Verify minikube is running
minikube status
```

### 2. Enable Required Addons

```bash
# Enable metrics server for HPA
minikube addons enable metrics-server

# Enable ingress controller
minikube addons enable ingress

# Verify addons are enabled
minikube addons list
```

### 3. Deploy the Application

Navigate to your project directory and deploy the components in order:

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Deploy database components
kubectl apply -f database/

# Deploy backend components
kubectl apply -f backend/

# Deploy frontend components  
kubectl apply -f frontend/

# Deploy ingress
kubectl apply -f ingress.yaml
```

### 4. Verify Deployment

Check if all components are running:

```bash
# Check all resources in streamify namespace
kubectl get all -n streamify

# Check ingress
kubectl get ingress -n streamify

# Check horizontal pod autoscalers
kubectl get hpa -n streamify

# Check persistent volumes
kubectl get pv,pvc -n streamify
```

Expected output should show:
- Backend deployment: 5/5 pods ready
- Frontend deployment: 6/6 pods ready  
- MongoDB deployment: 1/1 pod ready
- All services with ClusterIP addresses
- HPA monitoring CPU and memory metrics

### 5. Access the Application

#### Option 1: Port Forwarding (Recommended for local development)
```bash
# Forward ingress controller port
sudo -E kubectl port-forward --namespace ingress-nginx service/ingress-nginx-controller 80:80

# Access application at http://localhost
```

#### Option 2: Minikube Tunnel
```bash
# In a separate terminal, run:
minikube tunnel

# Get ingress IP
kubectl get ingress -n streamify
```

#### Option 3: NodePort (if ingress not working)
```bash
# Expose frontend service as NodePort
kubectl patch svc frontend-service -n streamify -p '{"spec":{"type":"NodePort"}}'

# Get service URL
minikube service frontend-service -n streamify --url
```

## Monitoring and Troubleshooting

### Check Application Status

```bash
# View pod logs
kubectl logs -f deployment/backend-deployment -n streamify
kubectl logs -f deployment/frontend-deployment -n streamify
kubectl logs -f deployment/mongodb-deployment -n streamify

# View logs from specific pod
kubectl logs <pod-name> -n streamify

# View logs from all pods with label
kubectl logs -l app=backend -n streamify --all-containers=true

# Describe resources for troubleshooting
kubectl describe deployment backend-deployment -n streamify
kubectl describe pod <pod-name> -n streamify

# Check HPA metrics
kubectl describe hpa -n streamify
```

### Application Logs Monitoring

```bash
# Stream logs from all backend pods
kubectl logs -f -l app=backend -n streamify --all-containers=true --prefix=true

# Stream logs from all frontend pods
kubectl logs -f -l app=frontend -n streamify --all-containers=true --prefix=true

# Stream logs from MongoDB
kubectl logs -f -l app=mongodb -n streamify

# Get logs from last hour
kubectl logs --since=1h deployment/backend-deployment -n streamify

# Get logs with timestamps
kubectl logs --timestamps=true deployment/backend-deployment -n streamify

# Get previous container logs (useful for crashed pods)
kubectl logs deployment/backend-deployment -n streamify --previous

# Tail last 100 lines from all pods
kubectl logs --tail=100 -l app=backend -n streamify --all-containers=true
```

### View Configurations and Secrets

```bash
# View config maps
kubectl get configmap -n streamify
kubectl describe configmap <configmap-name> -n streamify

# View secrets (base64 encoded)
kubectl get secrets -n streamify
kubectl describe secret <secret-name> -n streamify

# Decode secret values
kubectl get secret <secret-name> -n streamify -o jsonpath="{.data.<key>}" | base64 --decode
```

### Export Configurations and Secrets in YAML

```bash
# Export all config maps to YAML
kubectl get configmap -n streamify -o yaml > configmaps-backup.yaml

# Export specific config map
kubectl get configmap backend-config -n streamify -o yaml > backend-config.yaml
kubectl get configmap frontend-config -n streamify -o yaml > frontend-config.yaml

# Export all secrets to YAML (base64 encoded)
kubectl get secrets -n streamify -o yaml > secrets-backup.yaml

# Export specific secrets
kubectl get secret backend-secret -n streamify -o yaml > backend-secret.yaml
kubectl get secret database-secret -n streamify -o yaml > database-secret.yaml

# Export with clean output (removes metadata)
kubectl get configmap backend-config -n streamify -o yaml --export > backend-config-clean.yaml 2>/dev/null || kubectl get configmap backend-config -n streamify -o yaml | kubectl neat > backend-config-clean.yaml

# View config map contents in readable format
kubectl get configmap backend-config -n streamify -o yaml | yq '.data'
kubectl get configmap frontend-config -n streamify -o yaml | yq '.data'

# View secret contents (decoded)
kubectl get secret backend-secret -n streamify -o json | jq -r '.data | map_values(@base64d)'
kubectl get secret database-secret -n streamify -o json | jq -r '.data | map_values(@base64d)'
```

### Example Config Map and Secret YAML Structure

**Backend Config Map:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: streamify
data:
  PORT: "5001"
  MONGO_URI: "mongodb://mongoadmin:securepass@mongodb-service:27017/streamify?authSource=admin"
  STEAM_API_KEY: "YOUR_STEAM_API_KEY"
  NODE_ENV: "production"
```

**Backend Secrets:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
  namespace: streamify
type: Opaque
data:
  STEAM_API_SECRET: YOUR_BASE64_ENCODED_STEAM_API_SECRET
  JWT_SECRET_KEY: YOUR_BASE64_ENCODED_JWT_SECRET_KEY
```

**To decode secret values manually:**
```bash
# Decode Steam API Secret
kubectl get secret backend-secrets -n streamify -o jsonpath="{.data.STEAM_API_SECRET}" | base64 --decode

# Decode JWT Secret Key
kubectl get secret backend-secrets -n streamify -o jsonpath="{.data.JWT_SECRET_KEY}" | base64 --decode

# View all decoded secrets at once
kubectl get secret backend-secrets -n streamify -o json | jq -r '.data | map_values(@base64d)'
```

**To create base64 encoded values for secrets:**
```bash
# Encode your actual values
echo -n "your-steam-api-secret" | base64
echo -n "your-jwt-secret-key" | base64

# Example of applying secrets with actual values
echo -n "sk_live_your_steam_secret" | base64
# Output: c2tfbGl2ZV95b3VyX3N0ZWFtX3NlY3JldA==

echo -n "your-super-secret-jwt-key-here" | base64  
# Output: eW91ci1zdXBlci1zZWNyZXQtand0LWtleS1oZXJl
```

### Scale Deployments Manually

```bash
# Scale backend
kubectl scale deployment backend-deployment --replicas=3 -n streamify

# Scale frontend
kubectl scale deployment frontend-deployment --replicas=4 -n streamify
```

## Performance Testing

To test horizontal pod autoscaling:

```bash
# Generate load on backend
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh

# Inside the pod, run:
while true; do wget -q -O- http://backend-service.streamify.svc.cluster.local:5001/; done
```

Watch HPA scaling in another terminal:
```bash
kubectl get hpa -n streamify --watch
```

## Cleanup

### Remove Application Resources

```bash
# Delete all application resources
kubectl delete -f ingress.yaml
kubectl delete -f frontend/
kubectl delete -f backend/
kubectl delete -f database/
kubectl delete -f namespace.yaml

# Verify deletion
kubectl get all -n streamify
```

### Stop Minikube

```bash
# Stop minikube cluster
minikube stop

# Delete minikube cluster (optional - removes all data)
minikube delete

# Remove minikube completely (optional)
minikube delete --all --purge
```

## Common Issues and Solutions

### 1. Pods in Pending State
```bash
# Check node resources
kubectl describe nodes

# Check if PVCs are bound
kubectl get pvc -n streamify
```

### 2. Ingress Not Working
```bash
# Check ingress controller status
kubectl get pods -n ingress-nginx

# Restart ingress controller if needed
kubectl rollout restart deployment/ingress-nginx-controller -n ingress-nginx
```

### 3. Metrics Server Issues
```bash
# Check metrics server
kubectl get deployment metrics-server -n kube-system

# Get metrics manually
kubectl top nodes
kubectl top pods -n streamify
```

### 4. Database Connection Issues
```bash
# Check MongoDB logs
kubectl logs deployment/mongodb-deployment -n streamify

# Test database connectivity
kubectl exec -it deployment/backend-deployment -n streamify -- nc -zv mongodb-service 27017
```

## Architecture Overview

- **Frontend**: Web application served on port 80
- **Backend**: API service running on port 5001  
- **Database**: MongoDB on port 27017 with persistent storage
- **Load Balancing**: Ingress controller routes traffic
- **Auto Scaling**: HPA monitors CPU/memory and scales pods automatically
- **Storage**: Persistent volumes ensure data persistence

## Resource Limits

Current HPA configuration:
- **Backend**: 1-5 replicas, scales at 50% CPU or 70% memory
- **Frontend**: 2-6 replicas, scales at 70% CPU or 75% memory

Adjust these values in the respective `hpa.yaml` files as needed for your workload.