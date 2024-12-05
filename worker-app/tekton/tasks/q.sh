#!/bin/bash

tkn taskrun delete tr-get-jenkinsfile
sleep 15
oc apply -f ./tekton/tasks/get-jenkinsfile-task.yaml 
oc apply -f ./tekton/tasks/tr_get-jenkinsfile.yaml