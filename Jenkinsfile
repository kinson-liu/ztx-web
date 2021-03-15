env.GIT_URL="https://github.com/lqs429521992/ztx-web"
node {
    if ("${BRANCH_NAME}" == 'main') {
        echo "进入main分支"
    }
    stage('prepare') { 
          git branch: '${BRANCH_NAME}', credentialsId: '21322365-adab-489f-bc70-8d7792f43b94', url: "${GIT_URL}"
    }
    stage(" complie ") {
        echo "进入编译阶段"
			  // sh "cd ${WORKSPACE};npm install;npm run build"
    }
}
