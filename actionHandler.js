const core = require('@actions/core')
const github = require('@actions/github')
const {
  getRepositoryUri,
  buildImage,
  pushImage,
  tagImage,
} = require('./main')


const run = async () => {
  try {
    const REPO = core.getInput('ecr_repository')
    console.log(`Looking for repo ${REPO}`)

    const tags = core.getInput('tags').split(',')

    const params = {
      repositoryNames: [REPO],
      tags,
    }

    console.log('Assuming role')
    await assumeRole({
      RoleArn: process.env.AWS_ROLE_ARN,
      RoleSessionName: 'aws-ecr-push-action-ci',
    })

    const output = await getRepositoryUri(params)
    const repositoryUri = output.repositories[0].repositoryUri
    core.setOutput('repository_uri', repositoryUri);
    await buildImage(params)
    tags.forEach(async (tag) => {
      await tagImage({ ...params, tag })
    })
    await pushImage(params)
  } catch(e) {
    console.error(e)
  }
}

run()
