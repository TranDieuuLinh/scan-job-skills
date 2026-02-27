pipeline {
    agent any


    options {
        skipDefaultCheckout()       
        disableConcurrentBuilds()   
        buildDiscarder(logRotator(numToKeepStr: '10')) 
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'b5057049-8fed-4547-85d6-3b5cd44c66b8',
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_PASSWORD'
                )]) {
                    dir('/home/dieulinh/apps/chrome-backend/scan-job-skills') {

                        sh '''
                        git remote set-url origin https://$GIT_USERNAME:$GIT_PASSWORD@github.com/TranDieuuLinh/scan-job-skills.git
                        git fetch --all
                        git reset --hard origin/main
                        '''

                        dir('backend') {
                            sh '''
                            ./.venv/bin/pip install -r requirements.txt
                            pm2 restart job-api || pm2 start "source .venv/bin/activate && uvicorn src.main:app --host 0.0.0.0 --port 3002" --name job-api
                            '''
                        }
                    }
                }
            }
        }
    }
}