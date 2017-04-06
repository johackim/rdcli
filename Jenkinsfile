pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh '''make install
make build
'''
      }
    }
    stage('Test') {
      steps {
        sh 'make test'
      }
    }
  }
}