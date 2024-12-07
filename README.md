## Jenkins to Tekton Pipelines using LLM with InstructLab and OpenShift AI

This repo provides a gitops based implementation of a demo using a Tekton pipeline that calls LLM models that would help migrating your Jenkins pipeline from a Jenkinsfile to close similarity Tekton pipeline implementation. 

### Provisioning

Clone this or user the raw files url if preferred, then assuming a fresh install of OpenShift run the first command to install the Red Hat GitOps operator:

```
oc apply -k gitops/manifests/operators/openshift-gitops-operator/overlays/latest
```

Once the operator is installed, we use the App of Apps pattern to initiate the install of all other operators, including the creation of the pipeline and other components needed for the demo. Notice this might take a while to finish the sync and install everything.

```
oc apply -k gitops/manifests/cluster/bootstrap/base
```

### Idea and execution

The execution workflow consists in ....
