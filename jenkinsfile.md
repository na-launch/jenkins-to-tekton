# Jenkins Pipeline 

A **Jenkins pipeline** is a set of automated processes in Jenkins, a popular open-source automation server, that allows you to define the stages and steps of your software delivery process (like building, testing, and deploying code) in a continuous integration/continuous delivery (CI/CD) pipeline. Jenkins pipelines are used to automate the workflow of building, testing, and deploying applications in a repeatable, efficient, and consistent manner.

There are two main types of Jenkins pipelines:

### 1. **Declarative Pipeline:**
   - This is the simpler, structured way to define your pipeline using a predefined syntax.
   - It uses a more human-readable syntax and is more suited for users who want to focus on simplicity and standardization.
   - Example of a declarative pipeline:
   
     ```groovy
     pipeline {
         agent any
         
         stages {
             stage('Build') {
                 steps {
                     echo 'Building...'
                 }
             }
             stage('Test') {
                 steps {
                     echo 'Running tests...'
                 }
             }
             stage('Deploy') {
                 steps {
                     echo 'Deploying...'
                 }
             }
         }
     }
     ```

### 2. **Scripted Pipeline:**
   - This is more flexible and powerful, written in Groovy (the language Jenkins uses).
   - It allows for more complex logic and control flow, giving developers more freedom to customize the pipeline.
   - Example of a scripted pipeline:
   
     ```groovy
     node {
         stage('Build') {
             echo 'Building...'
         }
         stage('Test') {
             echo 'Running tests...'
         }
         stage('Deploy') {
             echo 'Deploying...'
         }
     }
     ```

### Key Concepts in Jenkins Pipelines:
- **Agent**: Defines where the pipeline runs (e.g., on any available node, or on a specific machine).
- **Stages**: A sequence of phases in the pipeline (e.g., build, test, deploy) where specific tasks are performed.
- **Steps**: The smallest unit of work within a stage. They could be commands like shell scripts, Jenkins-specific commands, or invoking external tools.
- **Post**: A block that defines actions (such as cleanup, notifications, etc.) that are performed after the pipeline finishes.

### Benefits of Using Jenkins Pipelines:
- **Automation**: Automates the entire process from code commit to deployment, improving consistency and speed.
- **Versioned Pipeline**: The pipeline itself can be version-controlled (e.g., stored in the same repository as the code), which helps track changes.
- **Declarative Syntax**: The declarative pipeline syntax is simpler and easier to understand, reducing the learning curve for new users.
- **Extensibility**: Jenkins has a rich ecosystem of plugins that integrate with various tools (like Docker, Kubernetes, cloud platforms, etc.).

In summary, Jenkins pipelines are used to streamline the software delivery process, automate tasks, and ensure more reliable builds and deployments.

# Using a Jenkinsfile

This section builds on the information covered in
[Getting started with Pipeline](../getting-started)
and introduces more useful steps, common patterns, and demonstrates some
non-trivial `Jenkinsfile` examples.

