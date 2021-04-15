pipeline {
    agent {
        label "jenkins-build"
    }
    stages {
        stage("test") {
            steps {
                container("test k8s") {
                    sh "docker info"
                }
            }
        }
    }
}