Creating a `Jenkinsfile`, which is checked into source control
footnote:scm[https://en.wikipedia.org/wiki/Source_control_management],
provides a number of immediate benefits:

* Code review/iteration on the Pipeline
* Audit trail for the Pipeline
* Single source of truth
  footnote:[https://en.wikipedia.org/wiki/Single_Source_of_Truth]
  for the Pipeline, which can be viewed and edited by multiple members of the project.

Pipeline supports [two syntaxes](../syntax), Declarative (introduced in
Pipeline 2.5) and Scripted Pipeline. Both of which support building continuous
delivery pipelines. Both may be used to define a Pipeline in either the web UI
or with a `Jenkinsfile`, though it’s generally considered a best practice to
create a `Jenkinsfile` and check the file into the source control repository.

## Creating a Jenkinsfile

As discussed in the
[Defining a Pipeline in SCM](../getting-started#defining-a-pipeline-in-scm),
a `Jenkinsfile` is a text file that contains the definition of a Jenkins
Pipeline and is checked into source control. Consider the following Pipeline
which implements a basic three-stage continuous delivery pipeline.

```pipeline
// Declarative //
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}
// Script //
node {
    stage('Build') {
        echo 'Building....'
    }
    stage('Test') {
        echo 'Testing....'
    }
    stage('Deploy') {
        echo 'Deploying....'
    }
}
```

Not all Pipelines will have these same three stages, but it is a good starting
point to define them for most projects. The sections below will demonstrate the
creation and execution of a simple Pipeline in a test installation of Jenkins.

<dl><dt><strong>📌 NOTE</strong></dt><dd>

It is assumed that there is already a source control repository set up for
the project and a Pipeline has been defined in Jenkins following
[these instructions](getting-started#defining-a-pipeline-in-scm).
</dd></dl>

Using a text editor, ideally one which supports
[Groovy](http://groovy-lang.org)
syntax highlighting, create a new `Jenkinsfile` in the root directory of the
project.

The Declarative Pipeline example above contains the minimum necessary structure
to implement a continuous delivery pipeline. The &lt;&lt;syntax#agent, agent
directive>>, which is required, instructs Jenkins to allocate an executor and
workspace for the Pipeline. Without an `agent` directive, not only is the
Declarative Pipeline not valid, it would not be capable of doing any work! By
default the `agent` directive ensures that the source repository is checked out
and made available for steps in the subsequent stages.

The [stages directive](syntax#stages), and [steps directives](syntax#steps)
are also required for a valid Declarative Pipeline as they instruct Jenkins
what to execute and in which stage it should be executed.

For more advanced usage with Scripted Pipeline, the example above `node` is
a crucial first step as it allocates an executor and workspace for the Pipeline.
In essence, without `node`, a Pipeline cannot do any work! From within `node`,
the first order of business will be to checkout the source code for this
project.  Since the `Jenkinsfile` is being pulled directly from source control,
Pipeline provides a quick and easy way to access the right revision of the
source code

```pipeline
// Script //
node {
    checkout scm // ①
    /* .. snip .. */
}
// Declarative not yet implemented //
```
1. The `checkout` step will checkout code from source control; `scm` is a
special variable which instructs the `checkout` step to clone the specific
revision which triggered this Pipeline run.

### Build

For many projects the beginning of "work" in the Pipeline would be the "build"
stage. Typically this stage of the Pipeline will be where source code is
assembled, compiled, or packaged. The `Jenkinsfile` is **not** a replacement for an
existing build tool such as GNU/Make, Maven, Gradle, etc, but rather can be
viewed as a glue layer to bind the multiple phases of a project’s development
lifecycle (build, test, deploy, etc) together.

Jenkins has a number of plugins for invoking practically any build tool in
general use, but this example will simply invoke `make` from a shell step
(`sh`).  The `sh` step assumes the system is Unix/Linux-based, for
Windows-based systems the `bat` could be used instead.

```pipeline
// Declarative //
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'make' // ①
                archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true // ②
            }
        }
    }
}
// Script //
node {
    stage('Build') {
        sh 'make' // ①
        archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true // ②
    }
}
```
1. The `sh` step invokes the `make` command and will only continue if a
zero exit code is returned by the command. Any non-zero exit code will fail the
Pipeline.
2. `archiveArtifacts` captures the files built matching the include pattern
(`***/target/**.jar`) and saves them to the Jenkins controller for later retrieval.

<dl><dt><strong>💡 TIP</strong></dt><dd>

Archiving artifacts is not a substitute for using external artifact
repositories such as Artifactory or Nexus and should be considered only for
basic reporting and file archival.
</dd></dl>

### Test

Running automated tests is a crucial component of any successful continuous
delivery process. As such, Jenkins has a number of test recording, reporting,
and visualization facilities provided by a
[number of plugins](https://plugins.jenkins.io/?labels=report).
At a fundamental level, when there are test failures, it is useful to have
Jenkins record the failures for reporting and visualization in the web UI.  The
example below uses the `junit` step, provided by the
plugin:junit[JUnit plugin].

In the example below, if tests fail, the Pipeline is marked "unstable", as
denoted by a yellow ball in the web UI. Based on the recorded test reports,
Jenkins can also provide historical trend analysis and visualization.

```pipeline
// Declarative //
pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
                /* `make check` returns non-zero on test failures,
                * using `true` to allow the Pipeline to continue nonetheless
                */
                sh 'make check || true' // ①
                junit '**/target/*.xml' // ②
            }
        }
    }
}
// Script //
node {
    /* .. snip .. */
    stage('Test') {
        /* `make check` returns non-zero on test failures,
         * using `true` to allow the Pipeline to continue nonetheless
         */
        sh 'make check || true' // ①
        junit '**/target/*.xml' // ②
    }
    /* .. snip .. */
}
```
1. Using an inline shell conditional (`sh 'make check || true'`) ensures that the
`sh` step always sees a zero exit code, giving the `junit` step the opportunity
to capture and process the test reports. Alternative approaches to this are
covered in more detail in the [handling-failure](#handling-failure) section below.
2. `junit` captures and associates the JUnit XML files matching the inclusion
pattern (`***/target/**.xml`).

### Deploy

Deployment can imply a variety of steps, depending on the project or
organization requirements, and may be anything from publishing built artifacts
to an Artifactory server, to pushing code to a production system.

At this stage of the example Pipeline, both the "Build" and "Test" stages have
successfully executed. In essence, the "Deploy" stage will only execute
assuming previous stages completed successfully, otherwise the Pipeline would
have exited early.

```pipeline
// Declarative //
pipeline {
    agent any

    stages {
        stage('Deploy') {
            when {
              expression {
                currentBuild.result == null || currentBuild.result == 'SUCCESS' // ①
              }
            }
            steps {
                sh 'make publish'
            }
        }
    }
}
// Script //
node {
    /* .. snip .. */
    stage('Deploy') {
        if (currentBuild.result == null || currentBuild.result == 'SUCCESS') { // ①
            sh 'make publish'
        }
    }
    /* .. snip .. */
}
```
1. Accessing the `currentBuild.result` variable allows the Pipeline to
determine if there were any test failures. In which case, the value would be
`UNSTABLE`.

Assuming everything has executed successfully in the example Jenkins Pipeline,
each successful Pipeline run will have associated build artifacts archived,
test results reported upon and the full console output all in Jenkins.

A Scripted Pipeline can include conditional tests (shown above), loops,
try/catch/finally blocks and even functions. The next section will cover this
advanced Scripted Pipeline syntax in more detail.

## Working with your Jenkinsfile

The following sections provide details about handling:

* specific Pipeline syntax in your `Jenkinsfile` and
* features and functionality of Pipeline syntax which are essential in building
  your application or Pipeline project.

### Using environment variables

Jenkins Pipeline exposes environment variables via the global variable `env`,
which is available from anywhere within a `Jenkinsfile`. The full list of
environment variables accessible from within Jenkins Pipeline is documented at
$\{YOUR_JENKINS_URL}/pipeline-syntax/globals#env and includes:

* **BUILD_ID**\
The current build ID, identical to BUILD_NUMBER for builds created in Jenkins versions 1.597+
* **BUILD_NUMBER**\
The current build number, such as "153"
* **BUILD_TAG**\
String of jenkins-$\{JOB_NAME}-$\{BUILD_NUMBER}. Convenient to put into a resource file, a jar file, etc for easier identification
* **BUILD_URL**\
The URL where the results of this build can be found (for example <span>http://</span>buildserver/jenkins/job/MyJobName/17/ )
* **EXECUTOR_NUMBER**\
The unique number that identifies the current executor (among executors of the same machine) performing this build. This is the number you see in the "build executor status", except that the number starts from 0, not 1
* **JAVA_HOME**\
If your job is configured to use a specific JDK, this variable is set to the JAVA_HOME of the specified JDK. When this variable is set, PATH is also updated to include the bin subdirectory of JAVA_HOME
* **JENKINS_URL**\
Full URL of Jenkins, such as <span>https://</span>example.com:port/jenkins/ (NOTE: only available if Jenkins URL set in "System Configuration")
* **JOB_NAME**\
Name of the project of this build, such as "foo" or "foo/bar".
* **NODE_NAME**\
The name of the node the current build is running on. Set to 'master' for the Jenkins controller.
* **WORKSPACE**\
The absolute path of the workspace

Referencing or using these environment variables can be accomplished like
accessing any key in a Groovy
[Map](http://groovy-lang.org/syntax.html#_maps),
for example:

```pipeline
// Declarative //
pipeline {
    agent any
    stages {
        stage('Example') {
            steps {
                echo "Running ${env.BUILD_ID} on ${env.JENKINS_URL}"
            }
        }
    }
}
// Script //
node {
    echo "Running ${env.BUILD_ID} on ${env.JENKINS_URL}"
}
```

#### Setting environment variables

Setting an environment variable within a Jenkins Pipeline is accomplished
differently depending on whether Declarative or Scripted Pipeline is used.

Declarative Pipeline supports an [environment](syntax#environment)
directive, whereas users of Scripted Pipeline must use the `withEnv` step.

```pipeline
// Declarative //
pipeline {
    agent any
    environment { // ①
        CC = 'clang'
    }
    stages {
        stage('Example') {
            environment { // ②
                DEBUG_FLAGS = '-g'
            }
            steps {
                sh 'printenv'
            }
        }
    }
}
// Script //
node {
    /* .. snip .. */
    withEnv(["PATH+MAVEN=${tool 'M3'}/bin"]) {
        sh 'mvn -B verify'
    }
}
```
1. An `environment` directive used in the top-level `pipeline` block will
apply to all steps within the Pipeline.
2. An `environment` directive defined within a `stage` will only apply the
given environment variables to steps within the `stage`.

#### Setting environment variables dynamically

Environment variables can be set at run time and can be used by shell scripts (`sh`), Windows batch scripts (`bat`) and PowerShell scripts (`powershell`).
Each script can either `returnStatus` or `returnStdout`.
[More information on scripts](/doc/pipeline/steps/workflow-durable-task-step).

Below is an example in a declarative pipeline using `sh` (shell) with both `returnStatus` and `returnStdout`.

```pipeline
// Declarative //
pipeline {
    agent any // ①
    environment {
        // Using returnStdout
        CC = """${sh(
                returnStdout: true,
                script: 'echo "clang"'
            )}""" // ②
        // Using returnStatus
        EXIT_STATUS = """${sh(
                returnStatus: true,
                script: 'exit 1'
            )}"""
    }
    stages {
        stage('Example') {
            environment {
                DEBUG_FLAGS = '-g'
            }
            steps {
                sh 'printenv'
            }
        }
    }
}
// Script //
```
1. An `agent` must be set at the top level of the pipeline. This will fail if agent is set as `agent none`.
2. When using `returnStdout` a trailing whitespace will be appended to the returned string. Use `.trim()` to remove this.

### Handling credentials

Credentials
link:../../using/using-credentials#configuring-credentials[configured in
Jenkins] can be handled in Pipelines for immediate use. Read more about using
credentials in Jenkins on the link:../../using/using-credentials[Using
credentials] page.

**The correct way to handle credentials in Jenkins**

video::yfjtMIDgmfs[youtube,width=800,height=420]

#### For secret text, usernames and passwords, and secret files

Jenkins' declarative Pipeline syntax has the `credentials()` helper method (used
within the [`environment`](syntax#environment) directive) which supports
[secret text](#secret-text), &lt;&lt;#usernames-and-passwords,username and
password>>, as well as [secret file](#secret-files) credentials. If you want to
handle other types of credentials, refer to the &lt;&lt;#for-other-credential-types,
For other credential types>> section (below).

##### Secret text

The following Pipeline code shows an example of how to create a Pipeline using
environment variables for secret text credentials.

In this example, two secret text credentials are assigned to separate
environment variables to access Amazon Web Services (AWS). These credentials
would have been configured in Jenkins with their respective credential IDs\
`jenkins-aws-secret-key-id` and `jenkins-aws-secret-access-key`.

```pipeline
// Declarative //
pipeline {
    agent {
        // Define agent details here
    }
    environment {
        AWS_ACCESS_KEY_ID     = credentials('jenkins-aws-secret-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('jenkins-aws-secret-access-key')
    }
    stages {
        stage('Example stage 1') {
            steps {
                // // ①
            }
        }
        stage('Example stage 2') {
            steps {
                // // ②
            }
        }
    }
}
// Script //
```
1. You can reference the two credential environment variables (defined in this
Pipeline’s [`environment`](syntax#environment) directive), within this stage’s
steps using the syntax `$AWS_ACCESS_KEY_ID` and `$AWS_SECRET_ACCESS_KEY`. For
example, here you can authenticate to AWS using the secret text credentials
assigned to these credential variables.\
To maintain the security and anonymity of these credentials, if the job
displays the value of these credential variables from within the Pipeline (e.g.
`echo $AWS_SECRET_ACCESS_KEY`), Jenkins only returns the value <q>+******+</q> to
reduce the risk of secret information being disclosed to the console output and any
logs. Any sensitive information in credential IDs themselves (such as usernames)
are also returned as <q>+******+</q> in the Pipeline run’s output.\
This only reduces the risk of ***accidental exposure***.  It does
not prevent a malicious user from capturing the credential value
by other means. A Pipeline that uses credentials can also disclose
those credentials.  Don’t allow untrusted Pipeline jobs to use trusted
credentials.
2. In this Pipeline example, the credentials assigned to the two `AWS_...`
environment variables are scoped globally for the entire Pipeline, so these
credential variables could also be used in this stage’s steps. If, however, the
`environment` directive in this Pipeline were moved to a specific stage (as is
the case in the [Usernames and passwords](#usernames-and-passwords) Pipeline
example below), then these `AWS_...` environment variables would only be scoped
to the steps in that stage.

**💡 TIP**\
Storing static AWS keys in Jenkins credentials is not very secure.
If you can run Jenkins itself in AWS (at least the agent),
it is preferable to use IAM roles for a [computer](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html)
or [EKS service account](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html).
It is also possible to use [web identity federation](https://github.com/jenkinsci/oidc-provider-plugin#accessing-aws).

##### Usernames and passwords

The following Pipeline code snippets show an example of how to create a Pipeline
using environment variables for username and password credentials.

In this example, username and password credentials are assigned to environment
variables to access a Bitbucket repository in a common account or team for your
organization; these credentials would have been configured in Jenkins with the
credential ID `jenkins-bitbucket-common-creds`.

When setting the credential environment variable in the &lt;&lt;syntax#environment,
`environment`>> directive:

```groovy
environment {
    BITBUCKET_COMMON_CREDS = credentials('jenkins-bitbucket-common-creds')
}
```

this actually sets the following three environment variables:

* `BITBUCKET_COMMON_CREDS` - contains a username and a password separated by a
  colon in the format `username:password`.
* `BITBUCKET_COMMON_CREDS_USR` - an additional variable containing the username
  component only.
* `BITBUCKET_COMMON_CREDS_PSW` - an additional variable containing the password
  component only.

<dl><dt><strong>📌 NOTE</strong></dt><dd>

By convention, variable names for environment variables are typically specified
in capital case, with individual words separated by underscores. You can,
however, specify any legitimate variable name using lower case characters. Bear
in mind that the additional environment variables created by the `credentials()`
method (above) will always be appended with `_USR` and `_PSW` (i.e. in the
format of an underscore followed by three capital letters).
</dd></dl>

The following code snippet shows the example Pipeline in its entirety:

```pipeline
// Declarative //
pipeline {
    agent {
        // Define agent details here
    }
    stages {
        stage('Example stage 1') {
            environment {
                BITBUCKET_COMMON_CREDS = credentials('jenkins-bitbucket-common-creds')
            }
            steps {
                // // ①
            }
        }
        stage('Example stage 2') {
            steps {
                // // ②
            }
        }
    }
}
// Script //
```
1. The following credential environment variables (defined in this Pipeline’s
[`environment`](syntax#environment) directive) are available within this
stage’s steps and can be referenced using the syntax:
   * `$BITBUCKET_COMMON_CREDS`
   * `$BITBUCKET_COMMON_CREDS_USR`
   * `$BITBUCKET_COMMON_CREDS_PSW`

+
For example, here you can authenticate to Bitbucket with the username and
password assigned to these credential variables.\
To maintain the security and anonymity of these credentials, if the job
displays the value of these credential variables from within the Pipeline the
same behavior described in the [Secret text](#secret-text) example above
applies to these username and password credential variable types too.\
This only reduces the risk of ***accidental exposure***.  It does
not prevent a malicious user from capturing the credential value
by other means. A Pipeline that uses credentials can also disclose
those credentials.  Don’t allow untrusted Pipeline jobs to use trusted
credentials.
&lt;2> In this Pipeline example, the credentials assigned to the three
`BITBUCKET_COMMON_CREDS...` environment variables are scoped only to `Example
stage 1`, so these credential variables are not available for use in this
`Example stage 2` stage’s steps. If, however, the `environment` directive in
this Pipeline were moved immediately within the &lt;&lt;syntax#declarative-pipeline,
`pipeline`>> block (as is the case in the [Secret text](#secret-text) Pipeline
example above), then these `BITBUCKET_COMMON_CREDS...` environment variables
would be scoped globally and could be used in any stage’s steps.

##### Secret files

A secret file is a credential which is stored in a file and uploaded to Jenkins.
Secret files are used for credentials that are:

* too unwieldy to enter directly into Jenkins, and/or
* in binary format, such as a GPG file.

In this example, we use a Kubernetes config file that has been configured as a
secret file credential named `my-kubeconfig`.

```pipeline
// Declarative //
pipeline {
    agent {
        // Define agent details here
    }
    environment {
        // The MY_KUBECONFIG environment variable will be assigned
        // the value of a temporary file.  For example:
        //   /home/user/.jenkins/workspace/cred_test@tmp/secretFiles/546a5cf3-9b56-4165-a0fd-19e2afe6b31f/kubeconfig.txt
        MY_KUBECONFIG = credentials('my-kubeconfig')
    }
    stages {
        stage('Example stage 1') {
            steps {
                sh("kubectl --kubeconfig $MY_KUBECONFIG get pods")
            }
        }
    }
}
// Script //
```

#### For other credential types

If you need to set credentials in a Pipeline for anything other than secret
text, usernames and passwords, or secret files
([above](#for-secret-text-usernames-and-passwords-and-secret-files)) - i.e SSH
keys or certificates, then use Jenkins' **Snippet Generator** feature, which you
can access through Jenkins' classic UI.

To access the **Snippet Generator** for your Pipeline project/item:

1. From the Jenkins home page (i.e. the Dashboard of Jenkins' classic UI), click
  the name of your Pipeline project/item.
2. On the left, click **Pipeline Syntax** and ensure that the **Snippet Generator**
  link is in bold at the top-left. (If not, click its link.)
3. From the **Sample Step** field, choose *withCredentials: Bind credentials to
  variables*.
4. Under **Bindings**, click **Add** and choose from the dropdown:
   * **SSH User Private Key** - to handle
       link:http://www.snailbook.com/protocols.html[SSH public/private key pair
       credentials], from which you can specify:
     * **Key File Variable** - the name of the environment variable that will be
          bound to these credentials. Jenkins actually assigns this temporary
          variable to the secure location of the private key file required in the SSH
          public/private key pair authentication process.
     * **Passphrase Variable** ( _Optional_ ) - the name of the environment variable
          that will be bound to the
          [passphrase](https://tools.ietf.org/html/rfc4251#section-9.4.4)
          associated with the SSH public/private key pair.
     * **Username Variable** ( _Optional_ ) - the name of the environment variable
          that will be bound to username associated with the SSH public/private key
          pair.
     * **Credentials** - choose the SSH public/private key credentials stored in
          Jenkins. The value of this field is the credential ID, which Jenkins writes
          out to the generated snippet.
   * **Certificate** - to handle link:https://tools.ietf.org/html/rfc7292[PKCS#12
       certificates], from which you can specify:
     * **Keystore Variable** - the name of the environment variable that will be
          bound to these credentials. Jenkins actually assigns this temporary
          variable to the secure location of the certificate’s keystore required in
          the certificate authentication process.
     * **Password Variable** ( _Optional_ ) - the name of the environment variable
          that will be bound to the password associated with the certificate.
     * **Alias Variable** ( _Optional_ ) - the name of the environment variable that
          will be bound to the unique alias associated with the certificate.
     * **Credentials** - choose the certificate credentials stored in Jenkins. The
          value of this field is the credential ID, which Jenkins writes out to the
          generated snippet.
   * **Docker client certificate** - to handle Docker Host Certificate
       Authentication.
5. Click **Generate Pipeline Script** and Jenkins generates a
  `withCredentials( ... ) { ... }` Pipeline step snippet for the credentials you
  specified, which you can then copy and paste into your Declarative or Scripted
  Pipeline code.\
  **Notes:**
   * The **Credentials** fields (above) show the names of credentials
     configured in Jenkins. However, these values are converted to credential IDs
     after clicking **Generate Pipeline Script**. <a name="withcredentials-script-examples"></a>
   * To combine more than one credential in a single `withCredentials( ... )
     { ... }` Pipeline step, see &lt;&lt;#combining-credentials-in-one-step,Combining
     credentials in one step>> (below) for details.

**SSH User Private Key example**

```groovy
withCredentials(bindings: [sshUserPrivateKey(credentialsId: 'jenkins-ssh-key-for-abc', \
                                             keyFileVariable: 'SSH_KEY_FOR_ABC', \
                                             passphraseVariable: '', \
                                             usernameVariable: '')]) {
  // some block
}
```
The optional `passphraseVariable` and `usernameVariable` definitions can be
deleted in your final Pipeline code.

**Certificate example**

```groovy
withCredentials(bindings: [certificate(aliasVariable: '', \
                                       credentialsId: 'jenkins-certificate-for-xyz', \
                                       keystoreVariable: 'CERTIFICATE_FOR_XYZ', \
                                       passwordVariable: 'XYZ-CERTIFICATE-PASSWORD')]) {
  // some block
}
```
The optional `aliasVariable` and `passwordVariable` variable definitions can be
deleted in your final Pipeline code.

The following code snippet shows an example Pipeline in its entirety, which
implements the **SSH User Private Key** and **Certificate** snippets above:

```pipeline
// Declarative //
pipeline {
    agent {
        // define agent details
    }
    stages {
        stage('Example stage 1') {
            steps {
                withCredentials(bindings: [sshUserPrivateKey(credentialsId: 'jenkins-ssh-key-for-abc', \
                                                             keyFileVariable: 'SSH_KEY_FOR_ABC')]) {
                  // // ①
                }
                withCredentials(bindings: [certificate(credentialsId: 'jenkins-certificate-for-xyz', \
                                                       keystoreVariable: 'CERTIFICATE_FOR_XYZ', \
                                                       passwordVariable: 'XYZ-CERTIFICATE-PASSWORD')]) {
                  // // ②
                }
            }
        }
        stage('Example stage 2') {
            steps {
                // // ③
            }
        }
    }
}
// Script //
```
1. Within this step, you can reference the credential environment variable with
the syntax `$SSH_KEY_FOR_ABC`. For example, here you can authenticate to the ABC
application with its configured SSH public/private key pair credentials, whose
**SSH User Private Key** file is assigned to `$SSH_KEY_FOR_ABC`.
2. Within this step, you can reference the credential environment variable with
the syntax `$CERTIFICATE_FOR_XYZ` and\
`$XYZ-CERTIFICATE-PASSWORD`. For example, here you can authenticate to the XYZ
application with its configured certificate credentials, whose **Certificate**'s
keystore file and password are assigned to the variables `$CERTIFICATE_FOR_XYZ`
and `$XYZ-CERTIFICATE-PASSWORD`, respectively.
3. In this Pipeline example, the credentials assigned to the
`$SSH_KEY_FOR_ABC`, `$CERTIFICATE_FOR_XYZ` and\
`$XYZ-CERTIFICATE-PASSWORD` environment variables are scoped only within their
respective `withCredentials( ... ) { ... }` steps, so these credential variables
are not available for use in this `Example stage 2` stage’s steps.

To maintain the security and anonymity of these credentials, if you attempt to
retrieve the value of these credential variables from within these
`withCredentials( ... ) { ... }` steps, the same behavior described in the
[Secret text](#secret-text) example (above) applies to these SSH public/private
key pair credential and certificate variable types too.\
This only reduces the risk of ***accidental exposure***.  It does
not prevent a malicious user from capturing the credential value
by other means. A Pipeline that uses credentials can also disclose
those credentials.  Don’t allow untrusted Pipeline jobs to use trusted
credentials.

<dl><dt><strong>📌 NOTE</strong></dt><dd>

* When using the **Sample Step** field’s *withCredentials: Bind credentials to
variables* option in the **Snippet Generator**, only credentials which your
current Pipeline project/item has access to can be selected from any
**Credentials** field’s list. While you can manually write a
`withCredentials( ... ) { ... }` step for your Pipeline (like the examples
[above](#withcredentials-script-examples)), using the **Snippet Generator** is
recommended to avoid specifying credentials that are out of scope for this
Pipeline project/item, which when run, will make the step fail.
* You can also use the **Snippet Generator** to generate `withCredentials( ... )
{ ... }` steps to handle secret text, usernames and passwords and secret files.
However, if you only need to handle these types of credentials, it is
recommended you use the relevant procedure described in the section
[above](#for-secret-text-usernames-and-passwords-and-secret-files) for improved
Pipeline code readability.
* The use of ***single-quotes*** instead of  ***double-quotes*** to define the `script`
(the implicit parameter to `sh`) in Groovy above.
The single-quotes will cause the secret to be expanded by the shell as an environment variable.
The double-quotes are potentially less secure as the secret is interpolated by Groovy,
and so typical operating system process listings will accidentally disclose it :
```
node {
  withCredentials([string(credentialsId: 'mytoken', variable: 'TOKEN')]) {
    sh /* WRONG! */ """
      set +x
      curl -H 'Token: $TOKEN' https://some.api/
    """
    sh /* CORRECT */ '''
      set +x
      curl -H 'Token: $TOKEN' https://some.api/
    '''
  }
}
```
</dd></dl>

##### Combining credentials in one step

Using the **Snippet Generator**, you can make multiple credentials available
within a single `withCredentials( ... ) { ... }` step by doing the following:

1. From the Jenkins home page (i.e. the Dashboard of Jenkins' classic UI), click
  the name of your Pipeline project/item.
2. On the left, click **Pipeline Syntax** and ensure that the **Snippet Generator**
  link is in bold at the top-left. (If not, click its link.)
3. From the **Sample Step** field, choose *withCredentials: Bind credentials to
  variables*.
4. Click **Add** under **Bindings**.
5. Choose the credential type to add to the `withCredentials( ... ) { ... }` step
  from the dropdown list.
6. Specify the credential **Bindings** details. Read more above these in the
  procedure under [For other credential types](#for-other-credential-types)
  (above).
7. Repeat from "Click **Add** ..." (above) for each (set of) credential/s to add to
  the `withCredentials( ... ) { ... }` step.
8. Click **Generate Pipeline Script** to generate the final
  `withCredentials( ... ) { ... }` step snippet.

### String interpolation

Jenkins Pipeline uses rules identical to [Groovy](http://groovy-lang.org) for
string interpolation. Groovy’s String interpolation support can be confusing to
many newcomers to the language. While Groovy supports declaring a string with
either single quotes, or double quotes, for example:

```groovy
def singlyQuoted = 'Hello'
def doublyQuoted = "World"
```

Only the latter string will support the dollar-sign (`$`) based string
interpolation, for example:

```groovy
def username = 'Jenkins'
echo 'Hello Mr. ${username}'
echo "I said, Hello Mr. ${username}"
```

Would result in:

```
Hello Mr. ${username}
I said, Hello Mr. Jenkins
```

Understanding how to use string interpolation is vital for using some of
Pipeline’s more advanced features.

#### Interpolation of sensitive environment variables

======
Groovy string interpolation should **never** be used with credentials.
======

Groovy string interpolation can leak sensitive environment variables (i.e. credentials, see: [Handling credentials](#handling-credentials)).
This is because the sensitive environment variable will be interpolated during Groovy evaluation, and the environment variable’s value could be made available earlier than intended, resulting in sensitive data leaking in various contexts.

For example, consider a sensitive environment variable passed to the `sh` step.

```pipeline
// Declarative //
pipeline {
    agent any
    environment {
        EXAMPLE_CREDS = credentials('example-credentials-id')
    }
    stages {
        stage('Example') {
            steps {
                /* WRONG! */
                sh("curl -u ${EXAMPLE_CREDS_USR}:${EXAMPLE_CREDS_PSW} https://example.com/")
            }
        }
    }
}
// Script //
```
Should Groovy perform the interpolation, the sensitive value will be injected directly into the arguments of the `sh` step, which among other issues, means that the literal value will be visible as an argument to the `sh` process on the agent in OS process listings.
Using single-quotes instead of double-quotes when referencing these sensitive environment variables prevents this type of leaking.

```pipeline
// Declarative //
pipeline {
    agent any
    environment {
        EXAMPLE_CREDS = credentials('example-credentials-id')
    }
    stages {
        stage('Example') {
            steps {
                /* CORRECT */
                sh('curl -u $EXAMPLE_CREDS_USR:$EXAMPLE_CREDS_PSW https://example.com/')
            }
        }
    }
}
// Script //
```

#### Injection via interpolation

======
Groovy string interpolation can inject rogue commands into command interpreters via special characters.
======

Another note of caution. Using Groovy string interpolation for user-controlled variables with steps that pass their arguments to command interpreters such as the `sh`, `bat`, `powershell`, or `pwsh` steps can result in problems analogous to SQL injection.
This occurs when a user-controlled variable (generally an environment variable, usually a parameter passed to the build) that contains special characters (e.g. `/ \ $ & % ^ > < | ;`) is passed to the `sh`, `bat`, `powershell`, or `pwsh` steps using Groovy interpolation.
For a simple example:

```pipeline
// Declarative //
pipeline {
  agent any
  parameters {
    string(name: 'STATEMENT', defaultValue: 'hello; ls /', description: 'What should I say?')
  }
  stages {
    stage('Example') {
      steps {
        /* WRONG! */
        sh("echo ${STATEMENT}")
      }
    }
  }
}
// Script //
```

In this example, the argument to the `sh` step is evaluated by Groovy, and `STATEMENT` is interpolated directly into the argument as if `sh('echo hello; ls /')` has been written in the Pipeline.
When this is processed on the agent, rather than echoing the value `hello; ls /`, it will echo `hello` then proceed to list the entire root directory of the agent.
Any user able to control a variable interpolated by such a step would be able to make the `sh` step run arbitrary code on the agent.
To avoid this problem, make sure arguments to steps such as `sh` or `bat` that reference parameters or other user-controlled environment variables use single quotes to avoid Groovy interpolation.

```pipeline
// Declarative //
pipeline {
  agent any
  parameters {
    string(name: 'STATEMENT', defaultValue: 'hello; ls /', description: 'What should I say?')
  }
  stages {
    stage('Example') {
      steps {
        /* CORRECT */
        sh('echo ${STATEMENT}')
      }
    }
  }
}
// Script //
```

Credential mangling is another issue that can occur when credentials that contain special characters are passed to a step using Groovy interpolation.
When the credential value is mangled, it is no longer valid and will no longer be masked in the console log.

```pipeline
// Declarative //
pipeline {
  agent any
  environment {
    EXAMPLE_KEY = credentials('example-credentials-id') // Secret value is 'sec%ret'
  }
  stages {
    stage('Example') {
      steps {
          /* WRONG! */
          bat "echo ${EXAMPLE_KEY}"
      }
    }
  }
}
// Script //
```

Here, the `bat` step receives `echo sec%ret` and the Windows batch shell will simply drop the `%` and print out the value `secret`.
Because there is a single character difference, the value `secret` will not be masked.
Though the value is not the same as the actual credential, this is still a significant exposure of sensitive information.
Again, single-quotes avoids this issue.

```pipeline
// Declarative //
pipeline {
  agent any
  environment {
    EXAMPLE_KEY = credentials('example-credentials-id') // Secret value is 'sec%ret'
  }
  stages {
    stage('Example') {
      steps {
          /* CORRECT */
          bat 'echo %EXAMPLE_KEY%'
      }
    }
  }
}
// Script //
```

### Handling parameters

Declarative Pipeline supports parameters out-of-the-box, allowing the Pipeline
to accept user-specified parameters at runtime via the &lt;&lt;syntax#parameters,
parameters directive>>. Configuring parameters with Scripted Pipeline is done
with the `properties` step, which can be found in the Snippet Generator.

If you configured your pipeline to accept parameters using the *Build with
Parameters* option, those parameters are accessible as members of the `params`
variable.

Assuming that a String parameter named "Greeting" has been configured in the
`Jenkinsfile`, it  can access that parameter via `${params.Greeting}`:

```pipeline
// Declarative //
pipeline {
    agent any
    parameters {
        string(name: 'Greeting', defaultValue: 'Hello', description: 'How should I greet the world?')
    }
    stages {
        stage('Example') {
            steps {
                echo "${params.Greeting} World!"
            }
        }
    }
}
// Script //
properties([parameters([string(defaultValue: 'Hello', description: 'How should I greet the world?', name: 'Greeting')])])

node {
    echo "${params.Greeting} World!"
}
```

### Handling failure

Declarative Pipeline supports robust failure handling by default via its
[post section](syntax#post) which allows declaring a number of different
"post conditions" such as: `always`, `unstable`, `success`, `failure`, and
`changed`. The [Pipeline Syntax](syntax#post) section provides more detail on
how to use the various post conditions.

```pipeline
// Declarative //
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'make check'
            }
        }
    }
    post {
        always {
            junit '**/target/*.xml'
        }
        failure {
            mail to: team@example.com, subject: 'The Pipeline failed :('
        }
    }
}
// Script //
node {
    /* .. snip .. */
    stage('Test') {
        try {
            sh 'make check'
        }
        finally {
            junit '**/target/*.xml'
        }
    }
    /* .. snip .. */
}
```

Scripted Pipeline however relies on Groovy’s built-in `try`/`catch`/`finally` semantics
for handling failures during execution of the Pipeline.

In the [test](#test) example above, the `sh` step was modified to never return a
non-zero exit code (`sh 'make check || true'`). This approach, while valid,
means the following stages need to check `currentBuild.result` to know if
there has been a test failure or not.

An alternative way of handling this, which preserves the early-exit behavior of
failures in Pipeline, while still giving `junit` the chance to capture test
reports, is to use a series of `try`/`finally` blocks:

### Using multiple agents

In all the previous examples, only a single agent has been used. This means
Jenkins will allocate an executor wherever one is available, regardless of how
it is labeled or configured. Not only can this behavior be overridden, but
Pipeline allows utilizing multiple agents in the Jenkins environment from
within the _same_ `Jenkinsfile`, which can helpful for more advanced use-cases
such as  executing builds/tests across multiple platforms.

In the example below, the "Build" stage will be performed on one agent and the
built results will be reused on two subsequent agents, labelled "linux" and
"windows" respectively, during the "Test" stage.

```pipeline
// Declarative //
pipeline {
    agent none
    stages {
        stage('Build') {
            agent any
            steps {
                checkout scm
                sh 'make'
                stash includes: '**/target/*.jar', name: 'app' // ①
            }
        }
        stage('Test on Linux') {
            agent { // ②
                label 'linux'
            }
            steps {
                unstash 'app' // ③
                sh 'make check'
            }
            post {
                always {
                    junit '**/target/*.xml'
                }
            }
        }
        stage('Test on Windows') {
            agent {
                label 'windows'
            }
            steps {
                unstash 'app'
                bat 'make check' // ④
            }
            post {
                always {
                    junit '**/target/*.xml'
                }
            }
        }
    }
}
// Script //
stage('Build') {
    node {
        checkout scm
        sh 'make'
        stash includes: '**/target/*.jar', name: 'app' // ①
    }
}

stage('Test') {
    node('linux') { // ②
        checkout scm
        try {
            unstash 'app' // ③
            sh 'make check'
        }
        finally {
            junit '**/target/*.xml'
        }
    }
    node('windows') {
        checkout scm
        try {
            unstash 'app'
            bat 'make check' // ④
        }
        finally {
            junit '**/target/*.xml'
        }
    }
}
```
1. The `stash` step allows capturing files matching an inclusion pattern
(`***/target/**.jar`) for reuse within the _same_ Pipeline. Once the Pipeline has
completed its execution, stashed files are deleted from the Jenkins controller.
2. The parameter in `agent`/`node` allows for any valid Jenkins label
expression. Consult the [Pipeline Syntax](syntax) section for more details.
3. `unstash` will retrieve the named "stash" from the Jenkins controller into the
Pipeline’s current workspace.
4. The `bat` script allows for executing batch scripts on Windows-based
platforms.

### Optional step arguments

Pipeline follows the Groovy language convention of allowing parentheses to be
omitted around method arguments.

Many Pipeline steps also use the named-parameter syntax as a shorthand for
creating a Map in Groovy, which uses the syntax `[key1: value1, key2: value2]`.
Making statements like the following functionally equivalent:

```groovy
git url: 'git://example.com/amazing-project.git', branch: 'master'
git([url: 'git://example.com/amazing-project.git', branch: 'master'])
```

For convenience, when calling steps taking only one parameter (or only one
mandatory parameter), the parameter name may be omitted, for example:

```groovy
sh 'echo hello' /* short form  */
sh([script: 'echo hello'])  /* long form */
```

### Advanced Scripted Pipeline

Scripted Pipeline is a domain-specific language
footnote:dsl[https://en.wikipedia.org/wiki/Domain-specific_language]
based on Groovy, most
[Groovy syntax](http://groovy-lang.org/semantics.html)
can be used in Scripted Pipeline without modification.

#### Parallel execution

The example in the [section above](#using-multiple-agents) runs tests across two
different platforms in a linear series. In practice, if the `make check`
execution takes 30 minutes to complete, the "Test" stage would now take 60
minutes to complete!

Fortunately, Pipeline has built-in functionality for executing portions of
Scripted Pipeline in parallel, implemented in the aptly named `parallel` step.

Refactoring the example above to use the `parallel` step:

```pipeline
// Script //
stage('Build') {
    /* .. snip .. */
}

stage('Test') {
    parallel linux: {
        node('linux') {
            checkout scm
            try {
                unstash 'app'
                sh 'make check'
            }
            finally {
                junit '**/target/*.xml'
            }
        }
    },
    windows: {
        node('windows') {
            /* .. snip .. */
        }
    }
}
// Declarative not yet implemented //
```

Instead of executing the tests on the "linux" and "windows" labelled nodes in
series, they will now execute in parallel assuming the requisite capacity
exists in the Jenkins environment.
